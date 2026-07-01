"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/** Kenar çubuğunu daraltıp genişletir — üst-sağda küçük ikon buton (masaüstü). */
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
    <button type="button" onClick={toggle} className="adm-collapse-btn" aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"} title={collapsed ? "Genişlet" : "Daralt"}>
      <Icon name="chevron" size={18} style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(90deg)" }} />
    </button>
  );
}
