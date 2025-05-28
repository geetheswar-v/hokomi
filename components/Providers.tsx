"use client";

import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/Header";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </SessionProvider>
  );
}
