import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const LINK_TO_PLAN = {
  "https://buy.stripe.com/28E8wPalNdhB9iw2z97kc06": "starter",
  "https://buy.stripe.com/dRmeVdctV7XhgKY2z97kc07": "pro",
  "https://buy.stripe.com/5kQ9AT79Bcdx1Q4ehR7kc08": "enterprise",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // ── Caution (dépôt) ─────────────────────────────────────────────────────
    if (session.metadata?.type === "deposit") {
      const rental_id = session.metadata.rental_id;
      const intent_id = session.payment_intent;
      if (rental_id && intent_id) {
        await supabase.from("rentals")
          .update({ stripe_deposit_intent_id: intent_id, stripe_deposit_status: "authorized" })
          .eq("id", rental_id);
        console.log(`🔒 Caution bloquée: rental ${rental_id} → ${intent_id}`);
      }
      return res.json({ received: true });
    }

    // ── Abonnement plan ──────────────────────────────────────────────────────
    const email = session.customer_details?.email;
    const paymentLink = session.payment_link;

    if (!email) return res.json({ received: true });

    let plan = "starter";
    if (paymentLink) {
      try {
        const pl = await stripe.paymentLinks.retrieve(paymentLink);
        plan = LINK_TO_PLAN[pl.url] || "starter";
      } catch (e) {
        plan = session.metadata?.plan || "starter";
      }
    }

    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const { error } = await supabase
      .from("profiles")
      .update({ plan, plan_expires_at: expires.toISOString() })
      .eq("email", email);

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "DB update failed" });
    }

    console.log(`✅ Plan updated: ${email} → ${plan}`);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;

    if (email) {
      await supabase
        .from("profiles")
        .update({ plan: "starter", plan_expires_at: null })
        .eq("email", email);
      console.log(`⬇️ Plan downgraded: ${email} → starter`);
    }
  }

  res.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
