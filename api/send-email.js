export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, to, data } = req.body;

  const templates = {
    welcome: {
      subject: "Bienvenue sur Loqar 🚗",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
            <p style="color:#8A8075;margin:4px 0 0;">Gestion de location auto</p>
          </div>
          <h2 style="color:#E8E4DF;">Bienvenue ${data?.name || ""} ! 👋</h2>
          <p style="color:#B0A898;line-height:1.6;">Votre compte Loqar est prêt. Vous pouvez maintenant gérer votre flotte de véhicules, vos clients et vos locations en toute simplicité.</p>
          <div style="margin:32px 0;text-align:center;">
            <a href="https://loqar.fr" style="background:#C9A84C;color:#141210;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Accéder à mon espace →</a>
          </div>
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    },
    subscription: {
      subject: "Abonnement Loqar confirmé ✅",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
          </div>
          <h2 style="color:#E8E4DF;">Abonnement confirmé ! 🎉</h2>
          <p style="color:#B0A898;line-height:1.6;">Votre abonnement <strong style="color:#C9A84C;">${data?.plan || "Pro"}</strong> est maintenant actif.</p>
          <div style="background:#1F1D1A;border:1px solid #2E2B27;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#8A8075;font-size:13px;">Plan</p>
            <p style="margin:4px 0 0;color:#C9A84C;font-size:20px;font-weight:700;">${data?.plan || "Pro"} — ${data?.price || "79€"}/mois</p>
          </div>
          <div style="margin:32px 0;text-align:center;">
            <a href="https://loqar.fr" style="background:#C9A84C;color:#141210;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Accéder à mon espace →</a>
          </div>
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    },
    rental: {
      subject: `Nouveau contrat de location — ${data?.vehicle || "Véhicule"}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
          </div>
          <h2 style="color:#E8E4DF;">Nouveau contrat de location 📋</h2>
          <p style="color:#B0A898;">Bonjour <strong>${data?.clientName || ""}</strong>,</p>
          <p style="color:#B0A898;line-height:1.6;">Un nouveau contrat de location a été créé pour vous.</p>
          <div style="background:#1F1D1A;border:1px solid #2E2B27;border-radius:12px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Véhicule</td><td style="color:#E8E4DF;font-weight:600;">${data?.vehicle || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Début</td><td style="color:#E8E4DF;">${data?.startDate || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Fin</td><td style="color:#E8E4DF;">${data?.endDate || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Total</td><td style="color:#C9A84C;font-weight:700;font-size:16px;">${data?.total || "—"} €</td></tr>
            </table>
          </div>
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    },
    payment_received: {
      subject: `Paiement confirmé — ${data?.amount || ""}€`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
          </div>
          <h2 style="color:#6AAF7A;">Paiement reçu ✅</h2>
          <p style="color:#B0A898;">Bonjour <strong>${data?.clientName || ""}</strong>,</p>
          <p style="color:#B0A898;line-height:1.6;">Nous confirmons la réception de votre paiement.</p>
          <div style="background:#1F1D1A;border:1px solid #6AAF7A30;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#8A8075;font-size:13px;">Montant encaissé</p>
            <p style="margin:4px 0 0;color:#6AAF7A;font-size:24px;font-weight:700;">${data?.amount || "—"} €</p>
            ${data?.method ? `<p style="margin:8px 0 0;color:#8A8075;font-size:13px;">Méthode : ${data.method}</p>` : ""}
            ${data?.date ? `<p style="margin:4px 0 0;color:#8A8075;font-size:13px;">Date : ${data.date}</p>` : ""}
          </div>
          <p style="color:#B0A898;line-height:1.6;">Merci pour votre confiance.</p>
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    },
    contract: {
      subject: `Votre contrat de location — ${data?.vehicle || "Véhicule"}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
          </div>
          <h2 style="color:#E8E4DF;">Votre contrat de location 📄</h2>
          <p style="color:#B0A898;">Bonjour <strong>${data?.clientName || ""}</strong>,</p>
          <p style="color:#B0A898;line-height:1.6;">Veuillez trouver ci-dessous votre contrat de location.</p>
          <div style="background:#1F1D1A;border:1px solid #2E2B27;border-radius:12px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Véhicule</td><td style="color:#E8E4DF;font-weight:600;">${data?.vehicle || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Début</td><td style="color:#E8E4DF;">${data?.startDate || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Fin</td><td style="color:#E8E4DF;">${data?.endDate || "—"}</td></tr>
              <tr><td style="color:#8A8075;font-size:13px;padding:6px 0;">Total</td><td style="color:#C9A84C;font-weight:700;font-size:16px;">${data?.total || "—"} €</td></tr>
            </table>
          </div>
          ${data?.contractHtml ? `<div style="margin:24px 0;padding:20px;background:#FDFBF7;border-radius:12px;color:#1A1510;">${data.contractHtml}</div>` : ""}
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    },
    payment_reminder: {
      subject: `Rappel paiement en retard — ${data?.amount || ""}€`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#141210;color:#E8E4DF;padding:40px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">Loqar</h1>
          </div>
          <h2 style="color:#E8746A;">Paiement en retard ⚠️</h2>
          <p style="color:#B0A898;">Bonjour <strong>${data?.clientName || ""}</strong>,</p>
          <p style="color:#B0A898;line-height:1.6;">Nous vous contactons car un paiement est en attente de règlement.</p>
          <div style="background:#1F1D1A;border:1px solid #E8746A30;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#8A8075;font-size:13px;">Montant dû</p>
            <p style="margin:4px 0 0;color:#E8746A;font-size:24px;font-weight:700;">${data?.amount || "—"} €</p>
            ${data?.dueDate ? `<p style="margin:8px 0 0;color:#8A8075;font-size:13px;">Échéance : ${data.dueDate}</p>` : ""}
          </div>
          <p style="color:#B0A898;line-height:1.6;">Merci de régulariser votre situation dans les plus brefs délais.</p>
          <hr style="border:none;border-top:1px solid #2E2B27;margin:32px 0;"/>
          <p style="color:#8A8075;font-size:12px;text-align:center;">Loqar · Logiciel de gestion de location de véhicules</p>
        </div>`
    }
  };

  const template = templates[type];
  if (!template) return res.status(400).json({ error: "Type d'email invalide" });

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "varos.leroy@gmail.com", name: "Loqar" },
        subject: template.subject,
        content: [{ type: "text/html", value: template.html }]
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const err = await response.text();
      res.status(500).json({ error: err });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
