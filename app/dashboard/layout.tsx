// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";

// type Customer = {
//   id: number;
//   name: string;
//   phone: string | null;
//   transactions: {
//     amount: number;
//     type: "credit" | "debit";
//   }[];
// };

// export default function DashboardPage() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");

//   useEffect(() => {
//     loadCustomers();
//   }, []);

//   const loadCustomers = async () => {
//     const { data: userData } = await supabase.auth.getUser();
//     const user = userData.user;
//     if (!user) return;

//     const { data } = await supabase
//       .from("customers")
//       .select(
//         `
//         id,
//         name,
//         phone,
//         transactions (
//           amount,
//           type
//         )
//       `,
//       )
//       .eq("user_id", user.id)
//       .eq("is_archived", false);

//     if (data) {
//       setCustomers(data as Customer[]);
//     }
//   };

//   const addCustomer = async () => {
//     if (!name) return;

//     const { data: userData } = await supabase.auth.getUser();
//     const user = userData.user;
//     if (!user) return;

//     await supabase.from("customers").insert({
//       name,
//       phone,
//       user_id: user.id,
//     });

//     setName("");
//     setPhone("");

//     loadCustomers();
//   };

//   const calculateBalance = (transactions: Customer["transactions"]) => {
//     let balance = 0;

//     for (const t of transactions) {
//       if (t.type === "credit") balance += t.amount;
//       else balance -= t.amount;
//     }

//     return balance;
//   };

//   const totalUdhar = customers.reduce((sum, c) => {
//     const bal = calculateBalance(c.transactions);
//     if (bal > 0) return sum + bal;
//     return sum;
//   }, 0);

//   return (
//     <div className="p-4 space-y-6">
//       {/* BALANCE CARD */}

//       <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-lg">
//         <p className="text-sm text-slate-300">Total Udhar Baaki</p>

//         <h2 className="text-4xl font-bold mt-2">₹ {totalUdhar}</h2>

//         <p className="text-xs text-slate-400 mt-1">Log jinse paise lene hai</p>
//       </div>

//       {/* ADD CUSTOMER */}

//       <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow">
//         <h3 className="font-semibold text-lg">Add Customer</h3>

//         <input
//           placeholder="Customer name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full rounded-lg px-3 py-2 text-black"
//         />

//         <input
//           placeholder="Phone (optional)"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//           className="w-full rounded-lg px-3 py-2 text-black"
//         />

//         <button
//           onClick={addCustomer}
//           className="w-full bg-green-500 py-2 rounded-lg font-semibold"
//         >
//           Add Customer
//         </button>
//       </div>

//       {/* CUSTOMER LIST */}

//       <div className="space-y-3">
//         {customers.map((c) => {
//           const balance = calculateBalance(c.transactions);

//           return (
//             <div
//               key={c.id}
//               className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center shadow"
//             >
//               <div>
//                 <p className="font-semibold text-lg">{c.name}</p>

//                 {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
//               </div>

//               <div className="text-right">
//                 <p
//                   className={`font-bold text-lg ${
//                     balance > 0 ? "text-red-400" : "text-green-400"
//                   }`}
//                 >
//                   ₹ {Math.abs(balance)}
//                 </p>

//                 <p className="text-xs text-slate-400">
//                   {balance > 0 ? "Udhar" : "Clear"}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
