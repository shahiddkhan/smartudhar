"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: number;
  name: string;
  phone: string;
  is_archived?: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("is_archived", false)
      .order("id", { ascending: false });

    if (!error && data) {
      setCustomers(data);
    } else {
      setCustomers([]);
    }
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

  async function archiveCustomer(id: number) {
    const confirmArchive = confirm("Archive this customer?");

    if (!confirmArchive) return;

    await supabase
      .from("customers")
      .update({ is_archived: true })
      .eq("id", id);

    fetchCustomers();
  }

  const filteredCustomers = customers.filter((customer) => {
    const n = customer.name ?? "";
    const p = customer.phone ?? "";

    return (
      n.toLowerCase().includes(search.toLowerCase()) ||
      p.includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">

        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Customers
        </h1>

        {/* ADD CUSTOMER */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <p className="font-semibold mb-3 text-slate-900">
            New Customer
          </p>

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

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search customer..."
          className="w-full p-4 mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CUSTOMER LIST */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-slate-500 shadow-sm">
              No customers found
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm"
              >
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex-1"
                >
                  <p className="font-semibold text-slate-900">
                    {customer.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {customer.phone}
                  </p>
                </Link>

                {/* ARCHIVE ICON */}
                <button
                  onClick={() => archiveCustomer(customer.id)}
                  className="ml-3 text-red-500 hover:scale-110 transition"
                >
                  📥
                </button>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}