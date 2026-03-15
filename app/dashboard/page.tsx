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

  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "credit" | "debit">("select");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

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

  const saveEntry = async (type: "credit" | "debit") => {
    if (!name || !amount) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data } = await supabase
      .from("customers")
      .insert({
        name,
        phone,
        user_id: user.id,
      })
      .select()
      .single();

    const customerId = data.id;

    await supabase.from("transactions").insert({
      customer_id: customerId,
      amount: Number(amount),
      type,
      user_id: user.id,
    });

    setSheetOpen(false);
    setMode("select");
    setName("");
    setPhone("");
    setAmount("");

    router.push(`/dashboard/customers/${customerId}`);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setMode("select");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 relative">
      {/* TOTAL BALANCE */}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">Total Udhar Baaki</p>
        <h2 className="text-3xl font-bold mt-1">₹ {totalUdhar}</h2>
        <p className="text-xs text-gray-400">Log jinse paise lene hai</p>
      </div>

      {/* ADD ENTRY */}

      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg">Add Entry</h3>

        <button
          onClick={() => setSheetOpen(true)}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
        >
          Add Entry
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

          let label = "Clear";
          let color = "text-gray-500";

          if (balance > 0) {
            label = "Udhar Liya";
            color = "text-red-500";
          } else if (balance < 0) {
            label = "Udhar Diya";
            color = "text-green-600";
          }

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
                <p className={`font-bold ${color}`}>₹ {Math.abs(balance)}</p>

                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING BUTTON */}

      <button
        onClick={() => router.push("/dashboard/customers")}
        className="fixed bottom-20 right-5 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg"
      >
        + Add Customer
      </button>

      {/* BOTTOM SHEET */}

      {sheetOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4"
            style={{
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {mode === "select" && (
              <>
                <button
                  onClick={() => setMode("credit")}
                  className="w-full bg-green-600 text-white py-3 rounded-xl"
                >
                  Udhar Liya
                </button>

                <button
                  onClick={() => setMode("debit")}
                  className="w-full bg-red-600 text-white py-3 rounded-xl"
                >
                  Udhar Diya
                </button>

                <button
                  onClick={closeSheet}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl"
                >
                  Back
                </button>
              </>
            )}

            {(mode === "credit" || mode === "debit") && (
              <>
                <input
                  placeholder="Customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-100 px-4 py-3 rounded-xl"
                />

                <input
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-100 px-4 py-3 rounded-xl"
                />

                <input
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-100 px-4 py-3 rounded-xl"
                />

                <button
                  onClick={() => saveEntry(mode)}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl"
                >
                  Save
                </button>

                <button
                  onClick={closeSheet}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}
