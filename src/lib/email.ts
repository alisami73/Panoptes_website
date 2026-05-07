import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = 'PANOPTES <noreply@blinkpharmacie.ma>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ali.sami@blinkpharmacie.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://panoptes.blinkpharmacie.ma'

const baseStyle = `
  font-family: 'Inter', Arial, sans-serif;
  background: #0D1B2A;
  color: #FFFFFF;
`
const cardStyle = `
  background: rgba(0,194,203,0.06);
  border: 1px solid rgba(0,194,203,0.18);
  border-radius: 8px;
  padding: 32px;
  margin: 24px 0;
`
const btnStyle = `
  display: inline-block;
  background: #00C2CB;
  color: #0D1B2A;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.05em;
`
const mutedStyle = `color: rgba(232,237,242,0.55); font-size: 12px; margin-top: 32px;`

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>PANOPTES</title></head>
<body style="margin:0;padding:0;background:#0D1B2A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="${baseStyle}">
    <tr><td align="center" style="padding: 48px 24px;">
      <table width="640" cellpadding="0" cellspacing="0">
        <tr><td>
          <div style="font-family: monospace; font-size: 12px; letter-spacing: 0.3em; color: #00C2CB; margin-bottom: 32px; text-transform: uppercase;">PANOPTES · REAL-TIME HEALTH INTELLIGENCE</div>
          ${content}
          <p style="${mutedStyle}">© 2026 Blink Pharma — panoptes.blinkpharmacie.ma</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendAccessEmail(to: string, token: string, expiresAt: Date) {
  const link = `${APP_URL}/deck?token=${token}`
  const expiry = expiresAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Votre accès PANOPTES — Blink Pharma Pitch Deck',
    html: emailWrapper(`
      <h1 style="font-size: 32px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px;">Votre accès est prêt.</h1>
      <p style="color: rgba(232,237,242,0.85); font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
        Vous avez reçu un accès exclusif au pitch deck interactif PANOPTES — la plateforme d'intelligence de santé en temps réel de Blink Pharma.
      </p>
      <div style="${cardStyle}">
        <p style="font-family: monospace; font-size: 11px; letter-spacing: 0.25em; color: #00C2CB; text-transform: uppercase; margin: 0 0 12px;">LIEN D'ACCÈS</p>
        <a href="${link}" style="${btnStyle}">ACCÉDER AU DECK →</a>
        <p style="color: rgba(232,237,242,0.55); font-size: 12px; margin: 16px 0 0; font-family: monospace;">
          Expire le : ${expiry}<br/>
          ${link}
        </p>
      </div>
      <p style="color: rgba(232,237,242,0.55); font-size: 14px;">
        Si vous avez des questions, contactez <a href="mailto:${ADMIN_EMAIL}" style="color: #00C2CB;">${ADMIN_EMAIL}</a>
      </p>
    `),
  })
}

export async function sendAccessRequestNotification(request: {
  name: string
  organization: string
  email: string
  message?: string
}) {
  const adminLink = `${APP_URL}/admin/access`

  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[PANOPTES] Nouvelle demande d'accès — ${request.name}`,
    html: emailWrapper(`
      <h1 style="font-size: 28px; font-weight: 700; color: #FFFFFF; margin: 0 0 24px;">Nouvelle demande d'accès</h1>
      <div style="${cardStyle}">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,194,203,0.08);">
            <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(232,237,242,0.55); text-transform: uppercase; display: block; margin-bottom: 4px;">Nom</span>
            <span style="font-size: 18px; font-weight: 600; color: #FFFFFF;">${request.name}</span>
          </td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,194,203,0.08);">
            <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(232,237,242,0.55); text-transform: uppercase; display: block; margin-bottom: 4px;">Organisation</span>
            <span style="font-size: 18px; font-weight: 600; color: #FFFFFF;">${request.organization}</span>
          </td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(0,194,203,0.08);">
            <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(232,237,242,0.55); text-transform: uppercase; display: block; margin-bottom: 4px;">Email</span>
            <span style="font-size: 18px; font-weight: 600; color: #00C2CB;">${request.email}</span>
          </td></tr>
          ${request.message ? `<tr><td style="padding: 10px 0;">
            <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(232,237,242,0.55); text-transform: uppercase; display: block; margin-bottom: 4px;">Message</span>
            <span style="font-size: 14px; color: rgba(232,237,242,0.85); line-height: 1.6;">${request.message}</span>
          </td></tr>` : ''}
        </table>
      </div>
      <a href="${adminLink}" style="${btnStyle}">GÉRER DANS L'ADMIN →</a>
    `),
  })
}

export async function sendContactNotification(contact: {
  name: string
  email: string
  message: string
}) {
  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[PANOPTES] Nouveau message de contact — ${contact.name}`,
    html: emailWrapper(`
      <h1 style="font-size: 28px; font-weight: 700; color: #FFFFFF; margin: 0 0 24px;">Nouveau message de contact</h1>
      <div style="${cardStyle}">
        <p style="margin: 0 0 8px;"><span style="color: rgba(232,237,242,0.55); font-size: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.2em;">De : </span><strong style="color: #FFFFFF;">${contact.name}</strong> — <a href="mailto:${contact.email}" style="color: #00C2CB;">${contact.email}</a></p>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,194,203,0.08); color: rgba(232,237,242,0.85); line-height: 1.6;">${contact.message}</div>
      </div>
      <a href="mailto:${contact.email}" style="${btnStyle}">RÉPONDRE →</a>
    `),
  })
}
