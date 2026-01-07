"use client";

export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-sm font-semibold text-white">
      {initial}
    </div>
  );
}
