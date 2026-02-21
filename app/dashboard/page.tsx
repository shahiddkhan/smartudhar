"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push("/");
      return;
    }

    const user = sessionData.session.user;

    // Customers count
    const { data: customers } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_archived", false);

    setTotalCustomers(customers?.length || 0);

    // Transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount,type")
      .eq("user_id", user.id);

    if (transactions) {
      let credit = 0;
      let debit = 0;

      transactions.forEach((tx) => {
        if (tx.type === "credit") {
          credit += Number(tx.amount);
        } else {
          debit += Number(tx.amount);
        }
      });

      setTotalCredit(credit);
      setTotalDebit(debit);
      setBalance(credit - debit);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            SmartUdhar Overview
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Customers</p>
            <p className="text-xl font-bold text-slate-900">
              {totalCustomers}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Balance</p>
            <p
              className={`text-xl font-bold ${
                balance > 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              ₹ {balance}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Udhar Diya</p>
            <p className="text-xl font-bold text-red-500">
              ₹ {totalCredit}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Paisa Mila</p>
            <p className="text-xl font-bold text-green-600">
              ₹ {totalDebit}
            </p>
          </div>

        </div>

        <button
          onClick={() => router.push("/dashboard/customers")}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition"
        >
          Manage Customers
        </button>

      </div>
    </main>
  );
}