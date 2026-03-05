"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  phone: string;
  is_archived?: boolean;
}

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("is_archived", false)
      .order("id", { ascending: false });

    if (!error && data) {
      setCustomers(data);
    } else {
      setCustomers([]);
    }
  }

  async function archiveCustomer(id: number) {
    await supabase
      .from("customers")
      .update({ is_archived: true })
      .eq("id", id);

    fetchCustomers();
  }

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name ?? "";
    const phone = customer.phone ?? "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Customers
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search customer..."
          className="w-full p-4 mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm 
          text-slate-900 placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-slate-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-slate-500 shadow-sm">
              No customers found
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center"
              >
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex-1"
                >
                  <p className="font-semibold text-slate-900 text-base">
                    {customer.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {customer.phone}
                  </p>
                </Link>

                <button
                  onClick={() => archiveCustomer(customer.id)}
                  className="ml-3 text-xs font-semibold text-red-500"
                >
                  Archive
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Add Customer Button */}
      <button
        onClick={() => router.push("/dashboard/customers/add")}
        className="fixed bottom-20 right-6 bg-slate-900 text-white w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center active:scale-95 transition"
      >
        +
      </button>
    </div>
  );
}