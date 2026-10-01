"use client";

import { useEffect } from "react";
import { playClickSound } from "../utils/sound";

export default function GlobalSound() {
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Agar click kisi button, link ya tab par hua hai
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input[type='checkbox']") ||
        target.closest(".more-card") ||
        target.closest(".bottom-nav a")
      ) {
        playClickSound();
      }
    }

    window.addEventListener("click", handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return null;
}
