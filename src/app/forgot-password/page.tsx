"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="h-screen overflow-hidden lg:grid lg:grid-cols-[46%_54%]">

      {/* LEFT */}
      <section className="relative hidden h-screen overflow-hidden bg-[#101c4d] px-10 py-7 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563eb]">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h1 className="font-bold">AI Resume Analyzer</h1>
            <p className="text-[11px] text-blue-200">
              Smart career insights
            </p>
          </div>
        </div>

        <div className="relative mt-16 max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
            <Sparkles size={14} />
            Account Security
          </div>

          <h2 className="text-4xl font-bold leading-tight xl:text-[48px]">
            Keep Your Account
            <span className="block text-blue-300">Safe & Secure.</span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-6 text-blue-100/70">
            Don't worry. We'll help you securely regain access to your
            AI Resume Analyzer account.
          </p>
        </div>

        <div className="relative mt-auto flex justify-center pb-6">
          <div className="flex h-44 w-44 items-center justify-center rounded-full border border-blue-300/20 bg-white/5">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-400/10">
              <ShieldCheck size={58} className="text-blue-300" />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-blue-200/50">
          © 2026 AI Resume Analyzer
        </p>
      </section>

      {/* RIGHT */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-white to-blue-50 px-7 py-8 sm:px-12 lg:px-16">
        <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative w-full max-w-md">

          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#2563eb]"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          {!sent ? (
            <>
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
                  <Mail size={23} />
                </div>

                <h2 className="text-3xl font-bold text-[#172554]">
                  Forgot Password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your registered email address and we'll send you
                  instructions to reset your password.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        required
                        type="email"
                        placeholder="Enter your email"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-[#1d4ed8]"
                  >
                    Send Reset Link
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <CheckCircle2 size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#172554]">
                Check Your Email
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                If an account exists with that email address, you'll receive
                a password reset link shortly.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#2563eb] hover:underline"
              >
                <ArrowLeft size={16} />
                Return to Login
              </Link>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            Your account information is securely protected
          </div>
        </div>
      </section>
    </main>
  );
}