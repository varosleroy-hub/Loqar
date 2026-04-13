import { createClient } from "@supabase/supabase-js";

function page(title, message, color = "#C9A84C", emoji = "✓") {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Loqar</title></head>
<body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;padding:40px 24px;max-width:480px;">
  <div style="width:72px;height:72px;border-radius:50%;background:${color}20;border:2px solid ${color};display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:32px;">${emoji}</div>
  <img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:50%;display:block;margin:0 auto 10px;" />
  <div style="font-size:20px;font-weight:700;color:#F5F0E8;margin-bottom:12px;">${title}</div>
  <div style="font-size:14px;color:#8A8075;line-height:1.7;">${message}</div>
  <a href="https://loqar.fr" style="display:inline-block;margin-top:32px;background:#C9A84C;color:#0E0C0A;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Ouvrir Loqar</a>
</div>
</body></html>`;
}

async function sendEmail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY) return;
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@loqar.fr", name: "Loqar" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { token, action } = req.query;

  if (!token || !["confirm", "refuse"].includes(action)) {
    return res.status(400).send(page("Lien invalide", "Ce lien est invalide ou a expiré.", "#E8746A", "✕"));
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: rental } = await supabase
    .from("rentals")
    .select("id, status, client_name, vehicle_name, start_date, end_date, total, client_id, user_id, portal_token")
    .eq("portal_token", token)
    .single();

  if (!rental) {
    return res.status(404).send(page("Introuvable", "Cette réservation n'existe pas ou le lien est expiré.", "#E8746A", "✕"));
  }

  if (rental.status !== "réservée") {
    const msg = rental.status === "en cours"
      ? "Cette réservation a déjà été confirmée."
      : rental.status === "annulée"
      ? "Cette réservation a déjà été refusée."
      : `Statut actuel : ${rental.status}`;
    return res.status(200).send(page("Déjà traité", msg, "#8A8075", "ℹ"));
  }

  const newStatus = action === "confirm" ? "en cours" : "annulée";
  await supabase.from("rentals").update({ status: newStatus }).eq("portal_token", token);

  // Notifier le client
  if (rental.client_id) {
    const { data: client } = await supabase
      .from("clients")
      .select("email, first_name")
      .eq("id", rental.client_id)
      .single();

    if (client?.email) {
      if (action === "confirm") {
        const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:50%;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:16px;">Réservation confirmée !</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">Bonjour ${client.first_name}, votre réservation est validée.</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<table width="100%" style="background:#1A1710;border-radius:12px;border:1px solid #2A2420;" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Véhicule</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.vehicle_name}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Dates</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.start_date} → ${rental.end_date}</div></td></tr>
<tr><td style="padding:16px 20px;"><span style="color:#8A8075;font-size:13px;">Total</span><div style="color:#C9A84C;font-weight:700;font-size:18px;margin-top:4px;">${rental.total} €</div></td></tr>
</table>
<p style="color:#B0A898;font-size:14px;line-height:1.8;margin:24px 0;">Votre contrat est prêt à être signé en ligne. Cliquez sur le bouton ci-dessous pour accéder à votre espace locataire et signer votre contrat :</p>
<div style="text-align:center;margin:24px 0;">
<a href="https://loqar.fr/portal/${rental.portal_token}" style="display:inline-block;background:#C9A84C;color:#0E0C0A;font-weight:700;font-size:15px;padding:16px 36px;border-radius:10px;text-decoration:none;">✍️ Signer mon contrat</a>
</div>
<p style="color:#6A6460;font-size:12px;text-align:center;margin:0;">Ce lien est personnel et sécurisé. Ne le partagez pas.</p>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;"><div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong></div></td></tr>
</table></td></tr></table></body></html>`;
        await sendEmail(client.email, "✅ Réservation confirmée — Signez votre contrat", html).catch(() => {});
      } else {
        const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:50%;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:16px;">Demande non retenue</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">Bonjour ${client.first_name}, nous sommes désolés.</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Votre demande de réservation pour <strong style="color:#F5F0E8;">${rental.vehicle_name}</strong> du ${rental.start_date} au ${rental.end_date} n'a pas pu être acceptée.</p>
<p style="color:#8A8075;font-size:13px;line-height:1.8;margin:0;">N'hésitez pas à soumettre une nouvelle demande pour d'autres dates ou véhicules.</p>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;"><div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong></div></td></tr>
</table></td></tr></table></body></html>`;
        await sendEmail(client.email, "Votre demande de réservation", html).catch(() => {});
      }
    }
  }

  if (action === "confirm") {
    return res.status(200).send(page(
      "Réservation confirmée !",
      `La réservation de <strong style="color:#F5F0E8;">${rental.client_name}</strong> pour <strong style="color:#F5F0E8;">${rental.vehicle_name}</strong> est maintenant confirmée. Le client a été notifié.`,
      "#4CAF7D", "✓"
    ));
  } else {
    return res.status(200).send(page(
      "Réservation refusée",
      `La demande de <strong style="color:#F5F0E8;">${rental.client_name}</strong> a été refusée. Le client a été notifié.`,
      "#E8746A", "✕"
    ));
  }
}
