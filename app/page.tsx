"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // AUTO LOGIN CHECK
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">SmartUdhar</h1>

        <p className="text-slate-600 mb-8">Simple Udhar Management</p>

        {/* LOGIN BUTTON */}

        <button
          onClick={() => router.push("/login")}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-black transition mb-4"
        >
          Login
        </button>

        {/* CREATE ACCOUNT BUTTON */}

        <button
          onClick={() => router.push("/signup")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}
