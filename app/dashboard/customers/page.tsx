"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: number;
  name: string;
  phone: string;
  balance?: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [totalUdhar, setTotalUdhar] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data: customersData } = await supabase
      .from("customers")
      .select("*")
      .eq("is_archived", false)
      .order("id", { ascending: false });

    if (!customersData) {
      setCustomers([]);
      return;
    }

    const updatedCustomers = await Promise.all(
      customersData.map(async (customer) => {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount,type")
          .eq("customer_id", customer.id);

        let balance = 0;

        if (transactions) {
          transactions.forEach((tx) => {
            if (tx.type === "credit") balance += Number(tx.amount);
            else balance -= Number(tx.amount);
          });
        }

        return { ...customer, balance };
      }),
    );

    setCustomers(updatedCustomers);

    let total = 0;

    updatedCustomers.forEach((c) => {
      if ((c.balance ?? 0) > 0) {
        total += c.balance ?? 0;
      }
    });

    setTotalUdhar(total);
  }

  async function addCustomer() {
    if (!name.trim()) {
      alert("Enter customer name");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("customers").insert([
      {
        name: name.trim(),
        phone: phone.trim(),
        user_id: userData.user?.id,
      },
    ]);

    setName("");
    setPhone("");

    fetchCustomers();
  }

  function sendWhatsApp(customer: Customer) {
    if (!customer.phone) {
      alert("Customer phone not added");
      return;
    }

    const amount = customer.balance ?? 0;

    const message = `Hello ${customer.name},

Aapka ₹${amount} udhar baaki hai.

Jab ho sake payment kar dena.

Thank you.`;

    const phoneNumber = customer.phone.startsWith("91")
      ? customer.phone
      : `91${customer.phone}`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  const filteredCustomers = customers.filter((c) => {
    const n = c.name || "";
    const p = c.phone || "";

    return n.toLowerCase().includes(search.toLowerCase()) || p.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* HEADER */}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>

            <p className="font-semibold text-slate-900">Customers</p>
          </div>

          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
        </div>

        {/* TOTAL UDHAR CARD */}

        <div className="bg-green-500 text-white p-6 rounded-3xl">
          <p className="text-sm opacity-80">Total Udhar Baaki</p>

          <p className="text-3xl font-bold mt-1">
            ₹ {Number(totalUdhar).toLocaleString("en-IN")}
          </p>

          <button className="mt-3 bg-white text-green-600 px-4 py-1 rounded-full text-sm font-semibold">
            View Details
          </button>
        </div>

        {/* ADD CUSTOMER */}

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <p className="font-semibold mb-3">Add Customer</p>

          <input
            type="text"
            placeholder="Customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-3 border rounded-xl"
          />

          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 mb-3 border rounded-xl"
          />

          <button
            onClick={addCustomer}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
          >
            Add
          </button>
        </div>

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search customer"
          className="w-full p-4 rounded-2xl bg-white border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CUSTOMER LIST */}

        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm"
            >
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="font-semibold text-slate-900"
              >
                {customer.name}
              </Link>

              <p className="text-red-500 font-semibold">
                ₹ {customer.balance ?? 0}
              </p>

              <button
                onClick={() => sendWhatsApp(customer)}
                className="text-green-600 font-semibold"
              >
                WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
