"use client";

import { useEffect } from "react";

export const Tuna = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (import.meta.env.VITE_TUNA_ENABLED === "true") {
      const w = window as any;
      if (w.aptible?.event) {
        w.aptible.event("pageview", null);
      }
    }
  }, []);
  return null;
};
