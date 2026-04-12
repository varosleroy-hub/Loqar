import { createClient } from "@supabase/supabase-js";

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
  // Sécurité : seul Vercel Cron peut appeler cet endpoint
  const authHeader = req.headers["authorization"];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Date de demain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Locations qui commencent demain
  const { data: rentals } = await supabase
    .from("rentals")
    .select("id, client_id, client_name, vehicle_name, start_date, end_date, total")
    .eq("start_date", tomorrowStr)
    .in("status", ["réservée", "en cours"]);

  if (!rentals || rentals.length === 0) {
    return res.status(200).json({ sent: 0, message: "Aucune location demain" });
  }

  let sent = 0;
  for (const rental of rentals) {
    if (!rental.client_id) continue;

    const { data: client } = await supabase
      .from("clients")
      .select("email, first_name")
      .eq("id", rental.client_id)
      .single();

    if (!client?.email) continue;

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:12px;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:16px;">C'est demain !</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">Bonjour ${client.first_name}, votre location commence demain.</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Rappel de votre réservation pour demain :</p>
<table width="100%" style="background:#1A1710;border-radius:12px;border:1px solid #2A2420;" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Véhicule</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.vehicle_name}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Prise en charge</span><div style="color:#C9A84C;font-weight:700;margin-top:4px;">${rental.start_date}</div></td></tr>
<tr><td style="padding:16px 20px;"><span style="color:#8A8075;font-size:13px;">Retour prévu</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.end_date}</div></td></tr>
</table>
<p style="color:#8A8075;font-size:13px;line-height:1.8;margin:24px 0 0;text-align:center;">En cas d'imprévu, contactez directement votre agence.</p>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;"><div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong> — loqar.fr</div></td></tr>
</table></td></tr></table></body></html>`;

    try {
      await sendEmail(client.email, `Rappel — Votre location commence demain`, html);
      sent++;
    } catch (_) {}
  }

  return res.status(200).json({ sent, total: rentals.length });
}
