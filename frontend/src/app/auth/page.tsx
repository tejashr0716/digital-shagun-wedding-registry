"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Smartphone, KeyRound, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("+919876543210");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.requestOTP(phoneNumber);
      setStep("OTP");
      setInfo(`6-digit code dispatched to ${phoneNumber}. (Test Code: 123456)`);
      setOtpCode("123456");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyOTP(phoneNumber, otpCode);
      setAuthToken(res.access_token);
      if (res.wedding_slug) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.verifyOTP("+919876543210", "123456");
      setAuthToken(res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-rose-50/50 via-white to-amber-50/30 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-rose-100 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Window 1: Authentication & Onboarding
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {step === "PHONE" ? "Couple Sign In / Register" : "Verify Your Phone"}
          </h1>
          <p className="text-xs text-gray-500">
            {step === "PHONE"
              ? "Access your wedding registry dashboard and manage guest milestone contributions."
              : `Enter the verification code sent to ${phoneNumber}`}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        {info && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {info}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Get Verification Code"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-mono tracking-widest rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Open Dashboard"}
            </button>

            <button
              type="button"
              onClick={() => setStep("PHONE")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        {/* 1-Click Instant Demo Access */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2"
          >
            ⚡ Instant 1-Click Demo Login (Priya &amp; Rohit)
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          End-to-end encrypted session • No spam guarantee
        </div>
      </div>
    </div>
  );
}
