"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const tabClass = (route: string) =>
    `flex-1 text-center py-3 text-sm ${
      path === route ? "text-green-600 font-semibold" : "text-slate-500"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => router.push("/dashboard")}
          className={tabClass("/dashboard")}
        >
          Dashboard
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className={tabClass("/dashboard")}
        >
          Customers
        </button>

        <button
          onClick={() => router.push("/dashboard/archived")}
          className={tabClass("/dashboard/archived")}
        >
          Archived
        </button>
      </div>
    </div>
  );
}
