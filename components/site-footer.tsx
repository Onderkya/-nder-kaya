import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { siteConfig, whatsappLink, telegramLink } from "@/lib/config";
import { Logo } from "./logo";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const meta = useTranslations("meta");
  const year = new Date().getFullYear();

  const social = [
    { href: siteConfig.social.instagram, label: "Instagram" },
    { href: siteConfig.social.tiktok, label: "TikTok" },
    { href: siteConfig.social.facebook, label: "Facebook" },
    { href: siteConfig.social.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t" style={{ borderColor: "rgb(var(--border))" }}>
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
            {meta("tagline")}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("services")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/antalya" className="hover:underline">{nav("antalya")}</Link></li>
            <li><Link href="/lessons" className="hover:underline">{nav("lessons")}</Link></li>
            <li><Link href="/education" className="hover:underline">{nav("education")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("quickLinks")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">{nav("about")}</Link></li>
            <li><Link href="/faq" className="hover:underline">{nav("faq")}</Link></li>
            <li><Link href="/contact" className="hover:underline">{nav("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("contact")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href={whatsappLink()} target="_blank" rel="noopener" className="hover:underline">WhatsApp</a></li>
            <li><a href={telegramLink()} target="_blank" rel="noopener" className="hover:underline">Telegram</a></li>
            <li><a href={`mailto:${siteConfig.email}`} className="hover:underline">{siteConfig.email}</a></li>
          </ul>
          {social.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">{t("follow")}</p>
              <ul className="flex flex-wrap gap-3 text-sm">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener" className="hover:underline">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t py-4 text-center text-xs sm:flex-row" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}>
        <span>© {year} {meta("siteName")}. {t("rights")}</span>
        <span>
          Görseller / Photos:{" "}
          <a href="https://commons.wikimedia.org/wiki/Category:Antalya" target="_blank" rel="noopener" className="link-underline">
            Wikimedia Commons
          </a>{" "}
          · CC BY-SA
        </span>
      </div>
    </footer>
  );
}
