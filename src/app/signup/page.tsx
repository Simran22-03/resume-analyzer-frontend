"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserRound, Building2, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, ShieldCheck, Sparkles
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/auth";

const Input = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    <input {...props} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-[#172554] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
  </div>
);

export default function SignupPage() {
  const [role, setRole] = useState<"employee" | "hr">("employee");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const signup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);
    const password = data.get("password");
    const confirm = data.get("confirm");

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: data.get("name"),
          email: data.get("email"),
          password,
          role,
          company_name: role === "hr" ? data.get("company") : "",
        }),
      });

      const result = await res.json();
      console.log("Signup:", res.status, result);

      if (!res.ok) {
        setMessage(
          result.email?.[0] ||
          result.company_name?.[0] ||
          result.password?.[0] ||
          result.role?.[0] ||
          result.message ||
          "Unable to create account."
        );
        return;
      }

      setMessage("Account created successfully. You can now login.");
      form.reset();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-white lg:grid lg:grid-cols-[43%_57%]">

      {/* LEFT SIDE */}
      <section className="relative hidden h-screen overflow-hidden bg-[#101c4d] px-12 py-8 text-white lg:flex lg:flex-col">

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-600">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1 className="font-bold">AI Resume Analyzer</h1>
            <p className="text-xs text-blue-200">Smart career insights</p>
          </div>
        </div>

        <div className="relative mt-24">
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-blue-300">
            <Sparkles size={14} />
            AI-Powered Career Platform
          </p>

          <h2 className="text-[46px] font-bold leading-[1.08]">
            Build Your Career.
            <span className="block text-blue-300">
              With AI.
            </span>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-6 text-blue-100/70">
            Create your account and unlock smarter resume analysis,
            skill insights, and better career opportunities.
          </p>
        </div>

        <div className="relative mt-auto mb-8">
          <div className="mx-auto max-w-[340px] rounded-2xl border border-white/10 bg-white/[.09] p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-400/10">
                <UserRound size={27} className="text-blue-300" />
              </div>

              <div>
                <p className="text-xs text-blue-200/70">
                  AI-POWERED
                </p>
                <p className="font-semibold">
                  Your Career Profile
                </p>
                <p className="text-xs text-blue-200/60">
                  Ready to grow
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-blue-200/40">
          © 2026 AI Resume Analyzer
        </p>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex h-screen items-center justify-center bg-[#f8fafc] px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-[650px]">

          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <h2 className="text-[34px] font-bold tracking-tight text-[#172554]">
            Create Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose your account type to get started.
          </p>

          {/* ROLE */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["employee", "Employee", "Build your career", UserRound],
              ["hr", "HR", "Find the right talent", Building2],
            ].map(([id, title, sub, Icon]) => (
              <button
                key={id as string}
                type="button"
                onClick={() => setRole(id as "employee" | "hr")}
                className={`flex h-[68px] items-center gap-3 rounded-xl border px-4 text-left transition ${
                  role === id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <Icon size={21} className="text-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-[#172554]">
                    {title as string}
                  </p>
                  <p className="text-xs text-slate-400">
                    {sub as string}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* FORM */}
          <form onSubmit={signup} className="mt-6">

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#172554]">
                  Full Name
                </label>
                <Input
                  icon={UserRound}
                  name="name"
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#172554]">
                  {role === "hr" ? "Work Email" : "Email Address"}
                </label>
                <Input
                  icon={Mail}
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                />
              </div>

            </div>

            {role === "hr" && (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-[#172554]">
                  Company Name
                </label>
                <Input
                  icon={Building2}
                  name="company"
                  required
                  placeholder="Enter company name"
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#172554]">
                  Password
                </label>

                <div className="relative">
                  <Input
                    icon={Lock}
                    name="password"
                    required
                    type={show1 ? "text" : "password"}
                    placeholder="Create password"
                  />

                  <button
                    type="button"
                    onClick={() => setShow1(!show1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {show1 ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#172554]">
                  Confirm Password
                </label>

                <div className="relative">
                  <Input
                    icon={Lock}
                    name="confirm"
                    required
                    type={show2 ? "text" : "password"}
                    placeholder="Confirm password"
                  />

                  <button
                    type="button"
                    onClick={() => setShow2(!show2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {show2 ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

            </div>

            {message && (
              <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : `Create ${role === "hr" ? "HR" : "Employee"} Account`}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}