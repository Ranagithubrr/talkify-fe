"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Wait for client hydration then guard
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <main className="min-h-screen bg-[#0a1221]" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a1221] text-white">
      <div className="rounded-2xl border border-white/10 bg-[#0f1729]/80 px-6 py-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm text-slate-300">Signed in as</p>
        <p className="text-lg font-semibold">{user?.email ?? user?.name ?? "Authenticated user"}</p>
      </div>
    </main>
  );
}
