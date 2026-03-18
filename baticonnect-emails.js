// ============================================================
//  BATICONNECT — Système d'emails automatiques
//  Fichier : baticonnect-emails.js
//  Utilise : Resend API
// ============================================================

const RESEND_API_KEY = 're_DETRdrrC_9gmixqXgHdWNcTxuzgQ6HUMB';
const FROM_EMAIL     = 'BatiConnect <onboarding@resend.dev>'; // Changer quand vous avez un domaine

// ============================================================
// FONCTION PRINCIPALE D'ENVOI
// ============================================================
async function envoyerEmail(destinataire, sujet, html) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [destinataire],
        subject: sujet,
        html: html
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur envoi email');
    console.log('Email envoyé à', destinataire, '— ID:', data.id);
    return data;
  } catch (err) {
    console.error('Erreur email:', err.message);
    throw err;
  }
}

// ============================================================
// TEMPLATE DE BASE
// ============================================================
function templateBase(contenu) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#F9F8F5; color:#2C2C2A; }
  .wrapper { max-width:580px; margin:0 auto; padding:32px 16px; }
  .header { background:linear-gradient(135deg,#1a0f0a,#993C1D 60%,#D87040); border-radius:16px 16px 0 0; padding:28px 32px; text-align:center; }
  .logo { font-size:22px; font-weight:800; color:white; letter-spacing:-0.5px; }
  .logo span { color:#FFD4C0; }
  .tagline { font-size:12px; color:rgba(255,255,255,0.65); margin-top:4px; }
  .body { background:white; padding:32px; border-radius:0 0 16px 16px; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
  .btn { display:inline-block; background:#D85A30; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px; margin:20px 0; }
  .btn:hover { background:#993C1D; }
  .divider { height:1px; background:#F1EFE8; margin:20px 0; }
  .footer { text-align:center; font-size:11px; color:#888780; margin-top:20px; line-height:1.7; }
  .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
  .badge-teal { background:#E1F5EE; color:#085041; }
  .badge-orange { background:#FAECE7; color:#993C1D; }
  .info-box { background:#F9F8F5; border-radius:10px; padding:16px; margin:16px 0; }
  .info-row { display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid #F1EFE8; }
  .info-row:last-child { border-bottom:none; }
  .info-label { color:#888780; }
  .info-val { font-weight:600; }
  h2 { font-size:20px; font-weight:700; margin-bottom:8px; color:#2C2C2A; }
  p { font-size:14px; line-height:1.8; color:#5F5E5A; margin-bottom:12px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Bati<span>Connect</span></div>
    <div class="tagline">La plateforme de confiance pour vos travaux en Afrique</div>
  </div>
  <div class="body">
    ${contenu}
  </div>
  <div class="footer">
    © 2026 BatiConnect · Cotonou, Bénin<br>
    Vous recevez cet email car vous êtes inscrit sur BatiConnect.<br>
    <a href="#" style="color:#D85A30">Se désabonner</a>
  </div>
</div>
</body>
</html>`;
}

// ============================================================
// EMAIL 1 — BIENVENUE (après inscription)
// ============================================================
async function emailBienvenue(prenom, email, role) {
  const roleLabel = role === 'prestataire' ? 'Prestataire / Artisan' : 'Demandeur de services';
  const html = templateBase(`
    <h2>Bienvenue sur BatiConnect, ${prenom} ! 🎉</h2>
    <p>Votre compte a été créé avec succès. Vous faites maintenant partie de la communauté BatiConnect — la plateforme qui connecte clients et artisans vérifiés en Afrique.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Nom</span><span class="info-val">${prenom}</span></div>
      <div class="info-row"><span class="info-label">Email</span><span class="info-val">${email}</span></div>
      <div class="info-row"><span class="info-label">Profil</span><span class="info-val">${roleLabel}</span></div>
      <div class="info-row"><span class="info-label">Statut</span><span class="badge badge-teal">✅ Compte actif</span></div>
    </div>
    <p>Commencez dès maintenant :</p>
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect" class="btn">
      Accéder à mon compte →
    </a>
    <div class="divider"></div>
    <p style="font-size:12px;color:#888780">🔒 Vos données sont sécurisées et ne seront jamais vendues à des tiers.</p>
  `);
  return envoyerEmail(email, `Bienvenue sur BatiConnect, ${prenom} ! 🎉`, html);
}

// ============================================================
// EMAIL 2 — NOUVELLE CANDIDATURE (au client)
// ============================================================
async function emailNouvelleCandidature(clientEmail, clientPrenom, artisanPrenom, titreAnnonce, prixPropose, delai) {
  const html = templateBase(`
    <h2>Nouvelle candidature reçue ! 📋</h2>
    <p>Bonjour ${clientPrenom}, un artisan vient de postuler à votre annonce.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Annonce</span><span class="info-val">${titreAnnonce}</span></div>
      <div class="info-row"><span class="info-label">Artisan</span><span class="info-val">${artisanPrenom}</span></div>
      <div class="info-row"><span class="info-label">Prix proposé</span><span class="info-val" style="color:#D85A30">${Number(prixPropose).toLocaleString('fr-FR')} FCFA</span></div>
      <div class="info-row"><span class="info-label">Délai estimé</span><span class="info-val">${delai} jours</span></div>
    </div>
    <p>Consultez le profil de l'artisan et acceptez ou refusez sa candidature.</p>
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-publication.html" class="btn">
      Voir la candidature →
    </a>
  `);
  return envoyerEmail(clientEmail, `Nouvelle candidature pour "${titreAnnonce}"`, html);
}

// ============================================================
// EMAIL 3 — PAIEMENT SÉCURISÉ (confirmation)
// ============================================================
async function emailPaiementSecurise(clientEmail, clientPrenom, montant, missionTitre, artisanPrenom) {
  const html = templateBase(`
    <h2>Paiement sécurisé confirmé 🔒</h2>
    <p>Bonjour ${clientPrenom}, votre paiement a été reçu et est maintenant sécurisé sur BatiConnect.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Mission</span><span class="info-val">${missionTitre}</span></div>
      <div class="info-row"><span class="info-label">Artisan</span><span class="info-val">${artisanPrenom}</span></div>
      <div class="info-row"><span class="info-label">Montant bloqué</span><span class="info-val" style="color:#1D9E75;font-size:16px">${Number(montant).toLocaleString('fr-FR')} FCFA</span></div>
      <div class="info-row"><span class="info-label">Statut</span><span class="badge badge-teal">🔒 Fonds sécurisés</span></div>
    </div>
    <p>L'argent sera libéré à l'artisan uniquement après votre validation à la fin des travaux. Vous êtes protégé ✅</p>
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-paiement.html" class="btn">
      Voir le détail du paiement →
    </a>
    <div class="divider"></div>
    <p style="font-size:12px;color:#888780">🛡️ Commission BatiConnect : 8% déduite automatiquement à la libération.</p>
  `);
  return envoyerEmail(clientEmail, `✅ Paiement de ${Number(montant).toLocaleString('fr-FR')} FCFA sécurisé`, html);
}

// ============================================================
// EMAIL 4 — RAPPORT CHANTIER (au client)
// ============================================================
async function emailNouveauRapport(clientEmail, clientPrenom, artisanPrenom, missionTitre, avancement, noteArtisan) {
  const html = templateBase(`
    <h2>Nouveau rapport de chantier 📷</h2>
    <p>Bonjour ${clientPrenom}, votre artisan vient d'envoyer un rapport d'avancement.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Mission</span><span class="info-val">${missionTitre}</span></div>
      <div class="info-row"><span class="info-label">Artisan</span><span class="info-val">${artisanPrenom}</span></div>
      <div class="info-row"><span class="info-label">Avancement</span><span class="info-val" style="color:#D85A30">${avancement}%</span></div>
      <div class="info-row"><span class="info-label">GPS</span><span class="badge badge-teal">✅ Position vérifiée</span></div>
    </div>
    ${noteArtisan ? `<p><strong>Note de l'artisan :</strong> "${noteArtisan}"</p>` : ''}
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-suivi-chantier.html" class="btn">
      Voir les photos du chantier →
    </a>
  `);
  return envoyerEmail(clientEmail, `📷 Nouveau rapport — ${missionTitre} (${avancement}%)`, html);
}

// ============================================================
// EMAIL 5 — ALERTE RETARD (au client et artisan)
// ============================================================
async function emailAlerteRetard(email, prenom, missionTitre, joursRetard, penalite) {
  const html = templateBase(`
    <h2>⚠️ Alerte retard détecté</h2>
    <p>Bonjour ${prenom}, un retard a été détecté sur votre mission.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Mission</span><span class="info-val">${missionTitre}</span></div>
      <div class="info-row"><span class="info-label">Retard</span><span class="info-val" style="color:#A32D2D">${joursRetard} jour(s)</span></div>
      <div class="info-row"><span class="info-label">Pénalité appliquée</span><span class="info-val" style="color:#A32D2D">${Number(penalite).toLocaleString('fr-FR')} FCFA</span></div>
    </div>
    <p>Connectez-vous pour consulter les détails et prendre les mesures nécessaires.</p>
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-paiement.html" class="btn">
      Voir les détails →
    </a>
  `);
  return envoyerEmail(email, `⚠️ Retard de ${joursRetard} jour(s) — ${missionTitre}`, html);
}

// ============================================================
// EMAIL 6 — AVIS PUBLIÉ (à l'artisan)
// ============================================================
async function emailAvisPublie(artisanEmail, artisanPrenom, clientPrenom, noteGlobale, commentaire) {
  const etoiles = '★'.repeat(Math.round(noteGlobale)) + '☆'.repeat(5 - Math.round(noteGlobale));
  const html = templateBase(`
    <h2>Vous avez reçu un nouvel avis ⭐</h2>
    <p>Bonjour ${artisanPrenom}, ${clientPrenom} vient de vous laisser un avis.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Note globale</span><span class="info-val" style="color:#BA7517;font-size:18px">${etoiles} ${noteGlobale}/5</span></div>
      <div class="info-row"><span class="info-label">Client</span><span class="info-val">${clientPrenom}</span></div>
    </div>
    ${commentaire ? `
    <div style="background:#F9F8F5;border-radius:10px;padding:16px;border-left:4px solid #D85A30;margin:16px 0">
      <p style="font-style:italic;color:#2C2C2A;margin:0">"${commentaire}"</p>
    </div>` : ''}
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-notation.html" class="btn">
      Voir mon profil →
    </a>
  `);
  return envoyerEmail(artisanEmail, `⭐ Nouvel avis ${etoiles} de ${clientPrenom}`, html);
}

// ============================================================
// EMAIL 7 — MISSION VALIDÉE (à l'artisan)
// ============================================================
async function emailMissionValidee(artisanEmail, artisanPrenom, missionTitre, montantLibere) {
  const html = templateBase(`
    <h2>Mission validée — Paiement libéré ! 💰</h2>
    <p>Félicitations ${artisanPrenom} ! Votre mission a été validée par le client.</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Mission</span><span class="info-val">${missionTitre}</span></div>
      <div class="info-row"><span class="info-label">Montant libéré</span><span class="info-val" style="color:#1D9E75;font-size:18px">${Number(montantLibere).toLocaleString('fr-FR')} FCFA</span></div>
      <div class="info-row"><span class="info-label">Statut</span><span class="badge badge-teal">✅ Virement en cours</span></div>
    </div>
    <p>Le montant sera transféré sur votre compte Mobile Money dans les 24 heures.</p>
    <a href="https://akouegnonfrancissagbohan-create.github.io/baticonnect/baticonnect-paiement.html" class="btn">
      Voir mon portefeuille →
    </a>
  `);
  return envoyerEmail(artisanEmail, `💰 Paiement de ${Number(montantLibere).toLocaleString('fr-FR')} FCFA libéré !`, html);
}

// ============================================================
// EXPORT — Utilisez ces fonctions dans vos modules
// ============================================================
// Exemples d'utilisation :
//
// À l'inscription :
// await emailBienvenue('Francis', 'francis@gmail.com', 'demandeur');
//
// Quand un artisan postule :
// await emailNouvelleCandidature('client@gmail.com', 'Marc', 'Kofi', 'Rénovation F4', 3200000, 45);
//
// Quand un paiement est fait :
// await emailPaiementSecurise('client@gmail.com', 'Marc', 3200000, 'Rénovation F4', 'Kofi');
//
// Quand un rapport est envoyé :
// await emailNouveauRapport('client@gmail.com', 'Marc', 'Kofi', 'Rénovation F4', 65, 'Carrelage terminé');
//
// Quand il y a un retard :
// await emailAlerteRetard('artisan@gmail.com', 'Kofi', 'Rénovation F4', 3, 48000);
//
// Quand un avis est publié :
// await emailAvisPublie('artisan@gmail.com', 'Kofi', 'Marc', 4.9, 'Excellent travail !');
//
// Quand une mission est validée :
// await emailMissionValidee('artisan@gmail.com', 'Kofi', 'Rénovation F4', 2944000);
