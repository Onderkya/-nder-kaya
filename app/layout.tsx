import "./globals.css";
import type { ReactNode } from "react";

// Pass-through root layout. <html> ve <body> locale ve admin layout'larında
// tanımlanır (next-intl çok dilli kök + ayrı admin kökü deseni).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
