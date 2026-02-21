"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push("/");
      return;
    }

    const user = sessionData.session.user;

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("id", { ascending: false });

    if (data) setCustomers(data);
    setLoading(false);
  };

  const addCustomer = async () => {
    if (!name.trim()) {
      alert("Customer name required");
      return;
    }

    setAdding(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name: name.trim(),
          phone: phone.trim() || null,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    setAdding(false);

    if (error) {
      alert(error.message);
    } else if (data) {
      setCustomers((prev) => [data, ...prev]);
      setName("");
      setPhone("");
    }
  };

  const archiveCustomer = async (id: number) => {
    const confirmArchive = confirm("Archive karna hai?");
    if (!confirmArchive) return;

    const { error } = await supabase
      .from("customers")
      .update({ is_archived: true })
      .eq("id", id);

    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-medium">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>
          <p className="text-sm text-slate-600">
            Manage your udhar customers
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full p-3 rounded-xl border border-slate-300 
            text-slate-900 font-medium
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            placeholder="Enter phone number (optional)"
            maxLength={10}
            className="w-full p-3 rounded-xl border border-slate-300 
            text-slate-900 font-medium
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <button
            onClick={addCustomer}
            disabled={adding}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add Customer"}
          </button>
        </div>

        <div className="space-y-4">
          {customers.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
              No customers yet
            </div>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
              >
                <div
                  onClick={() =>
                    router.push(`/dashboard/customers/${c.id}`)
                  }
                  className="cursor-pointer"
                >
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
                  onClick={() => archiveCustomer(c.id)}
                  className="px-3 py-1.5 text-xs font-semibold 
                  bg-red-100 text-red-600 rounded-lg 
                  hover:bg-red-200 transition"
                >
                  Archive
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}