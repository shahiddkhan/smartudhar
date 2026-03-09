"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ModernCard from "@/app/components/ModernCard";

interface Customer {
  id: number;
  name: string;
  phone: string;
  is_archived?: boolean;
  balance?: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [totalUdhar, setTotalUdhar] = useState(0);

  const [phoneInputCustomer, setPhoneInputCustomer] = useState<Customer | null>(
    null,
  );
  const [newPhone, setNewPhone] = useState("");

  const [flashCustomerId, setFlashCustomerId] = useState<number | null>(null);

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
    const customerName = name.trim().toLowerCase();

    if (!customerName) {
      alert("Enter customer name");
      return;
    }

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .ilike("name", customerName);

    if (existing && existing.length > 0) {
      alert("Customer with this name already exists");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const { error } = await supabase.from("customers").insert([
      {
        name: name.trim(),
        phone: phone.trim(),
        user_id: user?.id,
      },
    ]);

    if (error) {
      alert("Could not add customer");
      return;
    }

    setName("");
    setPhone("");

    fetchCustomers();
  }

  async function archiveCustomer(id: number, customerName: string) {
    const confirmArchive = confirm(`Archive ${customerName}?`);
    if (!confirmArchive) return;

    await supabase.from("customers").update({ is_archived: true }).eq("id", id);

    fetchCustomers();
  }

  function sendWhatsApp(customer: Customer) {
    if (!customer.phone) {
      setPhoneInputCustomer(customer);
      return;
    }

    const amount = customer.balance ?? 0;

    const message = `Hello ${customer.name} bhai,

Aapka ₹${amount} udhar baaki hai.

Jab ho sake payment kar dena.

Thank you.`;

    const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  }

  async function savePhoneAndSend() {
    if (!phoneInputCustomer) return;

    await supabase
      .from("customers")
      .update({ phone: newPhone })
      .eq("id", phoneInputCustomer.id);

    const updatedCustomer = {
      ...phoneInputCustomer,
      phone: newPhone,
    };

    setPhoneInputCustomer(null);
    setNewPhone("");

    sendWhatsApp(updatedCustomer);
  }

  function cancelPhoneEntry() {
    if (phoneInputCustomer) {
      setFlashCustomerId(phoneInputCustomer.id);

      setTimeout(() => {
        setFlashCustomerId(null);
      }, 900);
    }

    setPhoneInputCustomer(null);
  }

  function remindAllDebtors() {
    const debtors = customers.filter((c) => (c.balance ?? 0) > 0 && c.phone);

    if (debtors.length === 0) {
      alert("No customers with pending udhar");
      return;
    }

    debtors.forEach((customer) => {
      const message = `Hello ${customer.name} bhai,

Aapka ₹${customer.balance} udhar baaki hai.

Jab ho sake payment kar dena.

Thank you.`;

      const url = `https://wa.me/${customer.phone}?text=${encodeURIComponent(
        message,
      )}`;

      window.open(url, "_blank");
    });
  }

  const filteredCustomers = customers.filter((customer) => {
    const n = customer.name ?? "";
    const p = customer.phone ?? "";

    return n.toLowerCase().includes(search.toLowerCase()) || p.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Customers</h1>

        <button
          onClick={remindAllDebtors}
          className="w-full mb-6 bg-green-600 text-white py-3 rounded-xl font-semibold"
        >
          Remind All Debtors
        </button>

        <ModernCard title="Total Udhar Baaki" value={`₹ ${totalUdhar}`} />

        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <p className="font-semibold mb-3 text-slate-900">New Customer</p>

          <input
            type="text"
            placeholder="Customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-3 border rounded-xl text-slate-900"
          />

          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 mb-3 border rounded-xl text-slate-900"
          />

          <button
            onClick={addCustomer}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold"
          >
            Add Customer
          </button>
        </div>

        <input
          type="text"
          placeholder="Search customer..."
          className="w-full p-4 mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`grid grid-cols-4 items-center p-4 rounded-2xl shadow-sm transition ${
                flashCustomerId === customer.id ? "bg-red-200" : "bg-white"
              }`}
            >
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="font-semibold text-slate-900"
              >
                {customer.name}
              </Link>

              <p
                className={`font-semibold ${
                  (customer.balance ?? 0) > 0
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                ₹ {customer.balance ?? 0}
              </p>

              <button
                onClick={() => sendWhatsApp(customer)}
                className="text-green-600 font-semibold"
              >
                WhatsApp
              </button>

              <button
                onClick={() => archiveCustomer(customer.id, customer.name)}
                className="text-red-500 text-xl"
              >
                📥
              </button>
            </div>
          ))}
        </div>
      </div>

      {phoneInputCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[350px] rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Enter WhatsApp number
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              {phoneInputCustomer.name}
            </p>

            <input
              type="text"
              placeholder="Enter phone number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl mb-5 text-slate-900 focus:ring-2 focus:ring-green-500 outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={cancelPhoneEntry}
                className="flex-1 bg-slate-100 text-slate-900 rounded-xl py-3 font-semibold hover:bg-red-500 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                onClick={savePhoneAndSend}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition"
              >
                Save & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
