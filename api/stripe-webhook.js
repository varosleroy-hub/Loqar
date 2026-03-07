import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Map Stripe Payment Link → plan
const LINK_TO_PLAN = {
  "https://buy.stripe.com/bJe7sL9hJ5P9eCQflV7kc05": "starter",
  "https://buy.stripe.com/14A14n2Tlcdx8esehR7kc03": "pro",
  "https://buy.stripe.com/8x2cN579B7XhcuI8Xx7kc04": "enterprise",
};

// Map price IDs → plan (fallback)
const PRICE_TO_PLAN = {
  starter: "starter",
  pro: "pro",
  enterprise: "enterprise",
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
    const email = session.customer_details?.email;
    const paymentLink = session.payment_link;

    if (!email) return res.json({ received: true });

    // Determine plan from payment link or metadata
    let plan = "starter";
    if (paymentLink) {
      // Fetch payment link details to get URL
      try {
        const pl = await stripe.paymentLinks.retrieve(paymentLink);
        plan = LINK_TO_PLAN[pl.url] || "starter";
      } catch (e) {
        // fallback: check metadata
        plan = session.metadata?.plan || "starter";
      }
    }

    // Calculate expiry (1 month from now)
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    // Update user profile in Supabase
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

    // Get customer email
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
