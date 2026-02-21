"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const sendOTP = async () => {
    if (phone.length !== 10) {
      alert("Enter valid 10 digit number");
      return;
    }

    setLoading(true);

    const fullPhone = `+91${phone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setStep("otp");
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      alert("Enter 6 digit OTP");
      return;
    }

    setLoading(true);

    const fullPhone = `+91${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-slate-900 text-center mb-4">
          SmartUdhar
        </h1>

        {step === "phone" && (
          <>
            <p className="text-center text-slate-600 mb-6 font-medium">
              Enter your mobile number
            </p>

            <div className="mb-4">
              <label className="block text-sm text-slate-600 mb-2">
                Mobile Number
              </label>

              <div className="flex items-center bg-slate-100 rounded-xl px-4">
                <span className="text-slate-500 text-sm mr-2">
                  +91
                </span>

                <input
                  type="tel"
                  placeholder="Enter 10 digit number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  className="w-full bg-transparent py-3 outline-none text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-center text-slate-700 mb-6 font-medium">
              Enter OTP sent to +91{phone}
            </p>

            <input
              type="text"
              placeholder="Enter 6 digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              className="w-full bg-slate-200 rounded-xl px-4 py-3 mb-4 outline-none text-slate-900 font-medium"
            />

            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
