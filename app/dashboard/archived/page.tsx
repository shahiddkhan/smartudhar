"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

export default function ArchivedPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadArchived();
  }, []);

  const loadArchived = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.push("/");
      return;
    }

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", true)
      .order("id", { ascending: false });

    if (data) setCustomers(data);
  };

  const restoreCustomer = async (id: number) => {
    await supabase
      .from("customers")
      .update({ is_archived: false })
      .eq("id", id);

    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

      <h2 className="text-xl font-bold text-slate-900">
        Archived Customers
      </h2>

      {customers.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
          No archived customers
        </div>
      ) : (
        customers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {c.name}
              </p>
              {c.phone && (
                <p className="text-sm text-slate-600">
                  {c.phone}
                </p>
              )}
            </div>

            <button
              onClick={() => restoreCustomer(c.id)}
              className="px-3 py-1.5 text-xs font-semibold 
              bg-green-100 text-green-600 rounded-lg 
              hover:bg-green-200 transition"
            >
              Restore
            </button>
          </div>
        ))
      )}

    </main>
  );
}