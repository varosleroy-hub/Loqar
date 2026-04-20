export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, to, data } = req.body;

  // ─── BASE WRAPPER ────────────────────────────────────────────────────────────
  const wrap = (content, { accentColor = "#C9A84C", footerNote = "" } = {}) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Loqar</title></head>
<body style="margin:0;padding:0;background:#0A0907;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0907;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1A1710 0%,#0F0D0B 100%);border:1px solid #2A2720;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;">
                <img src="https://loqar.fr/loqar-favicon.png" alt="Loqar" width="48" height="48" style="border-radius:50%;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
                <div style="font-size:22px;font-weight:800;color:${accentColor};letter-spacing:-0.02em;margin-bottom:2px;">LOQAR</div>
                <div style="font-size:10px;color:#5A5550;letter-spacing:0.14em;text-transform:uppercase;">Gestion de location automobile</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Content -->
        <tr><td style="background:#141210;border-left:1px solid #2A2720;border-right:1px solid #2A2720;padding:40px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0F0D0B;border:1px solid #2A2720;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;color:#3A3530;">
            <a href="https://loqar.fr" style="color:#5A5550;text-decoration:none;">loqar.fr</a>
            &nbsp;·&nbsp;
            <a href="mailto:support@loqar.fr" style="color:#5A5550;text-decoration:none;">support@loqar.fr</a>
          </p>
          <p style="margin:0;font-size:11px;color:#3A3530;">${footerNote || "Loqar · Logiciel de gestion de location de véhicules"}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ─── BLOC INFO ROW ────────────────────────────────────────────────────────────
  const infoRow = (label, value, highlight = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1E1C18;font-size:12px;color:#6A6560;font-weight:500;text-transform:uppercase;letter-spacing:.06em;width:40%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1E1C18;font-size:${highlight ? "18px" : "14px"};color:${highlight ? "#C9A84C" : "#E8E4DF"};font-weight:${highlight ? "700" : "500"};text-align:right;">${value}</td>
    </tr>`;

  // ─── CTA BUTTON ──────────────────────────────────────────────────────────────
  const cta = (label, url, color = "#C9A84C", textColor = "#0F0D0B") => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr><td align="center">
        <a href="${url}" style="display:inline-block;background:${color};color:${textColor};padding:15px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.01em;">${label} →</a>
      </td></tr>
    </table>`;

  // ─── HERO BAND ────────────────────────────────────────────────────────────────
  const hero = (title, sub, color = "#C9A84C") => `
    <div style="background:linear-gradient(135deg,${color}15 0%,transparent 60%);border:1px solid ${color}20;border-radius:12px;padding:28px 24px;margin-bottom:28px;text-align:center;">
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${color};letter-spacing:-0.03em;line-height:1.1;">${title}</h1>
      ${sub ? `<p style="margin:0;font-size:14px;color:#8A8075;line-height:1.6;">${sub}</p>` : ""}
    </div>`;

  // ─── INFO CARD ────────────────────────────────────────────────────────────────
  const infoCard = (rows) => `
    <div style="background:#1A1710;border:1px solid #2A2720;border-radius:12px;padding:4px 20px;margin:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </div>`;

  // ─── TEMPLATES ───────────────────────────────────────────────────────────────
  const templates = {

    welcome: {
      subject: `Bienvenue sur Loqar, ${data?.name || ""} 🚗`,
      html: wrap(`
        ${hero("Bienvenue sur Loqar !", "Votre espace de gestion est prêt.")}
        <p style="color:#B0A898;font-size:15px;line-height:1.8;margin:0 0 16px;">Bonjour <strong style="color:#E8E4DF;">${data?.name || ""}</strong>,</p>
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Votre compte est activé. Vous pouvez maintenant gérer votre flotte, vos clients, vos contrats et vos paiements depuis un seul endroit.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[["🚗","Flotte","Gérez tous vos véhicules"],["👤","Clients","Historiques et permis"],["📋","Contrats","Génération PDF en 30s"],["💰","Paiements","Suivi encaissements"]].map(([icon,title,sub])=>`
          <tr>
            <td width="48" style="padding:8px 12px 8px 0;vertical-align:top;">
              <div style="width:36px;height:36px;background:#1A1710;border:1px solid #2A2720;border-radius:9px;text-align:center;line-height:36px;font-size:16px;">${icon}</div>
            </td>
            <td style="padding:8px 0;vertical-align:top;border-bottom:1px solid #1E1C18;">
              <div style="font-size:13px;font-weight:600;color:#E8E4DF;">${title}</div>
              <div style="font-size:12px;color:#6A6560;">${sub}</div>
            </td>
          </tr>`).join("")}
        </table>

        ${cta("Accéder à mon espace", "https://loqar.fr")}
        <p style="color:#5A5550;font-size:12px;text-align:center;margin:0;">Essai gratuit 14 jours · Aucune CB requise</p>
      `)
    },

    subscription: {
      subject: `Plan ${data?.plan || "Pro"} activé ✅`,
      html: wrap(`
        ${hero("Plan activé !", `Votre abonnement <strong>${data?.plan || "Pro"}</strong> est maintenant actif.`, "#6AAF7A")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Vous avez maintenant accès à toutes les fonctionnalités de votre plan.</p>
        ${infoCard([
          infoRow("Plan", `<span style="color:#6AAF7A;">${data?.plan || "Pro"}</span>`),
          infoRow("Montant", data?.price || "—", true),
          infoRow("Statut", `<span style="color:#6AAF7A;background:#6AAF7A20;padding:2px 10px;border-radius:99px;font-size:12px;">Actif</span>`),
        ].join(""))}
        ${cta("Accéder à mon espace", "https://loqar.fr", "#6AAF7A")}
      `, { accentColor: "#6AAF7A" })
    },

    rental: {
      subject: `Nouvelle réservation — ${data?.vehicleName || data?.vehicle || "Véhicule"}`,
      html: wrap(`
        ${hero("Nouvelle réservation", `${data?.clientName || "Un client"} a effectué une demande de réservation.`)}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour, une nouvelle location a été créée sur votre espace Loqar.</p>
        ${infoCard([
          infoRow("Client", data?.clientName || "—"),
          infoRow("Véhicule", data?.vehicleName || data?.vehicle || "—"),
          infoRow("Départ", data?.startDate || "—"),
          infoRow("Retour", data?.endDate || "—"),
          infoRow("Total TTC", `${data?.total || "—"} €`, true),
        ].join(""))}
        ${cta("Voir la location", "https://loqar.fr")}
      `)
    },

    payment_received: {
      subject: `Paiement reçu — ${data?.amount || ""}€`,
      html: wrap(`
        ${hero("Paiement confirmé", "Votre paiement a bien été enregistré.", "#6AAF7A")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour <strong style="color:#E8E4DF;">${data?.clientName || ""}</strong>, nous confirmons la réception de votre règlement.</p>
        ${infoCard([
          infoRow("Montant encaissé", `${data?.amount || "—"} €`, true),
          data?.method ? infoRow("Méthode", data.method) : "",
          data?.date ? infoRow("Date", data.date) : "",
          data?.vehicle ? infoRow("Véhicule", data.vehicle) : "",
        ].join(""))}
        <p style="color:#6A6560;font-size:13px;text-align:center;margin:24px 0 0;">Merci pour votre confiance. Conservez cet email comme justificatif.</p>
      `, { accentColor: "#6AAF7A" })
    },

    contract: {
      subject: `Votre contrat de location — ${data?.vehicle || "Véhicule"}`,
      html: wrap(`
        ${hero("Votre contrat", "Consultez les détails de votre location ci-dessous.")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour <strong style="color:#E8E4DF;">${data?.clientName || ""}</strong>,</p>
        ${infoCard([
          infoRow("Véhicule", data?.vehicle || "—"),
          infoRow("Départ", data?.startDate || "—"),
          infoRow("Retour", data?.endDate || "—"),
          infoRow("Total TTC", `${data?.total || "—"} €`, true),
        ].join(""))}
        ${data?.contractHtml ? `<div style="margin:24px 0;padding:24px;background:#FDFBF7;border-radius:12px;color:#1A1510;font-size:13px;line-height:1.7;">${data.contractHtml}</div>` : ""}
        ${cta("Signer mon contrat", data?.portalUrl || "https://loqar.fr")}
      `)
    },

    portal: {
      subject: `Votre espace locataire — ${data?.vehicle || "Loqar"}`,
      html: wrap(`
        ${hero("Accédez à votre espace", "Votre contrat est disponible pour signature.")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour <strong style="color:#E8E4DF;">${data?.clientName || ""}</strong>,</p>
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Votre agence vous invite à consulter et signer votre contrat de location en ligne.</p>
        ${infoCard([
          infoRow("Véhicule", data?.vehicle || "—"),
          infoRow("Départ", data?.startDate || "—"),
          infoRow("Retour", data?.endDate || "—"),
          infoRow("Total TTC", `${data?.total || "—"} €`, true),
        ].join(""))}
        ${cta("Accéder à mon espace →", data?.portalUrl || "#")}
        <p style="color:#3A3530;font-size:11px;text-align:center;margin:16px 0 0;">🔒 Ce lien est personnel et sécurisé. Ne le partagez pas.</p>
      `)
    },

    payment_reminder: {
      subject: `⚠️ Rappel paiement — ${data?.amount || ""}€ en attente`,
      html: wrap(`
        ${hero("Paiement en attente", "Un règlement est en attente sur votre compte.", "#E8746A")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour <strong style="color:#E8E4DF;">${data?.clientName || ""}</strong>,</p>
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Nous vous contactons car un paiement est en attente de règlement pour votre location.</p>
        ${infoCard([
          infoRow("Montant dû", `${data?.amount || "—"} €`, true),
          data?.vehicle ? infoRow("Véhicule", data.vehicle) : "",
          data?.dueDate ? infoRow("Échéance", data.dueDate) : "",
        ].join(""))}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:24px 0;">Merci de régulariser votre situation dans les plus brefs délais. En cas de question, contactez directement votre agence.</p>
      `, { accentColor: "#E8746A", footerNote: "Si vous pensez avoir déjà réglé ce montant, ignorez ce message." })
    },

    deposit: {
      subject: `Caution à bloquer — ${data?.vehicle || "Location Loqar"}`,
      html: wrap(`
        ${hero("Bloquez votre caution", "Un montant sera réservé sur votre carte, non débité.", "#5B8DB8")}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Bonjour <strong style="color:#E8E4DF;">${data?.clientName || ""}</strong>,</p>
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Votre agence vous demande de bloquer une caution pour la location du véhicule <strong style="color:#E8E4DF;">${data?.vehicle || ""}</strong>. Ce montant sera <strong style="color:#E8E4DF;">simplement réservé</strong> sur votre carte et libéré automatiquement à la restitution du véhicule.</p>
        ${infoCard([
          infoRow("Véhicule", data?.vehicle || "—"),
          infoRow("Montant caution", `${data?.amount || "—"} €`, true),
        ].join(""))}
        ${cta("Bloquer ma caution →", data?.depositUrl || "#", "#5B8DB8", "#fff")}
        <p style="color:#3A3530;font-size:11px;text-align:center;margin:16px 0 0;">🔒 Ce montant ne sera <strong>pas débité</strong> sauf en cas de dommage constaté.</p>
      `, { accentColor: "#5B8DB8" })
    },

    booking_request: {
      subject: `Nouvelle demande de réservation — ${data?.vehicleName || "Véhicule"}`,
      html: wrap(`
        ${hero("Nouvelle demande !", `${data?.clientName || "Un client"} souhaite réserver via votre page publique.`)}
        <p style="color:#B0A898;font-size:14px;line-height:1.8;margin:0 0 24px;">Une demande de réservation vient d'être soumise sur votre page Loqar. Connectez-vous pour confirmer ou refuser.</p>
        ${infoCard([
          infoRow("Client", data?.clientName || "—"),
          data?.clientEmail ? infoRow("Email", data.clientEmail) : "",
          data?.clientPhone ? infoRow("Téléphone", data.clientPhone) : "",
          infoRow("Véhicule", data?.vehicleName || "—"),
          infoRow("Départ", data?.startDate || "—"),
          infoRow("Retour", data?.endDate || "—"),
          infoRow("Total estimé", `${data?.total || "—"} €`, true),
        ].join(""))}
        ${data?.notes ? `<div style="background:#1A1710;border-left:3px solid #C9A84C;padding:12px 16px;margin:0 0 24px;border-radius:0 8px 8px 0;font-size:13px;color:#8A8075;font-style:italic;">"${data.notes}"</div>` : ""}
        ${cta("Voir la réservation", "https://loqar.fr")}
      `)
    },

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
        from: { email: "noreply@loqar.fr", name: "Loqar" },
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
