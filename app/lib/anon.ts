// lib/anon.ts

import { cookies } from "next/headers";

export async function getAnonId() {
  const cookieStore = await cookies();

  let anonId = cookieStore.get("anon_id")?.value;

  if (!anonId) {
    anonId = crypto.randomUUID();
  }

  return anonId;
}

export async function getAnonIdentity() {
  const cookieStore = await cookies();

  const existing = cookieStore.get("anon_id")?.value;

  if (existing) {
    return {
      anonId: existing,
      isNew: false,
    };
  }

  return {
    anonId: crypto.randomUUID(),
    isNew: true,
  };
}