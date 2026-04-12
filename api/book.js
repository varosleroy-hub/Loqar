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

    // Notifier l'agence par email (appel direct SendGrid)
    if (profile.email && process.env.SENDGRID_API_KEY) {
      try {
        const clientName = `${first_name} ${last_name}`;
        const vehicleName = `${vehicle?.name || ""} — ${vehicle?.plate || ""}`;
        const emailHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="52" height="52" style="border-radius:12px;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:8px;">Nouvelle demande de réservation</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">${clientName} souhaite réserver via votre page publique</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<table width="100%" style="background:#1A1710;border-radius:12px;border:1px solid #2A2420;" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Client</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${clientName}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Email</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${email}</div></td></tr>
${phone ? `<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Téléphone</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${phone}</div></td></tr>` : ""}
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Véhicule</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${vehicleName}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Dates</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${start_date} → ${end_date}</div></td></tr>
<tr><td style="padding:16px 20px;"><span style="color:#8A8075;font-size:13px;">Total estimé</span><div style="color:#C9A84C;font-weight:700;font-size:18px;margin-top:4px;">${total} €</div></td></tr>
</table>
${notes ? `<div style="background:#1A1710;border-left:3px solid #C9A84C;padding:12px 16px;margin-top:16px;border-radius:0 8px 8px 0;font-size:13px;color:#8A8075;font-style:italic;">"${notes}"</div>` : ""}
<div style="text-align:center;margin-top:32px;display:flex;gap:12px;justify-content:center;">
<a href="https://loqar.fr/api/action?token=${rental.portal_token}&action=confirm" style="display:inline-block;background:#4CAF7D;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none;">✓ Confirmer</a>
<a href="https://loqar.fr/api/action?token=${rental.portal_token}&action=refuse" style="display:inline-block;background:#E8746A;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none;">✕ Refuser</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;">
<div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong> — loqar.fr</div>
</td></tr>
</table></td></tr></table></body></html>`;

        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: profile.email }] }],
            from: { email: "noreply@loqar.fr", name: "Loqar" },
            subject: `Nouvelle réservation — ${vehicleName}`,
            content: [{ type: "text/html", value: emailHtml }],
          }),
        });
      } catch (_) {}
    }

    // Email de confirmation au client
    if (email && process.env.SENDGRID_API_KEY) {
      try {
        const clientName = `${first_name} ${last_name}`;
        const vehicleName = `${vehicle?.name || ""} — ${vehicle?.plate || ""}`;
        const clientEmailHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="52" height="52" style="border-radius:12px;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:8px;">Demande reçue !</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">Bonjour ${first_name}, votre demande a bien été transmise à <strong style="color:#C9A84C;">${profile.agency_name || "l'agence"}</strong>.</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">L'agence va examiner votre demande et vous contactera rapidement pour confirmer votre réservation.</p>
<table width="100%" style="background:#1A1710;border-radius:12px;border:1px solid #2A2420;" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Véhicule demandé</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${vehicleName}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Dates</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${start_date} → ${end_date}</div></td></tr>
<tr><td style="padding:16px 20px;"><span style="color:#8A8075;font-size:13px;">Total estimé</span><div style="color:#C9A84C;font-weight:700;font-size:18px;margin-top:4px;">${total} €</div></td></tr>
</table>
<p style="color:#8A8075;font-size:12px;line-height:1.8;margin:24px 0 0;text-align:center;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;">
<div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong> — loqar.fr</div>
</td></tr>
</table></td></tr></table></body></html>`;

        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: "noreply@loqar.fr", name: "Loqar" },
            subject: `Votre demande de réservation — ${profile.agency_name || "Loqar"}`,
            content: [{ type: "text/html", value: clientEmailHtml }],
          }),
        });
      } catch (_) {}
    }

    return res.status(200).json({ success: true, rental_id: rental.id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
