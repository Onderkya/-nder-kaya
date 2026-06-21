/**
 * Sayfa yüklenirken gösterilen hafif, tema uyumlu iskelet (skeleton).
 * Boş ekran yerine içeriğin geleceğini sezdirir; CLS'i azaltır.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="hero-gradient">
        <div className="container-page py-20 sm:py-28">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/20" />
          <div className="mt-5 h-12 w-3/4 animate-pulse rounded-2xl bg-white/15 sm:h-16" />
          <div className="mt-4 h-5 w-1/2 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card">
              <div className="h-14 w-14 animate-pulse rounded-2xl surface-muted" />
              <div className="mt-5 h-5 w-2/3 animate-pulse rounded-full surface-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-full surface-muted" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full surface-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
