"use client";

import { useEffect } from "react";

export function AnonProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let anonId = localStorage.getItem("anonId");

    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem("anonId", anonId);
    }
  }, []);

  return <>{children}</>;
}