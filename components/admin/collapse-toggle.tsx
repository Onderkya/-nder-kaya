"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/** Masaüstü kenar çubuğunu daraltıp genişletir (ikon-only ↔ tam). localStorage'da tutulur. */
export function CollapseToggle() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(document.documentElement.getAttribute("data-adm-collapsed") === "1");
  }, []);

  const toggle = () => {
    const nv = !collapsed;
    setCollapsed(nv);
    document.documentElement.setAttribute("data-adm-collapsed", nv ? "1" : "0");
    try {
      localStorage.setItem("adm-collapsed", nv ? "1" : "0");
    } catch {
      /* yok say */
    }
  };

  return (
    <button type="button" onClick={toggle} className="adm-side-btn" aria-label="Menüyü daralt/genişlet">
      <Icon name="menu" size={18} />
      <span className="adm-side-text">{collapsed ? "Genişlet" : "Menüyü daralt"}</span>
    </button>
  );
}
