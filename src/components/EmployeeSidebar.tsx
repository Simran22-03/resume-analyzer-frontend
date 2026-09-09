"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Users,
  BriefcaseBusiness,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCircle,
  LogOut,
} from "lucide-react";

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
    icon: FilePlus,
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

export default function EmployeeSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  const isActive = (path: string) => {
    if (path === "/employee") {
      return pathname === "/employee";
    }

    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#e3eaf3] bg-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[236px]"
      }`}
    >
      {/* LOGO */}

      <div
        className={`flex h-[82px] items-center border-b border-[#e8edf4] ${
          collapsed ? "justify-center" : "px-4"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2463eb] text-white">
            <Sparkles size={21} />
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-[15px] font-bold leading-tight text-[#102a56]">
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
            const active = isActive(item.path);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                className={`flex w-full items-center rounded-lg transition ${
                  collapsed
                    ? "justify-center px-3 py-2.5"
                    : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-[#edf4ff] text-[#2463eb]"
                    : "text-[#60728d] hover:bg-[#f5f8fc] hover:text-[#2463eb]"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />

                {!collapsed && (
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
            collapsed ? "p-2" : "px-3 py-2.5"
          }`}
        >
          {/* USER INFO */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                <UserCircle size={18} />
              </div>

              {!collapsed && (
                <div>
                  <p className="text-[11px] font-semibold text-[#102a56]">
                    Employee
                  </p>

                  <p className="text-[9px] text-[#8190a6]">
                    Employee account
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronRight
                size={14}
                className="text-[#9aa8ba]"
              />
            )}
          </div>

          {/* LOGOUT */}

          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1.5 inline-flex items-center gap-1 px-0.5 text-[8px] font-medium text-[#9aa8ba] transition hover:text-red-500"
            >
              <LogOut size={10} strokeWidth={1.8} />
              Logout
            </button>
          )}

          {/* COLLAPSED LOGOUT */}

          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="mt-2 flex w-full items-center justify-center text-[#9aa8ba] transition hover:text-red-500"
            >
              <LogOut size={12} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* COLLAPSE BUTTON */}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm hover:text-[#2463eb]"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={14} />
        ) : (
          <ChevronLeft size={14} />
        )}
      </button>
    </aside>
  );
}