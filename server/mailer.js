// Dev mailer: prints emails to the console instead of sending them.
// Replace the body with a real provider (SMTP or an email API) before production.
export async function sendMail({ to, subject, text }) {
  console.log(`[mail] to=${to} subject="${subject}"\n${text}\n`)
}
