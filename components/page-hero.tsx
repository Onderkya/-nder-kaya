export function PageHero({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="hero-gradient text-white">
      <div className="container-page py-16 sm:py-20">
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{intro}</p>
      </div>
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="card flex items-start gap-3">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm"
            style={{ backgroundColor: "rgb(var(--primary))", color: "rgb(var(--primary-foreground))" }}
          >
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
