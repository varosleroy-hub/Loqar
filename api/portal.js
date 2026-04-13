import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Token manquant" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
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
    const { signature } = req.body || {};

    const { data: rental } = await supabase
      .from("rentals")
      .select("id, status, client_name, vehicle_name, start_date, end_date, total, user_id")
      .eq("portal_token", token)
      .single();

    if (!rental || rental.status === "annulée" || rental.status === "terminée") {
      return res.status(400).json({ error: "Contrat non signable" });
    }

    // Sauvegarder la signature dans Supabase Storage
    let signatureUrl = null;
    if (signature && signature.startsWith("data:image/png;base64,")) {
      try {
        const base64 = signature.replace("data:image/png;base64,", "");
        const buffer = Buffer.from(base64, "base64");
        const path = `portal-signatures/${rental.id}_${Date.now()}.png`;
        const { data: uploaded } = await supabase.storage
          .from("signatures")
          .upload(path, buffer, { contentType: "image/png", upsert: true });
        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage.from("signatures").getPublicUrl(path);
          signatureUrl = publicUrl;
        }
      } catch (_) {}
    }

    await supabase.from("rentals").update({ signed_at: new Date().toISOString() }).eq("portal_token", token);

    // Notifier l'agence par email avec la signature en pièce jointe
    if (process.env.SENDGRID_API_KEY) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, agency_name")
          .eq("id", rental.user_id)
          .single();

        if (profile?.email) {
          const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0E0C0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#141210;border-radius:16px;border:1px solid #2A2420;overflow:hidden;">
<tr><td style="padding:40px;text-align:center;background:linear-gradient(135deg,#1A1710 0%,#141210 100%);border-bottom:1px solid #2A2420;">
<img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:50%;display:block;margin:0 auto 10px;" />
<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-top:8px;">Contrat signé !</div>
<div style="font-size:14px;color:#8A8075;margin-top:8px;">${rental.client_name} a signé son contrat de location.</div>
</td></tr>
<tr><td style="padding:32px 40px;">
<table width="100%" style="background:#1A1710;border-radius:12px;border:1px solid #2A2420;" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Client</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.client_name}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Véhicule</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.vehicle_name}</div></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #2A2420;"><span style="color:#8A8075;font-size:13px;">Dates</span><div style="color:#F5F0E8;font-weight:600;margin-top:4px;">${rental.start_date} → ${rental.end_date}</div></td></tr>
<tr><td style="padding:16px 20px;"><span style="color:#8A8075;font-size:13px;">Total</span><div style="color:#C9A84C;font-weight:700;font-size:18px;margin-top:4px;">${rental.total} €</div></td></tr>
</table>
<p style="color:#8A8075;font-size:13px;margin-top:20px;text-align:center;">La signature du client est jointe à cet email (signature.png).</p>
<div style="text-align:center;margin-top:20px;">
<a href="https://loqar.fr" style="display:inline-block;background:#C9A84C;color:#0E0C0A;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;">Voir dans Loqar</a>
</div>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #2A2420;"><div style="font-size:12px;color:#4A4440;">Propulsé par <strong style="color:#C9A84C;">Loqar</strong></div></td></tr>
</table></td></tr></table></body></html>`;

          // Préparer la pièce jointe signature
          const attachments = [];
          if (signature && signature.startsWith("data:image/png;base64,")) {
            attachments.push({
              content: signature.replace("data:image/png;base64,", ""),
              filename: `signature_${rental.client_name.replace(/\s+/g, "_")}.png`,
              type: "image/png",
              disposition: "attachment",
            });
          }

          await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: profile.email }] }],
              from: { email: "noreply@loqar.fr", name: "Loqar" },
              subject: `✍️ Contrat signé — ${rental.client_name}`,
              content: [{ type: "text/html", value: html }],
              ...(attachments.length > 0 ? { attachments } : {}),
            }),
          });
        }
      } catch (_) {}
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
