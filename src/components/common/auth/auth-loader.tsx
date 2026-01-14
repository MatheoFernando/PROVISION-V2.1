"use client";

import { useMe } from "@/infrastructure/hooks/useMe";
import { getAccessToken } from "@/infrastructure/utils/api";

export function AuthLoader() {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  
  useMe();

  return null;
}



