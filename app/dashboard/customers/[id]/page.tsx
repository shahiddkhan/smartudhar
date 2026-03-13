"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: number;
  amount: number;
  type: "credit" | "debit";
  description: string | null;
  created_at: string;
  edited?: boolean;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadCustomer();
    loadTransactions();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();

    const filteredData = transactions.filter((t) => {
      return (
        t.amount.toString().includes(s) ||
        (t.description || "").toLowerCase().includes(s) ||
        t.type.toLowerCase().includes(s)
      );
    });

    setFiltered(filteredData);
  }, [search, transactions]);

  const loadCustomer = async () => {
    const { data } = await supabase
      .from("customers")
      .select("name")
      .eq("id", customerId)
      .single();

    if (data) setName(data.name);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (data) {
      setTransactions(data);
      setFiltered(data);
      calculateBalance(data);
    }
  };

  const calculateBalance = (data: Transaction[]) => {
    let total = 0;

    data.forEach((t) => {
      if (t.type === "credit") total += t.amount;
      else total -= t.amount;
    });

    setBalance(total);
  };

  const addTransaction = async (type: "credit" | "debit") => {
    if (!amount) return;

    const confirmAction = confirm(
      `${type === "credit" ? "Udhar Liya" : "Udhar Diya"} ₹${amount} ?`,
    );

    if (!confirmAction) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    await supabase.from("transactions").insert({
      amount: Number(amount),
      type,
      description: note,
      customer_id: customerId,
      user_id: user.id,
    });

    setAmount("");
    setNote("");

    loadTransactions();
  };

  const editTransaction = async (t: Transaction) => {
    const newAmount = prompt("Edit amount", t.amount.toString());
    if (!newAmount) return;

    const newNote = prompt("Edit note", t.description || "");

    await supabase
      .from("transactions")
      .update({
        amount: Number(newAmount),
        description: newNote,
        edited: true,
      })
      .eq("id", t.id);

    loadTransactions();
  };

  const archiveCustomer = async () => {
    const confirmArchive = confirm("Archive this customer?");
    if (!confirmArchive) return;

    await supabase
      .from("customers")
      .update({ is_archived: true })
      .eq("id", customerId);

    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* HEADER */}

      <div className="flex justify-between items-center text-slate-700">
        <button onClick={() => router.back()} className="font-medium">
          ← Back
        </button>

        <div className="text-right">
          <p className="text-xs text-slate-500">BALANCE</p>
          <p
            className={`font-bold ${
              balance > 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            ₹ {Math.abs(balance)}
          </p>
        </div>
      </div>

      {/* TRANSACTION CARD */}

      <div className="bg-white rounded-2xl p-6 shadow space-y-4">
        <p className="text-sm text-slate-500">Customer</p>
        <h2 className="text-xl font-bold text-slate-900">{name}</h2>

        <input
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none"
        />

        <input
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none"
        />

        <div className="flex gap-3">
          <button
            onClick={() => addTransaction("credit")}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            + Udhar Liya
          </button>

          <button
            onClick={() => addTransaction("debit")}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold"
          >
            - Udhar Diya
          </button>
        </div>

        <button
          onClick={archiveCustomer}
          className="w-full bg-slate-900 text-white py-3 rounded-lg"
        >
          Archive Customer
        </button>
      </div>

      {/* SEARCH */}

      <input
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none"
      />

      {/* TRANSACTIONS */}

      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => editTransaction(t)}
            className="bg-white rounded-xl p-4 shadow flex justify-between items-center cursor-pointer"
          >
            <div>
              <p className="text-xs text-slate-500">
                {new Date(t.created_at).toLocaleString()}
              </p>

              <p className="font-medium text-slate-800">
                {t.type === "credit" ? "Udhar Liya" : "Udhar Diya"}
                {t.edited && (
                  <span className="text-xs text-gray-400 ml-2">(edited)</span>
                )}
              </p>

              {t.description && (
                <p className="text-xs text-slate-500">{t.description}</p>
              )}
            </div>

            <p
              className={`font-bold ${
                t.type === "credit" ? "text-red-500" : "text-green-500"
              }`}
            >
              {t.type === "credit" ? "+" : "-"} ₹ {t.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
