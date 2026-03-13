"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Transaction = {
  amount: number;
  type: "credit" | "debit";
};

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  transactions: Transaction[];
};

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const f = customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(f);
  }, [search, customers]);

  const loadCustomers = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        id,
        name,
        phone,
        transactions (
          amount,
          type
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("id", { ascending: false });

    if (!error && data) {
      setCustomers(data as Customer[]);
      setFiltered(data as Customer[]);
    }

    setLoading(false);
  };

  const calculateBalance = (transactions: Transaction[]) => {
    let total = 0;

    transactions.forEach((t) => {
      if (t.type === "credit") {
        total += t.amount;
      } else {
        total -= t.amount;
      }
    });

    return total;
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-slate-500">
        Loading customers...
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 text-center">
        Customers
      </h2>

      {/* SEARCH */}

      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
      />

      {/* CUSTOMER LIST */}

      <div className="space-y-3">
        {filtered.map((c) => {
          const balance = calculateBalance(c.transactions);

          return (
            <div
              key={c.id}
              onClick={() => router.push(`/dashboard/customers/${c.id}`)}
              className="bg-white p-4 rounded-xl shadow border flex justify-between items-center cursor-pointer"
            >
              <div>
                <p className="font-semibold text-slate-900">{c.name}</p>

                {c.phone && <p className="text-xs text-slate-500">{c.phone}</p>}
              </div>

              <div className="text-right">
                <p
                  className={`font-bold ${
                    balance > 0
                      ? "text-red-500"
                      : balance < 0
                        ? "text-green-600"
                        : "text-slate-500"
                  }`}
                >
                  ₹ {Math.abs(balance)}
                </p>

                <p className="text-xs text-slate-400">
                  {balance > 0
                    ? "Udhar Liya"
                    : balance < 0
                      ? "Udhar Diya"
                      : "Clear"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
