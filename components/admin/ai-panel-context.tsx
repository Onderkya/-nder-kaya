"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * AI yan panelinin aç/kapa durumu + "soruyla aç" köprüsü. Layout bunu tüm
 * admin kabuğunun etrafına sarar; TopBar butonu ve dashboard kartı buradan
 * paneli açar. Sohbet geçmişi panelde yaşar — burada yalnızca kabuk durumu.
 */

type AiPanelContextValue = {
  /** OPENROUTER anahtarı + salt-okunur DB hazır mı (layout hesaplar). */
  available: boolean;
  isOpen: boolean;
  open: () => void;
  /** Paneli açar ve soruyu kuyruğa koyar; panel açılınca gönderir. */
  openWith: (question: string) => void;
  close: () => void;
  /** openWith ile kuyruklanan soru — panel gönderince temizler. */
  pending: string | null;
  clearPending: () => void;
};

const AiPanelContext = createContext<AiPanelContextValue | null>(null);

export function AiPanelProvider({ available, children }: { available: boolean; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const openWith = useCallback((question: string) => {
    setPending(question);
    setIsOpen(true);
  }, []);
  const clearPending = useCallback(() => setPending(null), []);

  const value = useMemo(
    () => ({ available, isOpen, open, openWith, close, pending, clearPending }),
    [available, isOpen, open, openWith, close, pending, clearPending],
  );

  return <AiPanelContext.Provider value={value}>{children}</AiPanelContext.Provider>;
}

export function useAiPanel(): AiPanelContextValue {
  const ctx = useContext(AiPanelContext);
  if (!ctx) throw new Error("useAiPanel, AiPanelProvider içinde kullanılmalı.");
  return ctx;
}
