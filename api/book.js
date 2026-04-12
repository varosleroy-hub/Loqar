import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // ─── GET : infos agence + véhicules disponibles ─────────────────────────────
  if (req.method === "GET") {
    const { slug, start, end } = req.query;
    if (!slug) return res.status(400).json({ error: "Slug manquant" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, agency_name, logo, phone, email, address")
      .eq("booking_slug", slug)
      .single();

    if (!profile) return res.status(404).json({ error: "Agence introuvable" });

    let vehicleQuery = supabase
      .from("vehicles")
      .select("id, name, plate, fuel, transmission, km, price_per_day, year, category, status, photo_url")
      .eq("user_id", profile.id)
      .neq("status", "entretien");

    // Filtrer par disponibilité si dates fournies
    if (start && end) {
      const { data: conflicts } = await supabase
        .from("rentals")
        .select("vehicle_id")
        .eq("user_id", profile.id)
        .in("status", ["en cours", "réservée"])
        .lte("start_date", end)
        .gte("end_date", start);

      const takenIds = (conflicts || []).map(c => c.vehicle_id).filter(Boolean);
      if (takenIds.length > 0) {
        vehicleQuery = vehicleQuery.not("id", "in", `(${takenIds.join(",")})`);
      }
    }

    const { data: vehicles } = await vehicleQuery;
    return res.status(200).json({ agency: profile, vehicles: vehicles || [] });
  }

  // ─── POST : créer une demande de réservation ─────────────────────────────────
  if (req.method === "POST") {
    const { slug, vehicle_id, start_date, end_date, first_name, last_name, email, phone, notes } = req.body || {};

    if (!slug || !vehicle_id || !start_date || !end_date || !first_name || !last_name || !email) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, agency_name, email")
      .eq("booking_slug", slug)
      .single();

    if (!profile) return res.status(404).json({ error: "Agence introuvable" });

    // Vérifier la disponibilité du véhicule
    const { data: conflicts } = await supabase
      .from("rentals")
      .select("id")
      .eq("vehicle_id", vehicle_id)
      .eq("user_id", profile.id)
      .in("status", ["en cours", "réservée"])
      .lte("start_date", end_date)
      .gte("end_date", start_date);

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: "Véhicule non disponible pour ces dates" });
    }

    // Récupérer les infos du véhicule
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("name, plate, price_per_day")
      .eq("id", vehicle_id)
      .single();

    const days = Math.max(1, Math.ceil((new Date(end_date) - new Date(start_date)) / 86400000));
    const total = (vehicle?.price_per_day || 0) * days;

    // Créer ou retrouver le client
    let clientId = null;
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", profile.id)
      .eq("email", email)
      .single();

    if (existing) {
      clientId = existing.id;
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({ user_id: profile.id, first_name, last_name, email, phone: phone || null })
        .select("id")
        .single();
      clientId = newClient?.id;
    }

    // Créer la location en statut "réservée"
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .insert({
        user_id: profile.id,
        client_id: clientId,
        vehicle_id: parseInt(vehicle_id) || vehicle_id,
        client_name: `${first_name} ${last_name}`,
        vehicle_name: `${vehicle?.name || ""} — ${vehicle?.plate || ""}`,
        start_date,
        end_date,
        prix_per_day: vehicle?.price_per_day || 0,
        total,
        notes: notes || null,
        status: "réservée",
        portal_token: crypto.randomUUID(),
      })
      .select()
      .single();

    if (rentalError) return res.status(500).json({ error: rentalError.message || "Erreur lors de la création de la réservation" });

    // Notifier l'agence par email
    try {
      await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_request",
          to: profile.email,
          data: {
            agencyName: profile.agency_name,
            clientName: `${first_name} ${last_name}`,
            clientEmail: email,
            clientPhone: phone || null,
            vehicleName: `${vehicle?.name || ""} — ${vehicle?.plate || ""}`,
            startDate: start_date,
            endDate: end_date,
            total,
            notes: notes || null,
          },
        }),
      });
    } catch (_) {}

    return res.status(200).json({ success: true, rental_id: rental.id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
