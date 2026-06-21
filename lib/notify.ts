import nodemailer from "nodemailer";

/**
 * Bildirim katmanı:
 *  - notifyOwner: yeni talep/mesaj geldiğinde site sahibine e-posta + Telegram.
 *  - notifyCustomer: müşteriye lokalize onay e-postası (iletişim/rezervasyon).
 * Tüm kanallar opsiyoneldir; ilgili ortam değişkenleri yoksa sessizce atlanır.
 */

type Notification = {
  title: string;
  lines: string[];
};

export async function notifyOwner(n: Notification) {
  await Promise.allSettled([sendOwnerEmail(n), sendTelegram(n)]);
}

function transporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/** Düşük seviye e-posta gönderimi (SMTP yoksa sessiz atlar). */
export async function sendMail(opts: { to: string; subject: string; text: string; html: string }) {
  const t = transporter();
  if (!t) return;
  await t.sendMail({
    from: `"Antalya Bridge" <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

async function sendOwnerEmail({ title, lines }: Notification) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await sendMail({
    to,
    subject: title,
    text: lines.join("\n"),
    html: `<h2>${escapeHtml(title)}</h2>${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}`,
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
    body: JSON.stringify({ chat_id: TELEGRAM_OWNER_CHAT_ID, text }),
  });
}

// --- Müşteriye lokalize onay ---
type Kind = "contact" | "booking" | "payment";
type Copy = { subject: string; greeting: (name: string) => string; body: string; signoff: string };

const COPY: Record<string, Record<Kind, Copy>> = {
  tr: {
    contact: { subject: "Mesajınızı aldık — Antalya Bridge", greeting: (n) => `Merhaba ${n},`, body: "Mesajınız bize ulaştı. En kısa sürede kişisel olarak döneceğiz.", signoff: "Antalya Bridge ekibi" },
    booking: { subject: "Randevu talebiniz alındı — Antalya Bridge", greeting: (n) => `Merhaba ${n},`, body: "Randevu talebiniz alındı. Onaylamak için en kısa sürede sizinle iletişime geçeceğiz.", signoff: "Antalya Bridge ekibi" },
    payment: { subject: "Ödemeniz alındı — Antalya Bridge", greeting: (n) => `Merhaba ${n},`, body: "Ödemeniz başarıyla alındı ve onaylandı. Teşekkür ederiz! Süreçle ilgili en kısa sürede sizinle iletişime geçeceğiz.", signoff: "Antalya Bridge ekibi" },
  },
  en: {
    contact: { subject: "We received your message — Antalya Bridge", greeting: (n) => `Hello ${n},`, body: "Your message has reached us. We'll get back to you personally as soon as possible.", signoff: "The Antalya Bridge team" },
    booking: { subject: "Your booking request was received — Antalya Bridge", greeting: (n) => `Hello ${n},`, body: "We received your booking request. We'll contact you shortly to confirm it.", signoff: "The Antalya Bridge team" },
    payment: { subject: "Your payment was received — Antalya Bridge", greeting: (n) => `Hello ${n},`, body: "Your payment has been received and confirmed. Thank you! We'll be in touch shortly about the next steps.", signoff: "The Antalya Bridge team" },
  },
  ru: {
    contact: { subject: "Мы получили ваше сообщение — Antalya Bridge", greeting: (n) => `Здравствуйте, ${n}!`, body: "Ваше сообщение получено. Мы свяжемся с вами лично в ближайшее время.", signoff: "Команда Antalya Bridge" },
    booking: { subject: "Ваша заявка на запись получена — Antalya Bridge", greeting: (n) => `Здравствуйте, ${n}!`, body: "Мы получили вашу заявку на запись. Мы свяжемся с вами в ближайшее время для подтверждения.", signoff: "Команда Antalya Bridge" },
    payment: { subject: "Ваш платёж получен — Antalya Bridge", greeting: (n) => `Здравствуйте, ${n}!`, body: "Ваш платёж получен и подтверждён. Спасибо! Мы свяжемся с вами в ближайшее время по поводу дальнейших шагов.", signoff: "Команда Antalya Bridge" },
  },
  kk: {
    contact: { subject: "Хабарламаңызды алдық — Antalya Bridge", greeting: (n) => `Сәлеметсіз бе, ${n}!`, body: "Хабарламаңыз бізге жетті. Жақын арада сізге жеке хабарласамыз.", signoff: "Antalya Bridge командасы" },
    booking: { subject: "Жазылу өтінішіңіз қабылданды — Antalya Bridge", greeting: (n) => `Сәлеметсіз бе, ${n}!`, body: "Жазылу өтінішіңіз қабылданды. Растау үшін жақын арада сізбен хабарласамыз.", signoff: "Antalya Bridge командасы" },
    payment: { subject: "Төлеміңіз қабылданды — Antalya Bridge", greeting: (n) => `Сәлеметсіз бе, ${n}!`, body: "Төлеміңіз сәтті қабылданып, расталды. Рахмет! Келесі қадамдар туралы жақын арада сізбен хабарласамыз.", signoff: "Antalya Bridge командасы" },
  },
  uz: {
    contact: { subject: "Xabaringizni oldik — Antalya Bridge", greeting: (n) => `Salom ${n},`, body: "Xabaringiz bizga yetib keldi. Tez orada shaxsan javob beramiz.", signoff: "Antalya Bridge jamoasi" },
    booking: { subject: "Band qilish so'rovingiz qabul qilindi — Antalya Bridge", greeting: (n) => `Salom ${n},`, body: "Band qilish so'rovingiz qabul qilindi. Tasdiqlash uchun tez orada siz bilan bog'lanamiz.", signoff: "Antalya Bridge jamoasi" },
    payment: { subject: "To'lovingiz qabul qilindi — Antalya Bridge", greeting: (n) => `Salom ${n},`, body: "To'lovingiz muvaffaqiyatli qabul qilindi va tasdiqlandi. Rahmat! Keyingi qadamlar bo'yicha tez orada bog'lanamiz.", signoff: "Antalya Bridge jamoasi" },
  },
};

/** Müşteriye onay e-postası (e-posta/SMTP yoksa sessiz atlar). */
export async function notifyCustomer(to: string, locale: string, kind: Kind, name: string) {
  if (!to) return;
  const c = (COPY[locale] ?? COPY.en)[kind];
  const text = `${c.greeting(name || "")}\n\n${c.body}\n\n${c.signoff}`;
  const html = `<p>${escapeHtml(c.greeting(name || ""))}</p><p>${escapeHtml(c.body)}</p><p>${escapeHtml(c.signoff)}</p>`;
  await sendMail({ to, subject: c.subject, text, html });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
