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
  LogOut,
  ArrowLeft,
  Search,
} from "lucide-react";

export default function PracticeHistoryPage() {
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] =
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
                  item.path === "/employee/interview-prep";

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => router.push(item.path)}
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
                        ? "bg-[#e8f1ff] text-[#2463eb]"
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

          {/* USER */}

          <div className="border-t border-[#e8edf4] p-3">

            <div
              className={`rounded-xl bg-[#f7f9fc] ${
                sidebarCollapsed
                  ? "p-2"
                  : "px-3 py-2.5"
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

              {/* LOGOUT */}

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

          {/* COLLAPSE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                !sidebarCollapsed
              )
            }
            className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm hover:text-[#2463eb]"
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
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

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="mb-1 flex items-center gap-1.5 text-[10px] text-[#60728d] transition hover:text-[#2463eb]"
              >
                <ArrowLeft size={13} />

                Back to Interview Prep
              </button>

              <h2 className="text-[19px] font-bold">
                Practice History
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                View your previous interview practice attempts.
              </p>

            </div>

          </header>

          {/* PAGE */}

          <div className="bg-[#f7f9fc] px-5 py-5 lg:px-7">

            {/* PAGE CARD */}

            <section className="overflow-hidden rounded-2xl border border-[#dfe7f1] bg-white shadow-sm">

              {/* CARD HEADER */}

              <div className="flex items-center justify-between border-b border-[#e8edf4] px-5 py-4">

                <div>

                  <h2 className="text-[14px] font-bold">
                    Recent Practice
                  </h2>

                  <p className="mt-1 text-[10px] text-[#8190a6]">
                    Your interview practice attempts will appear here.
                  </p>

                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                  <Search size={15} />
                </div>

              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead>

                    <tr className="border-b border-[#edf1f5] text-[10px] text-[#8190a6]">

                      <th className="px-5 py-3 font-medium">
                        Question
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Type
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Score
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      <td
                        colSpan={5}
                        className="px-5 py-14 text-center"
                      >

                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ff] text-[#2463eb]">
                          <Search size={17} />
                        </div>

                        <p className="mt-3 text-[11px] font-medium text-[#52647d]">
                          No practice attempts yet.
                        </p>

                        <p className="mt-1 text-[10px] text-[#8190a6]">
                          Start practicing questions to see your history here.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/employee/interview-prep"
                            )
                          }
                          className="mt-4 rounded-xl bg-[#2463eb] px-4 py-2 text-[10px] font-medium text-white transition hover:bg-[#1f57d0]"
                        >
                          Start Practice
                        </button>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}