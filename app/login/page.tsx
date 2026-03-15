"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // AUTO LOGIN IF SESSION EXISTS
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/dashboard");
      }
    };

    checkSession();
  }, [router]);

  const login = async () => {
    if (phone.length !== 10) {
      alert("Enter valid 10 digit phone number");
      return;
    }

    if (!password) {
      alert("Enter password");
      return;
    }

    const fullPhone = `+91${phone}`;

    const { data, error } = await supabase.auth.signInWithPassword({
      phone: fullPhone,
      password: password,
    });

    if (error) {
      alert("Invalid login");
      return;
    }

    if (data.session) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        {/* PHONE */}

        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          maxLength={10}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none"
        />

        {/* PASSWORD */}

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-6 outline-none"
        />

        {/* LOGIN BUTTON */}

        <button
          onClick={login}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-black transition"
        >
          Login
        </button>
      </div>
    </main>
  );
}
