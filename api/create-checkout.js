const Stripe = require("stripe");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const PRICE_IDS = {
    starter:    "price_1T5lnp4r7NStDJHniYptJXAh",
    pro:        "price_1T5lpJ4r7NStDJHnNkV9zxjp",
    enterprise: "price_1T5lpo4r7NStDJHnm9MEfQRO",
  };

  const { plan } = req.body;
  const priceId = PRICE_IDS[plan];

  if (!priceId) return res.status(400).json({ error: "Plan invalide" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://loqar.vercel.app?success=true",
      cancel_url:  "https://loqar.vercel.app?cancelled=true",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
