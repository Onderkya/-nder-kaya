import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { IconArrow } from "@/components/icons";
import { itemCount } from "@/lib/cms-blocks";
import type { CmsBlock, CmsPage } from "@/lib/cms";

/** İç bağlantıya locale öneki ekler; dış/anchor bağlantıyı olduğu gibi bırakır. */
function hrefFor(href: string | undefined, locale: string): string | null {
  if (!href) return null;
  if (href.startsWith("/")) return `/${locale}${href}`;
  return href;
}

function paragraphs(text: string) {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

function Btn({ href, children, accent = true }: { href: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <a href={href} className={accent ? "btn-accent" : "btn-primary"}>
      {children} <IconArrow />
    </a>
  );
}

function Block({ b, locale }: { b: CmsBlock; locale: string }) {
  const t = b.text;
  const p = b.props as Record<string, string | undefined>;
  const img = (p.image as string) || b.media || null;

  switch (b.type) {
    case "hero":
      return (
        <section className="relative flex min-h-[70svh] items-end overflow-hidden">
          {img ? <Image src={img} alt={t.title || ""} fill priority sizes="100vw" className="object-cover" /> : <div className="absolute inset-0" style={{ backgroundColor: "rgb(var(--primary) / 0.15)" }} />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.35), rgb(4 18 24 / 0.82))" }} />
          <div className="container-wide relative z-10 w-full pb-16 pt-36 text-white">
            {t.eyebrow ? <p className="eyebrow text-white/85">{t.eyebrow}</p> : null}
            {t.title ? <h1 className="h-hero mt-6 max-w-4xl text-balance">{t.title}</h1> : null}
            {t.subtitle ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{t.subtitle}</p> : null}
            {t.ctaText && hrefFor(p.ctaHref, locale) ? <div className="mt-9"><Btn href={hrefFor(p.ctaHref, locale)!}>{t.ctaText}</Btn></div> : null}
          </div>
        </section>
      );

    case "heading":
      return (
        <section className="container-wide py-20 sm:py-24">
          <Reveal className={`mx-auto max-w-2xl ${p.align === "left" ? "" : "text-center"}`}>
            {t.eyebrow ? <p className={`eyebrow ${p.align === "left" ? "" : "justify-center"}`} style={{ color: "rgb(var(--accent))" }}>{t.eyebrow}</p> : null}
            {t.title ? <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{t.title}</h2> : null}
            {t.body ? <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{t.body}</p> : null}
          </Reveal>
        </section>
      );

    case "richtext":
      return (
        <section className="container-page py-12 sm:py-16">
          <Reveal className="mx-auto max-w-2xl space-y-5">
            {paragraphs(t.body || "").map((para, i) => (
              <p key={i} className="text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{para}</p>
            ))}
          </Reveal>
        </section>
      );

    case "image":
      return (
        <section className="container-wide py-12">
          <Reveal>
            <figure className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-xl">
              {img ? <Image src={img} alt={t.caption || ""} fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" /> : null}
            </figure>
            {t.caption ? <figcaption className="mt-3 text-center text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{t.caption}</figcaption> : null}
          </Reveal>
        </section>
      );

    case "imageText":
      return (
        <section className="container-wide py-12 sm:py-16">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <figure className={`relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-xl ${p.flip ? "lg:order-2" : ""}`}>
                {img ? <Image src={img} alt={t.title || ""} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" /> : null}
              </figure>
              <div className={p.flip ? "lg:order-1" : ""}>
                {t.title ? <h2 className="font-display font-semibold leading-tight" style={{ color: "rgb(var(--foreground))", fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>{t.title}</h2> : null}
                {t.body ? <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{t.body}</p> : null}
              </div>
            </div>
          </Reveal>
        </section>
      );

    case "cta":
      return (
        <section className="relative overflow-hidden py-20 text-white sm:py-24" style={{ background: "linear-gradient(135deg, #0d94a8 0%, #0e7490 50%, #07303d 130%)" }}>
          <span className="sheen" />
          <div className="container-wide relative">
            <Reveal className="mx-auto max-w-2xl text-center">
              {t.title ? <h2 className="h-section text-balance">{t.title}</h2> : null}
              {t.body ? <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">{t.body}</p> : null}
              {t.ctaText && hrefFor(p.ctaHref, locale) ? <div className="mt-9"><Btn href={hrefFor(p.ctaHref, locale)!}>{t.ctaText}</Btn></div> : null}
            </Reveal>
          </div>
        </section>
      );

    case "quote":
      return (
        <section className="container-wide py-16 sm:py-20">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="font-display block text-6xl leading-none" style={{ color: "rgb(var(--lagoon))" }}>“</span>
            <blockquote className="font-display mt-2 text-balance leading-snug" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: "rgb(var(--foreground))" }}>{t.body}</blockquote>
            {t.by ? <figcaption className="mt-6 text-sm font-semibold" style={{ color: "rgb(var(--muted-foreground))" }}>— {t.by}</figcaption> : null}
          </Reveal>
        </section>
      );

    case "cards": {
      const n = itemCount(b.props);
      const cards = Array.from({ length: n }, (_, i) => ({
        title: t[`c${i}Title`], body: t[`c${i}Body`], img: p[`c${i}Img`], href: hrefFor(p[`c${i}Href`], locale),
      }));
      return (
        <section className="container-wide py-20 sm:py-24">
          {t.title ? <Reveal className="mx-auto mb-12 max-w-2xl text-center"><h2 className="h-section text-balance" style={{ color: "rgb(var(--foreground))" }}>{t.title}</h2></Reveal> : null}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => {
              const inner = (
                <>
                  {c.img ? <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl"><Image src={c.img} alt={c.title || ""} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" /></div> : null}
                  <h3 className="font-display text-lg font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{c.title}</h3>
                  {c.body ? <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{c.body}</p> : null}
                  {c.href ? <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>→</span> : null}
                </>
              );
              return (
                <Reveal key={i} delay={i * 70} className="h-full">
                  {c.href ? (
                    <a href={c.href} className="card-lift flex h-full flex-col rounded-3xl border p-6" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>{inner}</a>
                  ) : (
                    <div className="flex h-full flex-col rounded-3xl border p-6" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>
      );
    }

    case "faq": {
      const n = itemCount(b.props, 4);
      const items = Array.from({ length: n }, (_, i) => ({ q: t[`q${i}`], a: t[`a${i}`] })).filter((x) => x.q);
      return (
        <section className="container-wide py-20 sm:py-24">
          {t.title ? <Reveal className="mx-auto mb-10 max-w-2xl text-center"><h2 className="h-section text-balance" style={{ color: "rgb(var(--foreground))" }}>{t.title}</h2></Reveal> : null}
          <div className="mx-auto max-w-2xl space-y-3">
            {items.map((it, i) => (
              <details key={i} className="rounded-2xl border p-5" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                <summary className="cursor-pointer font-semibold" style={{ color: "rgb(var(--foreground))" }}>{it.q}</summary>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{it.a}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

/** Yönetilen bir sayfanın tüm bloklarını render eder. */
export function BlockRenderer({ page, locale }: { page: CmsPage; locale: string }) {
  return (
    <>
      {page.blocks.map((b) => (
        <Block key={b.id} b={b} locale={locale} />
      ))}
    </>
  );
}
