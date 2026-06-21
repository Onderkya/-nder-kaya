import nodemailer from "nodemailer";

/**
 * Bildirim katmanı: yeni bir talep/mesaj geldiğinde site sahibine
 * e-posta + Telegram üzerinden haber verir. Her iki kanal da opsiyoneldir;
 * ilgili ortam değişkenleri yoksa sessizce atlanır.
 */

type Notification = {
  title: string;
  lines: string[];
};

export async function notifyOwner(n: Notification) {
  await Promise.allSettled([sendEmail(n), sendTelegram(n)]);
}

async function sendEmail({ title, lines }: Notification) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Antalya Bridge" <${SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    subject: title,
    text: lines.join("\n"),
    html: `<h2>${title}</h2>${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}`,
  });
}

async function sendTelegram({ title, lines }: Notification) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_OWNER_CHAT_ID) return;

  // parse_mode KULLANILMAZ: kullanıcıdan gelen metin markdown/HTML olarak
  // yorumlanmaz (enjeksiyon önlenir). Düz metin gönderilir.
  const text = `${title}\n\n${lines.join("\n")}`;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_OWNER_CHAT_ID,
      text,
    }),
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
