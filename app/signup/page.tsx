"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signup = async () => {
    // PHONE VALIDATION
    if (phone.length !== 10) {
      alert("Phone must be 10 digits");
      return;
    }

    // PASSWORD VALIDATION
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // PASSWORD MATCH CHECK
    if (password !== confirmPassword) {
      alert("Passwords must match");
      return;
    }

    const fullPhone = `+91${phone}`;

    const { error } = await supabase.auth.signUp({
      phone: fullPhone,
      password: password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Please login.");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

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
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none"
        />

        {/* CONFIRM PASSWORD */}

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 mb-6 outline-none"
        />

        {/* CREATE ACCOUNT BUTTON */}

        <button
          onClick={signup}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}
