"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappLink, telegramLink } from "@/lib/config";

type Msg = { role: "user" | "assistant"; content: string };

const UI: Record<string, { title: string; sub: string; ph: string; greet: string; ai: string; wa: string; tg: string; chips: string[]; foot: string }> = {
  tr: { title: "Antalya Bridge Asistan", sub: "Saniyeler içinde yanıt", ph: "Mesajını yaz…", greet: "Merhaba! 👋 Antalya tatili, Türkçe ders, Türkiye'de eğitim ya da yazılım danışmanlığı — hangisi için buradayız? Sana özel bir plan çıkaralım.", ai: "AI Asistan", wa: "WhatsApp", tg: "Telegram", chips: ["Antalya tatili planla", "Türkçe öğrenmek istiyorum", "Türkiye'de okumak", "Yazılım danışmanlığı"], foot: "Kesinleştirmek için WhatsApp'tan da yazabilirsin" },
  en: { title: "Antalya Bridge Assistant", sub: "Replies in seconds", ph: "Type your message…", greet: "Hi! 👋 Antalya holiday, Turkish lessons, studying in Turkey, or software consulting — what brings you here? Let's draft a plan just for you.", ai: "AI Assistant", wa: "WhatsApp", tg: "Telegram", chips: ["Plan an Antalya trip", "I want to learn Turkish", "Study in Turkey", "Software consulting"], foot: "You can also message us on WhatsApp" },
  ru: { title: "Ассистент Antalya Bridge", sub: "Ответ за секунды", ph: "Напишите сообщение…", greet: "Привет! 👋 Отдых в Анталье, турецкий язык, учёба в Турции или IT-консалтинг — что вас привело? Составим план специально для вас.", ai: "AI-ассистент", wa: "WhatsApp", tg: "Telegram", chips: ["Спланировать поездку", "Хочу учить турецкий", "Учёба в Турции", "IT-консалтинг"], foot: "Можно также написать в WhatsApp" },
  kk: { title: "Antalya Bridge көмекшісі", sub: "Секундта жауап", ph: "Хабарыңды жаз…", greet: "Сәлем! 👋 Анталия демалысы, түрік тілі, Түркияда оқу немесе бағдарламалық қамтым — не үшін келдің? Саған арнайы жоспар құрайық.", ai: "AI көмекші", wa: "WhatsApp", tg: "Telegram", chips: ["Сапар жоспарла", "Түрікше үйренгім келеді", "Түркияда оқу", "Бағдарламалық кеңес"], foot: "WhatsApp арқылы да жаза аласың" },
  uz: { title: "Antalya Bridge yordamchisi", sub: "Soniyalarda javob", ph: "Xabaringizni yozing…", greet: "Salom! 👋 Antalya dam olishi, turk tili, Turkiyada o'qish yoki dasturiy maslahat — nima uchun keldingiz? Sizga maxsus reja tuzamiz.", ai: "AI yordamchi", wa: "WhatsApp", tg: "Telegram", chips: ["Sayohat rejalashtirish", "Turk tilini o'rganmoqchiman", "Turkiyada o'qish", "Dasturiy maslahat"], foot: "WhatsApp orqali ham yozishingiz mumkin" },
};

export function FloatingContact({ locale = "tr" }: { locale?: string }) {
  const t = UI[locale] ?? UI.tr;
  const [open, setOpen] = useState(false);
  const [fanOpen, setFanOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ role: "assistant", content: t.greet }]);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, locale, history: next.slice(-12) }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.answer ?? "…" }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: t.foot }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Sohbet paneli */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border shadow-2xl sm:right-6" style={{ height: "min(70vh, 560px)", backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="flex items-center justify-between px-5 py-4 text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg">🌊</span>
              <div>
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-white/85"><span className="h-1.5 w-1.5 rounded-full bg-green-300" /> {t.sub}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="grid h-8 w-8 place-items-center rounded-full text-white/90 transition hover:bg-white/15">✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed" style={m.role === "user" ? { backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))", color: "#fff" } : { backgroundColor: "rgb(var(--muted))", color: "rgb(var(--foreground))" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="inline-flex gap-1.5 rounded-2xl px-4 py-3.5" style={{ backgroundColor: "rgb(var(--muted))" }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            {msgs.length <= 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.chips.map((ch) => (
                  <button key={ch} type="button" onClick={() => send(ch)} className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition hover:-translate-y-0.5" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--primary))" }}>{ch}</button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-3 py-3" style={{ borderColor: "rgb(var(--border))" }}>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.ph} className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2.5 text-sm outline-none" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }} />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Gönder" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white disabled:opacity-40" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </button>
            </form>
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px]" style={{ color: "rgb(var(--muted-foreground))" }}>
              <a href={whatsappLink()} target="_blank" rel="noopener" className="font-semibold hover:underline" style={{ color: "#25D366" }}>{t.wa}</a>
              <span>·</span>
              <a href={telegramLink()} target="_blank" rel="noopener" className="font-semibold hover:underline" style={{ color: "#229ED9" }}>{t.tg}</a>
            </div>
          </div>
        </div>
      )}

      {/* Yüzen buton kümesi */}
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
        <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${fanOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
          <a href={whatsappLink()} target="_blank" rel="noopener" aria-label={t.wa} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607z" /></svg>
          </a>
          <a href={telegramLink()} target="_blank" rel="noopener" aria-label={t.tg} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg transition hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
          </a>
        </div>

        <button type="button" onClick={() => setFanOpen((v) => !v)} aria-label="WhatsApp / Telegram" className="flex h-11 w-11 items-center justify-center rounded-full border text-white shadow-lg transition hover:scale-105" style={{ backgroundColor: "rgb(4 28 40 / 0.85)", borderColor: "rgb(255 255 255 / 0.2)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </button>

        <button type="button" onClick={() => setOpen((v) => !v)} aria-label={t.ai} className="flex items-center gap-2 rounded-full py-3 pl-3.5 pr-4 text-sm font-bold text-white shadow-xl transition hover:scale-[1.03]" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))", boxShadow: "0 10px 30px -8px rgb(var(--accent) / 0.6)" }}>
          <span className="ai-pulse grid h-7 w-7 place-items-center rounded-full bg-white/25 text-base">✦</span>
          {t.ai}
        </button>
      </div>
    </>
  );
}
