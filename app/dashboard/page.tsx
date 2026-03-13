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

export default function DashboardPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredCustomers(filtered);
  }, [search, customers]);

  const loadCustomers = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data } = await supabase
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
      .eq("is_archived", false);

    if (data) {
      setCustomers(data as Customer[]);
      setFilteredCustomers(data as Customer[]);
    }
  };

  const addCustomer = async () => {
    if (!name) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    await supabase.from("customers").insert({
      name,
      phone,
      user_id: user.id,
    });

    setName("");
    setPhone("");

    loadCustomers();
  };

  const calculateBalance = (transactions: Transaction[]) => {
    return transactions.reduce((balance, t) => {
      if (t.type === "credit") return balance + Number(t.amount);
      else return balance - Number(t.amount);
    }, 0);
  };

  const totalUdhar = customers.reduce((sum, customer) => {
    const balance = calculateBalance(customer.transactions);
    if (balance > 0) return sum + balance;
    return sum;
  }, 0);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* TOTAL BALANCE */}

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-lg">
        <p className="text-sm text-slate-300">Total Udhar Baaki</p>

        <h2 className="text-4xl font-bold mt-2">₹ {totalUdhar}</h2>

        <p className="text-xs text-slate-400 mt-1">Log jinse paise lene hai</p>
      </div>

      {/* ADD CUSTOMER */}

      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-lg">
        <h3 className="font-semibold text-lg">Add Customer</h3>

        <input
          type="text"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl px-4 py-3 bg-slate-100 text-slate-900 placeholder:text-slate-500 outline-none"
        />

        <input
          type="text"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl px-4 py-3 bg-slate-100 text-slate-900 placeholder:text-slate-500 outline-none"
        />

        <button
          onClick={addCustomer}
          className="w-full bg-green-500 hover:bg-green-600 transition py-3 rounded-xl font-semibold"
        >
          Add Customer
        </button>
      </div>

      {/* SEARCH BAR */}

      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none shadow"
      />

      {/* CUSTOMER LIST */}

      <div className="space-y-3">
        {filteredCustomers.map((customer) => {
          const balance = calculateBalance(customer.transactions);

          return (
            <div
              key={customer.id}
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center shadow-md cursor-pointer hover:bg-slate-800 transition"
            >
              <div>
                <p className="font-semibold text-lg">{customer.name}</p>

                {customer.phone && (
                  <p className="text-xs text-slate-400">{customer.phone}</p>
                )}
              </div>

              <div className="text-right">
                <p
                  className={`font-bold text-lg ${
                    balance > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  ₹ {Math.abs(balance)}
                </p>

                <p className="text-xs text-slate-400">
                  {balance > 0 ? "Udhar" : "Clear"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
