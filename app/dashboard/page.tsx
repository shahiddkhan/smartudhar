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
      const sorted = (data as Customer[]).reverse();

      setCustomers(sorted);
      setFilteredCustomers(sorted);
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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">Total Udhar Baaki</p>

        <h2 className="text-3xl font-bold mt-1">₹ {totalUdhar}</h2>

        <p className="text-xs text-gray-400">Log jinse paise lene hai</p>
      </div>

      {/* ADD CUSTOMER */}

      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg">Add Customer</h3>

        <input
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl px-4 py-3 bg-gray-100 outline-none"
        />

        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl px-4 py-3 bg-gray-100 outline-none"
        />

        <button
          onClick={addCustomer}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600"
        >
          Add Customer
        </button>
      </div>

      {/* SEARCH */}

      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm outline-none"
      />

      {/* CUSTOMER LIST */}

      <div className="space-y-3">
        {filteredCustomers.map((customer) => {
          const balance = calculateBalance(customer.transactions);

          return (
            <div
              key={customer.id}
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm border border-gray-200 cursor-pointer"
            >
              <div>
                <p className="font-semibold">{customer.name}</p>

                {customer.phone && (
                  <p className="text-xs text-gray-500">{customer.phone}</p>
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

                <p className="text-xs text-gray-400">
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
