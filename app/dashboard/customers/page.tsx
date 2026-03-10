"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  transactions: {
    id: number;
    amount: number;
    type: "credit" | "debit";
  }[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

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
          id,
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
    }

    setLoading(false);
  };

  const calculateBalance = (transactions: Customer["transactions"]) => {
    let balance = 0;

    for (const t of transactions) {
      if (t.type === "credit") {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
    }

    return balance;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading customers...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {customers.map((customer) => {
        const balance = calculateBalance(customer.transactions);

        return (
          <div
            key={customer.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">{customer.name}</p>

              {customer.phone && (
                <p className="text-sm text-slate-500">{customer.phone}</p>
              )}
            </div>

            <div className="text-right">
              <p
                className={`font-bold ${
                  balance > 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                ₹ {Math.abs(balance)}
              </p>

              <p className="text-sm text-slate-400">
                {balance > 0 ? "Due" : "Clear"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
