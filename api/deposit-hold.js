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

  const { rental_id, amount, client_email, vehicle_name, user_id } = req.body;

  if (!rental_id || !amount || amount <= 0) {
    return res.status(400).json({ error: "rental_id et amount requis" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
        metadata: { type: "deposit", rental_id: String(rental_id), user_id: String(user_id) },
      },
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Caution — ${vehicle_name || "Location Loqar"}`,
            description: "Montant bloqué sur votre carte, non débité. Sera libéré à la restitution du véhicule.",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      customer_email: client_email || undefined,
      metadata: { type: "deposit", rental_id: String(rental_id), user_id: String(user_id) },
      success_url: `https://loqar.fr?caution=ok`,
      cancel_url:  `https://loqar.fr?caution=annulee`,
    });

    // Marquer la caution comme "en attente de paiement"
    await supabase.from("rentals")
      .update({ stripe_deposit_status: "pending" })
      .eq("id", rental_id);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("deposit-hold error:", err);
    return res.status(500).json({ error: err.message });
  }
}
