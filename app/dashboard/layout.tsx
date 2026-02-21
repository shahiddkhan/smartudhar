"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItem = (path: string, label: string) => {
    const active = pathname === path;

    return (
      <button
        onClick={() => router.push(path)}
        className={`flex-1 py-3 text-sm font-semibold ${
          active ? "text-slate-900" : "text-slate-500"
        }`}
      >
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg font-bold text-slate-900">
          SmartUdhar
        </h1>

        <button
          onClick={logout}
          className="text-sm font-semibold text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>

      {children}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex">
        {navItem("/dashboard", "Dashboard")}
        {navItem("/dashboard/customers", "Customers")}
        {navItem("/dashboard/archived", "Archived")}
      </div>
    </div>
  );
}