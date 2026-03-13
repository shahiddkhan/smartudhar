"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* HEADER */}

      <header className="flex justify-between items-center p-4 bg-white shadow">
        <button onClick={() => setOpen(!open)} className="text-xl">
          ☰
        </button>

        <h1 className="font-bold">SmartUdhar</h1>

        <div></div>
      </header>

      {/* MENU */}

      {open && (
        <div className="bg-white border-b shadow p-4 space-y-2">
          <Link href="/dashboard/settings" className="block text-slate-700">
            Settings
          </Link>

          <button onClick={logout} className="block text-red-500">
            Logout
          </button>
        </div>
      )}

      {children}

      {/* BOTTOM NAV */}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-sm font-medium">
        <Link
          href="/dashboard"
          className={
            pathname === "/dashboard" ? "text-green-600" : "text-slate-400"
          }
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/customers"
          className={
            pathname === "/dashboard/customers"
              ? "text-green-600"
              : "text-slate-400"
          }
        >
          Customers
        </Link>

        <Link
          href="/dashboard/archived"
          className={
            pathname === "/dashboard/archived"
              ? "text-green-600"
              : "text-slate-400"
          }
        >
          Archived
        </Link>
      </nav>
    </div>
  );
}
