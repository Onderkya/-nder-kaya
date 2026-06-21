import { WaveDivider } from "./wave";
import { IconCheck } from "./icons";

export function PageHero({ title, intro }: { title: string; intro?: string }) {
  return (
    <section className="hero-gradient text-white">
      <div className="container-page relative z-10 py-16 sm:py-20">
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl animate-fade-up">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 max-w-2xl text-lg text-white/85 animate-fade-up">{intro}</p>
        ) : null}
      </div>
      <WaveDivider />
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="card flex items-start gap-3 transition hover:shadow-md">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}
          >
            <IconCheck />
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
