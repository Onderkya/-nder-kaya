"use client";

import { useState } from "react";

type Slot = { id: string; startsAt: string; minutes: number };
type Labels = {
  pickSlot: string; noSlots: string; name: string; email: string; phone: string;
  note: string; submit: string; success: string; taken: string; error: string;
};

export function BookingWidget({ slots, locale, labels }: { slots: Slot[]; locale: string; labels: Labels }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "taken" | "error">("idle");

  if (slots.length === 0) {
    return <p className="text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.noSlots}</p>;
  }
  if (status === "ok") {
    return <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-300">{labels.success}</p>;
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || status === "sending") return;
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      slotId: selected,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""),
      locale,
    };
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setStatus("ok");
      else if (res.status === 409) setStatus("taken");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const field = "w-full rounded-lg border px-3 py-2 text-sm";
  const fieldStyle = { borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--background))" };

  return (
    <div>
      <p className="mb-3 text-sm font-medium">{labels.pickSlot}</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className="rounded-xl border px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-sm"
            style={
              selected === s.id
                ? { backgroundColor: "rgb(var(--primary))", color: "#fff", borderColor: "rgb(var(--primary))" }
                : { borderColor: "rgb(var(--border))" }
            }
          >
            {fmt(s.startsAt)} · {s.minutes}′
          </button>
        ))}
      </div>

      {selected && (
        <form onSubmit={submit} className="grid max-w-xl gap-3">
          {/* honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <input name="name" required placeholder={labels.name} className={field} style={fieldStyle} />
          <input name="email" type="email" placeholder={labels.email} className={field} style={fieldStyle} />
          <input name="phone" placeholder={labels.phone} className={field} style={fieldStyle} />
          <textarea name="message" rows={3} placeholder={labels.note} className={field} style={fieldStyle} />
          {status === "taken" && <p className="text-sm text-amber-600">{labels.taken}</p>}
          {status === "error" && <p className="text-sm text-red-600">{labels.error}</p>}
          <button disabled={status === "sending"} className="btn-primary disabled:opacity-60">
            {labels.submit}
          </button>
        </form>
      )}
    </div>
  );
}
