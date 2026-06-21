"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

type Labels = {
  name: string; email: string; phone: string; service: string;
  serviceAntalya: string; serviceLessons: string; serviceEducation: string; serviceOther: string;
  message: string; submit: string; success: string; error: string;
};

export function ContactForm({ labels }: { labels: Labels }) {
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const inputClass =
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2";
  const inputStyle = {
    backgroundColor: "rgb(var(--card))",
    borderColor: "rgb(var(--border))",
    color: "rgb(var(--card-foreground))",
  } as const;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="card text-center">
        <div className="text-4xl">✅</div>
        <p className="mt-4 font-medium">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">{labels.name}</label>
        <input name="name" required className={inputClass} style={inputStyle} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{labels.email}</label>
          <input name="email" type="email" required className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{labels.phone}</label>
          <input name="phone" className={inputClass} style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{labels.service}</label>
        <select name="service" className={inputClass} style={inputStyle} defaultValue="">
          <option value="" disabled>—</option>
          <option value="antalya">{labels.serviceAntalya}</option>
          <option value="lessons">{labels.serviceLessons}</option>
          <option value="education">{labels.serviceEducation}</option>
          <option value="other">{labels.serviceOther}</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{labels.message}</label>
        <textarea name="message" required rows={5} className={inputClass} style={inputStyle} />
      </div>
      {status === "error" && (
        <p className="text-sm font-medium text-red-500">{labels.error}</p>
      )}
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
        {labels.submit}
      </button>
    </form>
  );
}
