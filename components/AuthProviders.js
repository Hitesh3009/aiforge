"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProviders({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
