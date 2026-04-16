import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { intent_id, action, rental_id } = req.body;

  if (!intent_id || !action || !rental_id) {
    return res.status(400).json({ error: "intent_id, action et rental_id requis" });
  }
  if (!["capture", "cancel"].includes(action)) {
    return res.status(400).json({ error: "action doit être 'capture' ou 'cancel'" });
  }

  try {
    if (action === "capture") {
      await stripe.paymentIntents.capture(intent_id);
      await supabase.from("rentals")
        .update({ stripe_deposit_status: "captured" })
        .eq("id", rental_id);
      return res.status(200).json({ success: true, status: "captured" });
    } else {
      await stripe.paymentIntents.cancel(intent_id);
      await supabase.from("rentals")
        .update({ stripe_deposit_status: "released" })
        .eq("id", rental_id);
      return res.status(200).json({ success: true, status: "released" });
    }
  } catch (err) {
    console.error("deposit-action error:", err);
    return res.status(500).json({ error: err.message });
  }
}
