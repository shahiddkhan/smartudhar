"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {

  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">

      <h1 className="text-xl font-bold">Settings</h1>

      <button
        onClick={logout}
        className="w-full bg-red-500 text-white py-3 rounded-lg"
      >
        Logout
      </button>

    </div>
  );
}