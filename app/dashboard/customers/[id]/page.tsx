"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

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
    if (!amount || Number(amount) <= 0) return;

    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;

    await supabase.from("transactions").insert([
      {
        amount: Number(amount),
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

  const exportPDF = () => {
    if (!customer) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("SmartUdhar Ledger", 14, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${customer.name}`, 14, 30);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      14,
      38
    );

    let y = 50;

    doc.setFontSize(11);
    doc.text("Date", 14, y);
    doc.text("Type", 50, y);
    doc.text("Amount", 90, y);
    doc.text("Balance", 130, y);

    y += 8;

    let running = 0;

    transactions
      .slice()
      .reverse()
      .forEach((tx) => {
        running =
          tx.type === "credit"
            ? running + Number(tx.amount)
            : running - Number(tx.amount);

        doc.text(
          new Date(tx.created_at).toLocaleDateString("en-IN"),
          14,
          y
        );

        doc.text(
          tx.type === "credit" ? "Udhar" : "Mila",
          50,
          y
        );

        doc.text(`₹ ${tx.amount}`, 90, y);
        doc.text(`₹ ${running}`, 130, y);

        y += 8;
      });

    doc.setFontSize(14);
    doc.text(`Final Balance: ₹ ${balance}`, 14, y + 10);

    doc.save(`${customer.name}-ledger.pdf`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard/customers")}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition"
          >
            ← Back
          </button>

          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">
              Total Balance
            </p>
            <p
              className={`text-lg font-bold ${
                balance > 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              ₹ {balance}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Add Entry */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-lg font-semibold text-slate-900 mb-4">
            {customer?.name}
          </p>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter amount"
            className="w-full p-3 mb-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Note (optional)"
            className="w-full p-3 mb-4 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addTransaction("credit")}
              className="bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              Udhar Diya
            </button>

            <button
              onClick={() => addTransaction("debit")}
              className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Paisa Mila
            </button>
          </div>
        </div>

        {/* Export */}
        <button
          onClick={exportPDF}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Export PDF
        </button>

        {/* Ledger */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
              No transactions yet
            </div>
          ) : (
            transactions.map((tx, index) => {
              const runningBalance = transactions
                .slice(index)
                .reduce((acc, t) => {
                  return t.type === "credit"
                    ? acc + Number(t.amount)
                    : acc - Number(t.amount);
                }, 0);

              return (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {formatDate(tx.created_at)}
                      </p>
                      <p className="font-semibold text-slate-900">
                        {tx.type === "credit"
                          ? "Udhar Diya"
                          : "Paisa Mila"}
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
                        {tx.amount}
                      </p>
                      <p className="text-xs text-slate-500">
                        Balance: ₹ {runningBalance}
                      </p>
                    </div>
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