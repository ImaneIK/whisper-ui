"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // allow auth to hydrate (localStorage / session)
    const t = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      setReady(true);
    }, 50);

    return () => clearTimeout(t);
  }, [isAuthenticated, router]);

  if (!ready || !isAuthenticated) return null;

  return <>{children}</>;
}