"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to Hokomi</h1>

      <p className="text-lg mb-4">
        {session ? `Hello, ${session.user?.name || "User"}!` : "You are not logged in."}
      </p>
      
      <div className="flex space-x-4">
        <Link href="/anime">
        <Button>Anime</Button>
        </Link>
        <Link href="/manga">
          <Button>Manga</Button>
        </Link>
      </div>
    </div>
  );
}
