"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signup = async () => {
    if (!phone || !password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const email = `${phone}@smartudhar.com`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Signup failed");
      return;
    }

    alert("Account created. Please login.");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none"
        />

        <button
          onClick={signup}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}
