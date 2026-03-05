"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: "credit" | "debit";
  description: string;
  created_at: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchTransactions();
    }
  }, [customerId]);

  const formatMoney = (value: number) =>
    Number(value).toLocaleString("en-IN");

  const fetchCustomer = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id,name")
      .eq("id", customerId)
      .single();

    if (data) setCustomer(data);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (data) {
      setTransactions(data);

      const total = data.reduce((acc, tx) => {
        return tx.type === "credit"
          ? acc + Number(tx.amount)
          : acc - Number(tx.amount);
      }, 0);

      setBalance(total);
    }
  };

  const addTransaction = async (type: "credit" | "debit") => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (numericAmount > 1000000) {
      alert("Maximum allowed is ₹10,00,000");
      return;
    }

    if (type === "debit" && numericAmount > balance) {
      alert("Cannot clear more than current udhar");
      return;
    }

    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;

    await supabase.from("transactions").insert([
      {
        amount: numericAmount,
        type,
        description,
        customer_id: customerId,
        user_id: user?.id,
      },
    ]);

    setAmount("");
    setDescription("");
    fetchTransactions();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-slate-100 pb-24">

      {/* HEADER */}
      <div className="sticky top-0 bg-white border-b shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">

          <button
            onClick={() => router.push("/dashboard/customers")}
            className="text-slate-900 text-sm font-semibold"
          >
            ← Back
          </button>

          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">Balance</p>

            <p
              className={`text-xl font-bold ${
                balance > 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              ₹ {formatMoney(balance)}
            </p>

          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* ADD ENTRY */}
        <div className="bg-white p-6 rounded-3xl shadow-md">

          <p className="text-sm text-slate-500">Customer</p>

          <h2 className="text-xl font-bold text-slate-900 mb-5">
            {customer?.name}
          </h2>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter amount"
            className="w-full p-4 mb-4 rounded-2xl bg-slate-50 border border-slate-200
            text-lg font-semibold text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add note (optional)"
            className="w-full p-4 mb-5 rounded-2xl bg-slate-50 border border-slate-200
            text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => addTransaction("credit")}
              className="bg-red-500 text-white py-4 rounded-2xl font-semibold active:scale-95 transition"
            >
              + Udhar Liya
            </button>

            <button
              onClick={() => addTransaction("debit")}
              className="bg-green-600 text-white py-4 rounded-2xl font-semibold active:scale-95 transition"
            >
              − Udhar Clear
            </button>

          </div>
        </div>

        {/* LEDGER */}
        <div className="space-y-3">

          {transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-slate-500">
              No transactions yet
            </div>
          ) : (
            transactions.map((tx, index) => {

              const runningBalance = transactions
                .slice(index)
                .reduce(
                  (acc, t) =>
                    t.type === "credit"
                      ? acc + Number(t.amount)
                      : acc - Number(t.amount),
                  0
                );

              return (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-2xl shadow-sm flex justify-between"
                >

                  <div>
                    <p className="text-xs text-slate-500">
                      {formatDate(tx.created_at)}
                    </p>

                    <p className="font-semibold text-slate-900">
                      {tx.type === "credit"
                        ? "Udhar Liya"
                        : "Udhar Clear"}
                    </p>

                    {tx.description && (
                      <p className="text-sm text-slate-500">
                        {tx.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right">

                    <p
                      className={`text-lg font-bold ${
                        tx.type === "credit"
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"} ₹{" "}
                      {formatMoney(tx.amount)}
                    </p>

                    <p className="text-xs text-slate-500">
                      ₹ {formatMoney(runningBalance)}
                    </p>

                  </div>

                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}