"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  BriefcaseBusiness,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCircle,
  LogOut,
} from "lucide-react";

import { api, clearAuthTokens } from "@/lib/api";

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

type UserProfile = {
  id: number;
  full_name: string;
  email: string;
};

export default function EmployeeSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  /* =========================================================
     SIDEBAR WIDTH
  ========================================================= */

  useEffect(() => {
    const width = collapsed ? "72px" : "236px";

    document.documentElement.style.setProperty(
      "--employee-sidebar-width",
      width
    );

    return () => {
      document.documentElement.style.removeProperty(
        "--employee-sidebar-width"
      );
    };
  }, [collapsed]);

  /* =========================================================
     LOAD USER PROFILE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const response =
          await api.get("/settings/profile/");

        if (!mounted) return;

        setProfile(response.data);
      } catch (error) {
        console.error(
          "Failed to load employee profile:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    clearAuthTokens();

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }

    router.replace("/login");
  };

  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================= */

  const isActive = (path: string) => {
    if (path === "/employee") {
      return pathname === "/employee";
    }

    return pathname.startsWith(path);
  };

  /* =========================================================
     USER DISPLAY DATA
  ========================================================= */

  const displayName =
    profile?.full_name?.trim() ||
    "Employee";

  const displayEmail =
    profile?.email?.trim() ||
    "Employee account";

  /* =========================================================
     SIDEBAR
  ========================================================= */

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#e3eaf3] bg-white transition-all duration-300 ${
        collapsed
          ? "w-[72px]"
          : "w-[236px]"
      }`}
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <div
        className={`flex h-[82px] shrink-0 items-center border-b border-[#e8edf4] ${
          collapsed
            ? "justify-center"
            : "px-4"
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

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-4">

        <div className="space-y-1">

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active =
              isActive(item.path);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  router.push(item.path)
                }
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
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
                <Icon
                  size={17}
                  strokeWidth={1.8}
                />

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

      {/* =====================================================
          USER SECTION
      ===================================================== */}

      <div className="shrink-0 border-t border-[#e8edf4] p-3">

        <div
          className={`rounded-xl bg-[#f7f9fc] ${
            collapsed
              ? "p-2"
              : "px-3 py-2.5"
          }`}
        >

          {/* USER INFO */}

          <div
            className={`flex items-center ${
              collapsed
                ? "justify-center"
                : "justify-between"
            }`}
          >

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                <UserCircle size={18} />
              </div>

              {!collapsed && (
                <div className="min-w-0">

                  <p className="max-w-[125px] truncate text-[11px] font-semibold text-[#102a56]">
                    {loadingProfile
                      ? "Loading..."
                      : displayName}
                  </p>

                  <p className="max-w-[125px] truncate text-[9px] text-[#8190a6]">
                    {loadingProfile
                      ? "Loading account..."
                      : displayEmail}
                  </p>

                </div>
              )}

            </div>

            {!collapsed && (
              <ChevronRight
                size={14}
                className="shrink-0 text-[#9aa8ba]"
              />
            )}

          </div>

          {/* LOGOUT */}

          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 inline-flex items-center gap-1 px-0.5 text-[8px] font-medium text-[#9aa8ba] transition hover:text-red-500"
            >
              <LogOut
                size={10}
                strokeWidth={1.8}
              />

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
              <LogOut
                size={12}
                strokeWidth={1.8}
              />
            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          COLLAPSE BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setCollapsed((previous) => !previous)
        }
        className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm transition hover:text-[#2463eb]"
        title={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
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