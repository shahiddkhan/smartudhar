"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [udharDiya, setUdharDiya] = useState(0);
  const [paiseAane, setPaiseAane] = useState(0);

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

    const { data: customers } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_archived", false);

    setTotalCustomers(customers?.length || 0);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    if (transactions) {
      let credit = 0;
      let debit = 0;

      transactions.forEach((tx) => {
        if (tx.type === "credit") credit += Number(tx.amount);
        else debit += Number(tx.amount);
      });

      setUdharDiya(credit);
      setPaiseAane(credit - debit);
    }

    setLoading(false);
  };

  const formatMoney = (amount: number) =>
    Number(amount).toLocaleString("en-IN");

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">SmartUdhar Overview</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Customers */}

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-500">Customers</p>
            <p className="text-xl font-bold text-slate-900">
              {totalCustomers}
            </p>
          </div>

          {/* Udhar Diya */}

          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-500">Udhar Diya</p>
            <p className="text-xl font-bold text-red-500">
              ₹ {formatMoney(udharDiya)}
            </p>
          </div>

          {/* Log jinse paise aane hai */}

          <div className="bg-white p-5 rounded-2xl shadow-sm col-span-2">
            <p className="text-sm text-slate-500">
              Log jinse paise aane hai
            </p>

            <p className="text-xl font-bold text-green-600">
              ₹ {formatMoney(paiseAane)}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/customers")}
          className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold"
        >
          Manage Customers
        </button>
      </div>
    </main>
  );
}