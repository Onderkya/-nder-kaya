import type { ReactNode } from "react";

/**
 * template.tsx her gezinmede yeniden mount edilir; içeriğe hafif bir
 * giriş animasyonu (fade-up) uygulayarak framer-motion olmadan yumuşak
 * sayfa geçişi hissi verir. prefers-reduced-motion altında animasyon kapanır.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
