"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  Target,
  CheckCircle2,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/auth";

export default function Home() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const email = form.get("email");
    const password = form.get("password");

    try {
      const response = await fetch(`${API}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", result);

      if (!response.ok) {
        setMessage(
          result.message || "Invalid email or password."
        );
        return;
      }

      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);
      localStorage.setItem("user", JSON.stringify(result.user));

      const userRole = result.user?.role;

      /*
       * Employee → Employee Dashboard
       * HR       → HR Dashboard
       */

      if (userRole === "employee") {
        router.replace("/employee");
      } else if (userRole === "hr") {
        router.replace("/hr");
      } else {
        setMessage("Invalid user role.");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setMessage("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="font-bold">
              AI Resume Analyzer
            </h1>

            <p className="text-[11px] text-blue-200">
              Smart career insights
            </p>
          </div>

        </div>

        <div className="relative mt-12 max-w-xl">

          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
            <Sparkles size={14} />
            AI-Powered Career Platform
          </div>

          <h2 className="text-4xl font-bold leading-[1.08] xl:text-[48px]">
            Turn Your Resume
            <span className="block text-blue-300">
              Into Opportunity.
            </span>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-6 text-blue-100/70">
            Get intelligent resume analysis, identify skill gaps,
            and discover how to improve your career profile.
          </p>

        </div>

        <div className="relative mt-auto flex justify-center pb-4">

          <div className="w-[330px] rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">

            <div className="mb-4 flex items-center gap-3">

              <div className="rounded-lg bg-blue-400/20 p-2 text-blue-300">
                <FileText size={20} />
              </div>

              <div>
                <p className="text-[10px] text-blue-200">
                  RESUME ANALYSIS
                </p>

                <p className="text-sm font-semibold">
                  Software Engineer
                </p>
              </div>

            </div>

            {[
              ["Python", "92%"],
              ["React", "87%"],
              ["SQL", "81%"],
            ].map(([skill, score]) => (
              <div key={skill} className="mb-3">

                <div className="mb-1 flex justify-between text-[11px]">
                  <span>{skill}</span>
                  <span className="text-blue-300">
                    {score}
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: score }}
                  />

                </div>

              </div>
            ))}

            <div className="flex items-center justify-between rounded-xl bg-white/10 p-2.5">

              <span className="flex items-center gap-2 text-xs">
                <Target
                  size={16}
                  className="text-blue-300"
                />
                AI Match Score
              </span>

              <b className="text-lg text-blue-300">
                92%
              </b>

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

          <div className="mb-6">

            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#2563eb]">

              <span className="rounded-full bg-blue-50 p-1.5">
                <Sparkles size={14} />
              </span>

              Welcome to your career workspace

            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#172554]">
              Welcome Back!
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to continue to your account.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_50px_rgba(37,99,235,0.08)] backdrop-blur sm:p-7">

            <form
              onSubmit={login}
              className="space-y-4"
            >

              {/* EMAIL */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />

                  <input
                    name="email"
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 transition focus:border-[#2563eb] focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-1.5 flex justify-between">

                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#2563eb] hover:underline"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <div className="relative">

                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />

                  <input
                    name="password"
                    required
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-700 transition focus:border-[#2563eb] focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER */}

              <label className="flex items-center gap-2 text-xs text-slate-500">

                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#2563eb]"
                />

                Remember me

              </label>

              {/* MESSAGE */}

              {message && (
                <p className="rounded-lg bg-blue-50 p-3 text-xs text-[#2563eb]">
                  {message}
                </p>
              )}

              {/* LOGIN */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-[#1d4ed8] disabled:opacity-60"
              >

                {loading
                  ? "Signing in..."
                  : "Login"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                )}

              </button>

            </form>

            <div className="my-5 flex items-center gap-3">

              <div className="h-px flex-1 bg-slate-100" />

              <span className="text-[10px] text-slate-400">
                SECURE LOGIN
              </span>

              <div className="h-px flex-1 bg-slate-100" />

            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

              <CheckCircle2
                size={14}
                className="text-emerald-500"
              />

              Your account data is securely protected

            </div>

          </div>

          <p className="mt-5 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              href="/signup"
              className="font-semibold text-[#2563eb] hover:underline"
            >
              Create Account
            </Link>

          </p>

        </div>

      </section>

    </main>
  );
}