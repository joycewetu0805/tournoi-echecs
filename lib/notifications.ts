type NotificationPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: NotificationPayload) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP not configured. Skipping email:', payload.subject);
    return;
  }
  // Placeholder for SMTP integration or Supabase Edge Function call.
  // Use a server-side mailer in production.
}

export function buildNotificationTemplate(type: string, data: Record<string, any>) {
  switch (type) {
    case 'registration_confirmed':
      return {
        subject: 'Inscription recue',
        html: `<p>Votre inscription est en attente de validation.</p>`
      };
    case 'payment_validated':
      return {
        subject: 'Paiement valide',
        html: `<p>Votre paiement est valide. Vous etes officiellement inscrit.</p>`
      };
    case 'draw_published':
      return {
        subject: 'Tirage publie',
        html: `<p>Le tirage officiel est disponible.</p>`
      };
    case 'match_reminder':
      return {
        subject: 'Rappel de match',
        html: `<p>Votre match commence dans une heure.</p>`
      };
    case 'result_notification':
      return {
        subject: 'Resultat valide',
        html: `<p>Votre resultat a ete valide.</p>`
      };
    default:
      return {
        subject: 'Notification Tournoi',
        html: `<p>Mise a jour.</p>`
      };
  }
}
