// Email service configuration with Resend
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Escape HTML special characters to prevent HTML injection in email templates.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'Profoot Profile <noreply@profootprofile.com>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Email Dev] To: ${to} | Subject: ${subject}`)
    }
    return { success: true, data: { id: 'dev-mode' } }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

/**
 * Envoie un email ET crée un EmailLog pour le suivi admin.
 * Utiliser à la place de sendEmail() quand on connaît le userId.
 */
export async function sendTrackedEmail(
  opts: SendEmailOptions & { userId: string; template: string; metadata?: any }
) {
  const result = await sendEmail(opts)
  if (result.success) {
    try {
      await prisma.emailLog.create({
        data: {
          userId: opts.userId,
          to: opts.to,
          subject: opts.subject,
          template: opts.template,
          metadata: opts.metadata ?? null,
        },
      })
    } catch (e) {
      console.error('Error creating EmailLog:', e)
    }
  }
  return result
}

// Email templates
export const emailTemplates = {
  passwordReset: (resetUrl: string, userName?: string) => ({
    subject: 'Réinitialisez votre mot de passe - Profoot Profile',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">⚽</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Profoot Profile
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Réinitialisation de mot de passe
              </h2>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                ${userName ? `Bonjour ${escapeHtml(userName)},` : 'Bonjour,'}
              </p>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Vous avez demandé à réinitialiser votre mot de passe sur Profoot Profile. 
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Ce lien expire dans <strong>1 heure</strong> pour des raisons de sécurité.
              </p>
              
              <p style="margin: 16px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${resetUrl}
                </a>
              </p>
              
              <!-- Security Notice -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      <strong>⚠️ Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, 
                      ignorez simplement cet email. Votre mot de passe restera inchangé.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Profoot Profile. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  notificationEmail: (userName: string, title: string, message: string, ctaUrl: string, ctaLabel: string = "Voir sur la plateforme") => ({
    subject: `${escapeHtml(title)} - Profoot Profile`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">${escapeHtml(title)}</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">${escapeHtml(message)}</p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  welcomeEmail: (userName: string, verificationUrl: string) => ({
    subject: 'Bienvenue sur Profoot Profile ! Vérifiez votre email',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px;">
                <span style="font-size: 32px; line-height: 60px;">⚽</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Bienvenue sur Profoot Profile !
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Bonjour ${escapeHtml(userName)},
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Votre compte a été créé avec succès ! Vous faites maintenant partie de la communauté 
                Profoot Profile qui connecte joueurs, agents et clubs du monde entier.
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Ce lien expire dans <strong>24 heures</strong>.
              </p>
              
              <p style="margin: 16px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${verificationUrl}
                </a>
              </p>

              <!-- Prochaines étapes -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; color: #166534; font-size: 15px; font-weight: 600;">
                      Prochaines étapes :
                    </p>
                    <p style="margin: 0 0 8px; color: #166534; font-size: 14px; line-height: 22px;">
                      1. Vérifiez votre email (ce message)
                    </p>
                    <p style="margin: 0 0 8px; color: #166534; font-size: 14px; line-height: 22px;">
                      2. Complétez votre profil dans l'onboarding
                    </p>
                    <p style="margin: 0; color: #166534; font-size: 14px; line-height: 22px;">
                      3. Commencez à explorer la plateforme !
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Profoot Profile. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  verificationEmail: (userName: string, verificationUrl: string) => ({
    subject: 'Vérifiez votre adresse email - Profoot Profile',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px;">
                <span style="font-size: 32px; line-height: 60px;">⚽</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Profoot Profile
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Vérifiez votre adresse email
              </h2>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Bonjour ${escapeHtml(userName)},
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer pleinement votre compte Profoot Profile.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Ce lien expire dans <strong>24 heures</strong>.
              </p>
              
              <p style="margin: 16px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${verificationUrl}
                </a>
              </p>
              
              <!-- Security Notice -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      Si vous n'avez pas créé de compte sur Profoot Profile, vous pouvez ignorer cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Profoot Profile. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  /** Confirmation d'abonnement payant (après paiement Stripe) */
  subscriptionConfirmed: (userName: string, planName: string, creditsMonthly: number) => ({
    subject: 'Votre abonnement Profoot Profile est actif',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">Votre abonnement est actif</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">
                Merci pour votre confiance. Votre abonnement <strong>${escapeHtml(planName)}</strong> est bien activé.
                ${creditsMonthly > 0 ? `Vous disposez de <strong>${creditsMonthly} crédits</strong> par mois pour consulter les profils et annonces.` : ''}
              </p>
              <p style="margin: 0; color: #52525b; font-size: 15px; line-height: 24px;">
                Vous pouvez gérer votre abonnement et vos crédits depuis la page <strong>Mes Crédits</strong> sur la plateforme.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  // ─── Club Onboarding Templates ──────────────────────────────────────────

  clubOtpEmail: (userName: string, otpCode: string) => ({
    subject: 'Votre code de vérification - Profoot Profile',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Votre code de vérification
              </h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">
                Utilisez le code ci-dessous pour vérifier votre identité dans le cadre de la création de votre club sur Profoot Profile.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <div style="display: inline-block; padding: 20px 40px; background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #166534; font-family: monospace;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Ce code expire dans <strong>10 minutes</strong>. Ne le partagez avec personne.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 24px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      Si vous n'avez pas demandé ce code, ignorez cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  clubSubmittedEmail: (clubName: string, userName: string) => ({
    subject: `Votre club "${escapeHtml(clubName)}" est en cours de vérification - Profoot Profile`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Demande soumise avec succès
              </h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">
                Votre demande d'enregistrement pour le club <strong>${escapeHtml(clubName)}</strong> a bien été soumise.
                Notre équipe va examiner vos documents et informations.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; color: #166534; font-size: 15px; font-weight: 600;">Prochaines étapes :</p>
                    <p style="margin: 0 0 4px; color: #166534; font-size: 14px;">1. Vérification de vos documents (24-48h)</p>
                    <p style="margin: 0 0 4px; color: #166534; font-size: 14px;">2. Validation par notre équipe</p>
                    <p style="margin: 0; color: #166534; font-size: 14px;">3. Activation de votre espace club</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Vous recevrez un email dès que la vérification sera terminée.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  clubApprovedEmail: (clubName: string, userName: string, dashboardUrl: string) => ({
    subject: `Félicitations ! Votre club "${escapeHtml(clubName)}" est activé - Profoot Profile`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Votre club est activé !
              </h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">
                Excellente nouvelle ! Le club <strong>${escapeHtml(clubName)}</strong> a été vérifié et activé sur Profoot Profile.
                Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px;">
                      Accéder à mon espace club
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  creatorInvitationEmail: (inviterName: string, recipientEmail: string, signupUrl: string) => ({
    subject: 'Invitation à rejoindre Profoot Profile',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px;">
                <span style="font-size: 32px; line-height: 60px;">⚽</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Profoot Profile
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Vous êtes invité(e) à rejoindre Profoot Profile
              </h2>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                <strong>${escapeHtml(inviterName)}</strong> vous invite à créer votre compte sur Profoot Profile 
                pour participer à l'enregistrement d'un club de football.
              </p>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Profoot Profile est la plateforme qui connecte joueurs, agents et clubs du monde entier.
                Créez votre compte pour commencer.
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${signupUrl}" 
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Créer mon compte
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${signupUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${signupUrl}
                </a>
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  clubMemberInvitationEmail: (inviterName: string, recipientEmail: string, role: string, inviteUrl: string) => {
    const roleLabels: Record<string, string> = {
      ADMIN: "Administrateur",
      STAFF: "Staff",
      VIEWER: "Observateur",
      OWNER: "Proprietaire",
    }
    const roleLabel = roleLabels[role] || role
    return {
      subject: `${escapeHtml(inviterName)} vous invite a rejoindre son club - Profoot Profile`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px;">
                <span style="font-size: 32px; line-height: 60px;">&#9917;</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Profoot Profile
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Vous etes invite(e) a rejoindre un club
              </h2>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                <strong>${escapeHtml(inviterName)}</strong> vous invite a rejoindre son club sur Profoot Profile
                en tant que <strong>${escapeHtml(roleLabel)}</strong>.
              </p>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Cliquez sur le bouton ci-dessous pour accepter l'invitation et acceder a l'espace club.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${inviteUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>

              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${inviteUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${inviteUrl}
                </a>
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Tous droits reserves.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a ete envoye automatiquement, merci de ne pas y repondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim()
    }
  },

  agentInvitationEmail: (playerName: string, agentFirstName: string | undefined, personalMessage: string | undefined, inviteUrl: string) => ({
    subject: `${escapeHtml(playerName)} vous invite à rejoindre Profoot Profile en tant qu'agent`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; margin: 0 auto 16px; background-color: rgba(255,255,255,0.2); border-radius: 16px;">
                <span style="font-size: 32px; line-height: 60px;">&#9917;</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Profoot Profile
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                ${agentFirstName ? `${escapeHtml(agentFirstName)}, vous` : 'Vous'} êtes invité(e) à rejoindre Profoot Profile
              </h2>

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                <strong>${escapeHtml(playerName)}</strong>, joueur professionnel sur Profoot Profile, vous invite à le rejoindre sur la plateforme en tant qu'<strong>agent</strong>.
              </p>

              ${personalMessage ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message de ${escapeHtml(playerName)}</p>
                    <p style="margin: 0; color: #166534; font-size: 14px; line-height: 22px; font-style: italic;">${escapeHtml(personalMessage)}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 24px;">
                Profoot Profile est le réseau professionnel qui connecte joueurs, agents et clubs du monde entier. Créez votre profil d'agent pour gérer vos joueurs et accéder aux opportunités.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${inviteUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Cette invitation expire dans <strong>7 jours</strong>.
              </p>

              <p style="margin: 16px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien :
              </p>

              <p style="margin: 8px 0 0; padding: 12px; background-color: #f4f4f5; border-radius: 8px; word-break: break-all;">
                <a href="${inviteUrl}" style="color: #16a34a; font-size: 12px; text-decoration: none;">
                  ${inviteUrl}
                </a>
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 32px; background-color: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                      Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),

  clubRejectedEmail: (clubName: string, userName: string, reason: string) => ({
    subject: `Votre demande pour "${escapeHtml(clubName)}" nécessite des modifications - Profoot Profile`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Profoot Profile</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px;">Bonjour ${escapeHtml(userName)},</p>
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                Demande non approuvée
              </h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 24px;">
                Après examen, la demande d'enregistrement pour le club <strong>${escapeHtml(clubName)}</strong> n'a pas pu être validée.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-size: 15px; font-weight: 600;">Motif du refus :</p>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 22px;">${escapeHtml(reason)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #52525b; font-size: 15px; line-height: 24px;">
                Vous pouvez corriger les informations et resoumettre votre demande depuis votre espace club.
                Si vous avez des questions, contactez notre support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; border-radius: 0 0 16px 16px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Profoot Profile. Cet email a été envoyé automatiquement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }),
}
