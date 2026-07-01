import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/**
 * Admin paneli paylaşılan tasarım parçaları. Hepsi server-safe (hook yok).
 * Stiller app/admin/admin.css'teki `.adm-*` sınıflarından gelir; sayfalar bu
 * bileşenleri VEYA doğrudan `.adm-*` sınıflarını kullanabilir.
 */

/** Sayfa başlığı: eyebrow + büyük Cormorant başlık + açıklama + sağda aksiyonlar. */
export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="adm-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="adm-title text-[1.9rem] sm:text-[2.3rem]">{title}</h1>
        {description ? <p className="adm-muted mt-1.5 max-w-2xl text-[14.5px] leading-relaxed">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

export function Card({ children, className = "", featured = false, pad = true }: { children: ReactNode; className?: string; featured?: boolean; pad?: boolean }) {
  return <div className={`adm-card ${featured ? "adm-card-featured" : ""} ${pad ? "adm-card-pad" : ""} ${className}`}>{children}</div>;
}

/** Katlanabilir bölüm (native <details> — JS yok, her yerde çalışır). */
export function Section({ title, description, icon, defaultOpen = true, children }: { title: string; description?: string; icon?: IconName; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details className="adm-section adm-card adm-card-pad" {...(defaultOpen ? { open: true } : {})}>
      <summary className="flex items-center gap-3">
        {icon ? <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name={icon} size={18} /></span> : null}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>{title}</span>
          {description ? <span className="adm-muted block text-[13px]">{description}</span> : null}
        </span>
        <Icon name="chevron" size={18} className="adm-chev adm-muted" />
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

/** Metrik kartı: küçük etiket + büyük Cormorant sayı + ipucu + ikon. */
export function StatCard({ label, value, hint, icon, tone = "neutral" }: { label: string; value: ReactNode; hint?: string; icon?: IconName; tone?: "neutral" | "success" | "warn" | "danger" }) {
  const toneColor = tone === "success" ? "rgb(var(--primary))" : tone === "warn" ? "rgb(var(--gold))" : tone === "danger" ? "rgb(var(--accent))" : "rgb(var(--muted-foreground))";
  return (
    <div className="adm-card adm-card-pad adm-rise">
      <div className="flex items-start justify-between gap-3">
        <p className="adm-muted text-[12.5px] font-semibold uppercase tracking-wide">{label}</p>
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: toneColor }}><Icon name={icon} size={18} /></span> : null}
      </div>
      <p className="adm-num mt-3 text-[2.4rem]">{value}</p>
      {hint ? <p className="adm-muted mt-1 text-[12.5px]">{hint}</p> : null}
    </div>
  );
}

export function Field({ label, help, htmlFor, children, className = "" }: { label?: string; help?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label ? <label className="adm-label" htmlFor={htmlFor}>{label}</label> : null}
      {children}
      {help ? <p className="adm-help">{help}</p> : null}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" }) {
  return <span className={`adm-badge adm-badge-${tone}`}>{children}</span>;
}

export function EmptyState({ icon = "inbox", title, description, action }: { icon?: IconName; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}><Icon name={icon} size={22} /></span>
      <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{title}</p>
      {description ? <p className="adm-muted mx-auto mt-1 max-w-md text-[13.5px]">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** "Bu, sitenizde şurada görünür" bağlam satırı — CMS/içerik editörleri için. */
export function LocationHint({ children }: { children: ReactNode }) {
  return (
    <p className="adm-help flex items-center gap-1.5" style={{ color: "rgb(var(--primary))" }}>
      <Icon name="eye" size={14} /> <span>{children}</span>
    </p>
  );
}
