import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Token manquant" });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  if (req.method === "GET") {
    const { data: rental, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("portal_token", token)
      .single();

    if (error || !rental) return res.status(404).json({ error: "Contrat introuvable" });

    const { data: history } = await supabase
      .from("rentals")
      .select("id, vehicle_name, start_date, end_date, total, status")
      .eq("client_id", rental.client_id)
      .order("start_date", { ascending: false });

    return res.status(200).json({ rental, history: history || [] });
  }

  if (req.method === "POST") {
    const { data: rental } = await supabase
      .from("rentals")
      .select("status")
      .eq("portal_token", token)
      .single();

    if (!rental || rental.status === "annulée") {
      return res.status(400).json({ error: "Contrat non signable" });
    }
    if (rental.status === "réservée") {
      await supabase.from("rentals").update({ status: "en cours" }).eq("portal_token", token);
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
