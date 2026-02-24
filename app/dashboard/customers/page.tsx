"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: number;
  name: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone.includes(search)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="w-full p-2 mb-4 border rounded-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-3">
        {filteredCustomers.map((customer) => (
          <Link
            key={customer.id}
            href={`/dashboard/customers/${customer.id}`}
            className="block p-3 bg-white shadow rounded-lg"
          >
            <p className="font-semibold">{customer.name}</p>
            <p className="text-gray-500">{customer.phone}</p>
          </Link>
        ))}

        {filteredCustomers.length === 0 && (
          <p className="text-gray-500 text-center">No customers found</p>
        )}
      </div>
    </div>
  );
}