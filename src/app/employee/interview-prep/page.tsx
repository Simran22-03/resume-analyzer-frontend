"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Users,
  BriefcaseBusiness,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCircle,
  Check,
  ArrowRight,
  Play,
  Code2,
  MessageSquare,
  Layers3,
  LogOut,
} from "lucide-react";

type InterviewType = "technical" | "hr" | "mixed" | "";

export default function InterviewPrepPage() {
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [role, setRole] = useState("");

  const [experience, setExperience] =
    useState("");

  const [interviewType, setInterviewType] =
    useState<InterviewType>("");

  const [started, setStarted] =
    useState(false);

  const navigationItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/employee",
    },
    {
      label: "Resume Analyzer",
      icon: FileText,
      path: "/employee/resume-analyzer",
    },
    {
      label: "Resume Builder",
      icon: Bot,
      path: "/employee/resume-builder",
    },
    {
      label: "Compare Resume",
      icon: Users,
      path: "/employee/compare",
    },
    {
      label: "Interview Prep",
      icon: BriefcaseBusiness,
      path: "/employee/interview-prep",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/employee/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  const handleStart = () => {
    if (!role || !experience || !interviewType) {
      return;
    }

    setStarted(true);
  };

  const handleReset = () => {
    setStarted(false);
    setRole("");
    setExperience("");
    setInterviewType("");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#e3eaf3] bg-white transition-all duration-300 ${
            sidebarCollapsed
              ? "w-[72px]"
              : "w-[236px]"
          }`}
        >

          {/* LOGO */}

          <div
            className={`flex h-[82px] items-center border-b border-[#e8edf4] ${
              sidebarCollapsed
                ? "justify-center"
                : "px-4"
            }`}
          >

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2463eb] text-white">
                <Sparkles size={21} />
              </div>

              {!sidebarCollapsed && (
                <div>

                  <h1 className="text-[15px] font-bold leading-tight">
                    AI Resume
                  </h1>

                  <p className="text-[11px] font-semibold text-[#2463eb]">
                    Analyzer
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 px-3 py-4">

            <div className="space-y-1">

              {navigationItems.map((item) => {

                const Icon = item.icon;

                const active =
                  item.path ===
                  "/employee/interview-prep";

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      router.push(item.path)
                    }
                    title={
                      sidebarCollapsed
                        ? item.label
                        : undefined
                    }
                    className={`flex w-full items-center rounded-lg transition ${
                      sidebarCollapsed
                        ? "justify-center px-3 py-2.5"
                        : "gap-3 px-3 py-2.5"
                    } ${
                      active
                        ? "bg-[#edf4ff] text-[#2463eb]"
                        : "text-[#60728d] hover:bg-[#f5f8fc] hover:text-[#2463eb]"
                    }`}
                  >

                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />

                    {!sidebarCollapsed && (
                      <span className="text-[12px] font-medium">
                        {item.label}
                      </span>
                    )}

                  </button>
                );

              })}

            </div>

          </nav>

          {/* USER + LOGOUT */}

          <div className="border-t border-[#e8edf4] p-3">
            <div
              className={`rounded-xl bg-[#f7f9fc] ${
                sidebarCollapsed ? "p-2" : "px-3 py-2.5"
              }`}
            >
              <div
                className={`flex items-center ${
                  sidebarCollapsed
                    ? "justify-center"
                    : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                    <UserCircle size={18} />
                  </div>

                  {!sidebarCollapsed && (
                    <div>
                      <p className="text-[11px] font-semibold">
                        Employee
                      </p>

                      <p className="text-[9px] text-[#8190a6]">
                        Employee account
                      </p>
                    </div>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <ChevronRight
                    size={14}
                    className="text-[#8190a6]"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className={`mt-2 flex items-center rounded-lg text-[#6f7f95] transition hover:bg-white hover:text-red-500 ${
                  sidebarCollapsed
                    ? "w-full justify-center px-2 py-2"
                    : "w-full gap-2 px-2 py-1.5 text-[9px]"
                }`}
              >
                <LogOut size={14} />
                {!sidebarCollapsed && "Logout"}
              </button>
            </div>
          </div>

          {/* COLLAPSE */}

          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                !sidebarCollapsed
              )
            }
            className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm hover:text-[#2463eb]"
          >

            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}

          </button>

        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main
          className={`min-h-screen flex-1 transition-all duration-300 ${
            sidebarCollapsed
              ? "ml-[72px]"
              : "ml-[236px]"
          }`}
        >

          {/* HEADER */}

          <header className="flex h-[70px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

            <div>

              <h2 className="text-[19px] font-bold">
                Interview Prep
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Prepare for your next interview.
              </p>

            </div>


          </header>

          {/* =====================================================
              PAGE CONTENT
          ===================================================== */}

          <div className="px-6 py-5">

            {!started ? (

              <>

                {/* =================================================
                    MAIN PREPARATION CARD
                ================================================= */}

                <section className="rounded-xl border border-[#dfe7f1] bg-white">

                  {/* CARD TOP */}

                  <div className="flex items-center justify-between border-b border-[#e8edf4] px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                        <BriefcaseBusiness size={19} />
                      </div>

                      <div>

                        <h2 className="text-[14px] font-bold">
                          Start Interview Preparation
                        </h2>

                        <p className="mt-0.5 text-[9px] text-[#8190a6]">
                          Select the interview you want to prepare for.
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-[#f1f6ff] px-3 py-1 text-[8px] font-semibold text-[#2463eb]">
                      AI Powered
                    </span>

                  </div>

                  {/* INTERVIEW TYPES */}

                  <div className="px-5 pt-5">

                    <p className="mb-3 text-[10px] font-semibold">
                      Interview Type
                    </p>

                    <div className="grid grid-cols-3 gap-3">

                      {/* TECHNICAL */}

                      <button
                        type="button"
                        onClick={() =>
                          setInterviewType(
                            "technical"
                          )
                        }
                        className={`rounded-lg border p-4 text-left transition ${
                          interviewType ===
                          "technical"
                            ? "border-[#2463eb] bg-[#f2f6ff]"
                            : "border-[#dfe7f1] bg-white hover:border-[#b9cbea]"
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                            <Code2 size={17} />
                          </div>

                          {interviewType ===
                            "technical" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2463eb] text-white">
                              <Check size={12} />
                            </div>
                          )}

                        </div>

                        <h3 className="mt-3 text-[11px] font-semibold">
                          Technical
                        </h3>

                        <p className="mt-1 text-[8px] leading-relaxed text-[#8190a6]">
                          Prepare for technical and role-related discussions.
                        </p>

                      </button>

                      {/* HR */}

                      <button
                        type="button"
                        onClick={() =>
                          setInterviewType("hr")
                        }
                        className={`rounded-lg border p-4 text-left transition ${
                          interviewType === "hr"
                            ? "border-[#2463eb] bg-[#f2f6ff]"
                            : "border-[#dfe7f1] bg-white hover:border-[#b9cbea]"
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                            <MessageSquare size={17} />
                          </div>

                          {interviewType ===
                            "hr" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2463eb] text-white">
                              <Check size={12} />
                            </div>
                          )}

                        </div>

                        <h3 className="mt-3 text-[11px] font-semibold">
                          HR Interview
                        </h3>

                        <p className="mt-1 text-[8px] leading-relaxed text-[#8190a6]">
                          Practice communication and behavioral interviews.
                        </p>

                      </button>

                      {/* MIXED */}

                      <button
                        type="button"
                        onClick={() =>
                          setInterviewType("mixed")
                        }
                        className={`rounded-lg border p-4 text-left transition ${
                          interviewType === "mixed"
                            ? "border-[#2463eb] bg-[#f2f6ff]"
                            : "border-[#dfe7f1] bg-white hover:border-[#b9cbea]"
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                            <Layers3 size={17} />
                          </div>

                          {interviewType ===
                            "mixed" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2463eb] text-white">
                              <Check size={12} />
                            </div>
                          )}

                        </div>

                        <h3 className="mt-3 text-[11px] font-semibold">
                          Mixed Interview
                        </h3>

                        <p className="mt-1 text-[8px] leading-relaxed text-[#8190a6]">
                          Combine technical and behavioral preparation.
                        </p>

                      </button>

                    </div>

                  </div>

                  {/* SELECTORS */}

                  <div className="grid grid-cols-2 gap-4 px-5 py-5">

                    <div>

                      <label className="mb-2 block text-[10px] font-semibold">
                        Target Role
                      </label>

                      <select
                        value={role}
                        onChange={(e) =>
                          setRole(e.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-[#fbfcfe] px-3 text-[10px] text-[#52647d] outline-none focus:border-[#2463eb]"
                      >

                        <option value="">
                          Select your role
                        </option>

                        <option value="Software Engineer">
                          Software Engineer
                        </option>

                        <option value="Frontend Developer">
                          Frontend Developer
                        </option>

                        <option value="Backend Developer">
                          Backend Developer
                        </option>

                        <option value="Full Stack Developer">
                          Full Stack Developer
                        </option>

                        <option value="Data Analyst">
                          Data Analyst
                        </option>

                        <option value="Cyber Security Analyst">
                          Cyber Security Analyst
                        </option>

                      </select>

                    </div>

                    <div>

                      <label className="mb-2 block text-[10px] font-semibold">
                        Experience Level
                      </label>

                      <select
                        value={experience}
                        onChange={(e) =>
                          setExperience(
                            e.target.value
                          )
                        }
                        className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-[#fbfcfe] px-3 text-[10px] text-[#52647d] outline-none focus:border-[#2463eb]"
                      >

                        <option value="">
                          Select experience
                        </option>

                        <option value="Fresher">
                          Fresher
                        </option>

                        <option value="Entry Level">
                          Entry Level
                        </option>

                        <option value="Mid Level">
                          Mid Level
                        </option>

                        <option value="Experienced">
                          Experienced
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* START */}

                  <div className="px-5 pb-5">

                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={
                        !role ||
                        !experience ||
                        !interviewType
                      }
                      className={`flex h-[44px] w-full items-center justify-center gap-2 rounded-lg text-[11px] font-semibold transition ${
                        role &&
                        experience &&
                        interviewType
                          ? "bg-[#2463eb] text-white hover:bg-[#1f57d0]"
                          : "cursor-not-allowed bg-[#e9eef5] text-[#9aa8ba]"
                      }`}
                    >

                      <Play size={15} />

                      Start Preparation

                      <ArrowRight size={14} />

                    </button>

                  </div>

                </section>

                {/* =================================================
                    SMALL INFO ROW
                ================================================= */}

                <div className="mt-4 grid grid-cols-3 gap-3">

                  <div className="flex items-center gap-3 rounded-lg border border-[#dfe7f1] bg-white px-4 py-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f6ff] text-[#2463eb]">
                      <Sparkles size={15} />
                    </div>

                    <div>

                      <p className="text-[10px] font-semibold">
                        Personalized
                      </p>

                      <p className="text-[8px] text-[#8190a6]">
                        Based on your selection
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-[#dfe7f1] bg-white px-4 py-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f6ff] text-[#2463eb]">
                      <Code2 size={15} />
                    </div>

                    <div>

                      <p className="text-[10px] font-semibold">
                        Role Focused
                      </p>

                      <p className="text-[8px] text-[#8190a6]">
                        Practice for your target role
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-[#dfe7f1] bg-white px-4 py-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f6ff] text-[#2463eb]">
                      <BriefcaseBusiness size={15} />
                    </div>

                    <div>

                      <p className="text-[10px] font-semibold">
                        Interview Ready
                      </p>

                      <p className="text-[8px] text-[#8190a6]">
                        Prepare with confidence
                      </p>

                    </div>

                  </div>

                </div>

              </>

            ) : (

              /* ===================================================
                 STARTED PLACEHOLDER
              =================================================== */

              <section className="rounded-xl border border-[#dfe7f1] bg-white">

                <div className="flex items-center justify-between border-b border-[#e8edf4] px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                      <Sparkles size={19} />
                    </div>

                    <div>

                      <h2 className="text-[14px] font-bold">
                        Preparation Started
                      </h2>

                      <p className="text-[9px] text-[#8190a6]">
                        Your interview preparation interface will appear here.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[9px] font-medium text-[#60728d] hover:text-[#2463eb]"
                  >
                    Change Selection
                  </button>

                </div>

                <div className="grid grid-cols-3 gap-4 p-5">

                  <div className="rounded-lg bg-[#f7f9fc] p-4">

                    <p className="text-[8px] uppercase tracking-wide text-[#8190a6]">
                      Role
                    </p>

                    <p className="mt-2 text-[11px] font-semibold">
                      {role}
                    </p>

                  </div>

                  <div className="rounded-lg bg-[#f7f9fc] p-4">

                    <p className="text-[8px] uppercase tracking-wide text-[#8190a6]">
                      Interview
                    </p>

                    <p className="mt-2 text-[11px] font-semibold capitalize">
                      {interviewType}
                    </p>

                  </div>

                  <div className="rounded-lg bg-[#f7f9fc] p-4">

                    <p className="text-[8px] uppercase tracking-wide text-[#8190a6]">
                      Experience
                    </p>

                    <p className="mt-2 text-[11px] font-semibold">
                      {experience}
                    </p>

                  </div>

                </div>

                <div className="mx-5 mb-5 flex min-h-[210px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d6e0ec] bg-[#fbfcfe] text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                    <Bot size={22} />
                  </div>

                  <h3 className="mt-3 text-[12px] font-semibold">
                    Interview preparation will appear here
                  </h3>

                  <p className="mt-1 max-w-md text-[9px] leading-relaxed text-[#8190a6]">
                    AI-generated questions and interview practice
                    will be connected here later.
                  </p>

                </div>

              </section>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}