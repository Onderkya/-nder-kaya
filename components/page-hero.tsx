import Image from "next/image";
import { Reveal } from "./reveal";
import { IconCheck } from "./icons";

/**
 * Tüm iç sayfaların ortak foto hero'su — gerçek Antalya görseli + koyu kaplama
 * üzerinde serif başlık. `image` ile sayfaya özel görsel verilebilir.
 */
export function PageHero({
  title,
  intro,
  image = "/images/yivli.jpg",
  eyebrow,
}: {
  title: string;
  intro?: string;
  image?: string;
  eyebrow?: string;
}) {
  return (
    <section className="relative -mt-16 flex min-h-[58svh] items-end overflow-hidden" style={{ backgroundColor: "#07212b" }}>
      <div className="ken-burns absolute inset-0">
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="img-scrim absolute inset-0" />
      <div className="container-wide relative z-10 w-full pb-14 pt-32 text-white sm:pb-20">
        {eyebrow ? (
          <p className="eyebrow animate-fade-up text-white/80">{eyebrow}</p>
        ) : null}
        <h1 className="h-hero animate-fade-up delay-1 mt-5 max-w-3xl text-balance">{title}</h1>
        {intro ? (
          <p className="animate-fade-up delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p>
        ) : null}
      </div>
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item}
          delay={i * 70}
          className="card flex items-start gap-3.5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}
          >
            <IconCheck />
          </span>
          <span className="leading-relaxed">{item}</span>
        </Reveal>
      ))}
    </ul>
  );
}
