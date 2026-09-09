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
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  UserCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  LogOut,
} from "lucide-react";

type SettingsSection =
  | "main"
  | "profile"
  | "security"
  | "notifications";

export default function SettingsPage() {
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("main");

  const [fullName, setFullName] =
    useState("Employee");

  const [email, setEmail] =
    useState("employee@example.com");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [saved, setSaved] =
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

  const handleSaveProfile = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleChangePassword = () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    alert("Password updated successfully.");
  };

  /* ================= MAIN SETTINGS ================= */

  const renderMainSettings = () => {
    return (
      <div className="max-w-[900px]">

        <div className="overflow-hidden rounded-xl border border-[#dfe7f1] bg-white">

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              setActiveSection("profile")
            }
            className="flex w-full items-center justify-between border-b border-[#e8edf4] px-5 py-5 text-left transition hover:bg-[#f8faff]"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                <User size={18} />
              </div>

              <div>

                <h2 className="text-[13px] font-semibold text-[#102a56]">
                  Profile & Account
                </h2>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  Manage your name and email address.
                </p>

              </div>

            </div>

            <ChevronRight
              size={17}
              className="text-[#8190a6]"
            />

          </button>

          {/* SECURITY */}

          <button
            type="button"
            onClick={() =>
              setActiveSection("security")
            }
            className="flex w-full items-center justify-between border-b border-[#e8edf4] px-5 py-5 text-left transition hover:bg-[#f8faff]"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                <Lock size={18} />
              </div>

              <div>

                <h2 className="text-[13px] font-semibold text-[#102a56]">
                  Security
                </h2>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  Change your password and keep your account secure.
                </p>

              </div>

            </div>

            <ChevronRight
              size={17}
              className="text-[#8190a6]"
            />

          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            onClick={() =>
              setActiveSection("notifications")
            }
            className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#f8faff]"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                <Bell size={18} />
              </div>

              <div>

                <h2 className="text-[13px] font-semibold text-[#102a56]">
                  Notifications
                </h2>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  Manage your notification preferences.
                </p>

              </div>

            </div>

            <ChevronRight
              size={17}
              className="text-[#8190a6]"
            />

          </button>

        </div>

      </div>
    );
  };

  /* ================= PROFILE ================= */

  const renderProfile = () => {
    return (
      <div className="max-w-[700px]">

        <button
          type="button"
          onClick={() => setActiveSection("main")}
          className="mb-4 flex items-center gap-2 text-[10px] font-medium text-[#60728d] hover:text-[#2463eb]"
        >
          <ArrowLeft size={14} />
          Back to Settings
        </button>

        <div className="mb-5">

          <h1 className="text-[20px] font-bold">
            Profile & Account
          </h1>

          <p className="mt-1 text-[10px] text-[#71829c]">
            Manage your personal account information.
          </p>

        </div>

        <div className="rounded-xl border border-[#dfe7f1] bg-white">

          <div className="flex items-center gap-3 border-b border-[#e8edf4] px-5 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
              <User size={17} />
            </div>

            <div>

              <h2 className="text-[13px] font-semibold">
                Account Information
              </h2>

              <p className="text-[9px] text-[#8190a6]">
                Update your account details.
              </p>

            </div>

          </div>

          <div className="space-y-5 p-5">

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 text-[11px] outline-none focus:border-[#2463eb]"
              />

            </div>

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 text-[11px] outline-none focus:border-[#2463eb]"
              />

            </div>

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                Account Type
              </label>

              <div className="flex h-10 items-center rounded-lg border border-[#e2e8f0] bg-[#f7f9fc] px-3 text-[10px] text-[#60728d]">
                Employee
              </div>

            </div>

            <div className="flex items-center justify-between pt-1">

              {saved ? (
                <span className="text-[9px] font-medium text-green-600">
                  Changes saved successfully.
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1f57d0]"
              >

                <Save size={13} />

                Save Changes

              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  /* ================= SECURITY ================= */

  const renderSecurity = () => {
    return (
      <div className="max-w-[700px]">

        <button
          type="button"
          onClick={() => setActiveSection("main")}
          className="mb-4 flex items-center gap-2 text-[10px] font-medium text-[#60728d] hover:text-[#2463eb]"
        >
          <ArrowLeft size={14} />
          Back to Settings
        </button>

        <div className="mb-5">

          <h1 className="text-[20px] font-bold">
            Security
          </h1>

          <p className="mt-1 text-[10px] text-[#71829c]">
            Manage your account password.
          </p>

        </div>

        <div className="rounded-xl border border-[#dfe7f1] bg-white">

          <div className="flex items-center gap-3 border-b border-[#e8edf4] px-5 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
              <Lock size={17} />
            </div>

            <div>

              <h2 className="text-[13px] font-semibold">
                Change Password
              </h2>

              <p className="text-[9px] text-[#8190a6]">
                Update your password regularly to keep your account secure.
              </p>

            </div>

          </div>

          <div className="space-y-5 p-5">

            {/* CURRENT */}

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                Current Password
              </label>

              <div className="relative">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8190a6]"
                >

                  {showCurrentPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}

                </button>

              </div>

            </div>

            {/* NEW */}

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8190a6]"
                >

                  {showNewPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}

                </button>

              </div>

            </div>

            {/* CONFIRM */}

            <div>

              <label className="mb-2 block text-[10px] font-semibold">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8190a6]"
                >

                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}

                </button>

              </div>

            </div>

            <button
              type="button"
              onClick={handleChangePassword}
              className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1f57d0]"
            >

              <Lock size={13} />

              Update Password

            </button>

          </div>

        </div>

      </div>
    );
  };

  /* ================= NOTIFICATIONS ================= */

  const renderNotifications = () => {
    return (
      <div className="max-w-[700px]">

        <button
          type="button"
          onClick={() => setActiveSection("main")}
          className="mb-4 flex items-center gap-2 text-[10px] font-medium text-[#60728d] hover:text-[#2463eb]"
        >

          <ArrowLeft size={14} />

          Back to Settings

        </button>

        <div className="mb-5">

          <h1 className="text-[20px] font-bold">
            Notifications
          </h1>

          <p className="mt-1 text-[10px] text-[#71829c]">
            Choose which notifications you want to receive.
          </p>

        </div>

        <div className="rounded-xl border border-[#dfe7f1] bg-white">

          <div className="flex items-center gap-3 border-b border-[#e8edf4] px-5 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
              <Bell size={17} />
            </div>

            <div>

              <h2 className="text-[13px] font-semibold">
                Notification Preferences
              </h2>

              <p className="text-[9px] text-[#8190a6]">
                Manage how you receive updates.
              </p>

            </div>

          </div>

          <div className="p-5">

            <div className="flex items-center justify-between rounded-lg border border-[#e5ebf2] px-4 py-4">

              <div>

                <p className="text-[11px] font-semibold">
                  Email Notifications
                </p>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  Receive updates about your resume activity.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailNotifications(
                    !emailNotifications
                  )
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  emailNotifications
                    ? "bg-[#2463eb]"
                    : "bg-[#cbd5e1]"
                }`}
              >

                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    emailNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}

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
                      item.path ===
                      "/employee/settings"
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

        {/* ================= MAIN ================= */}

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
                Settings
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Manage your account settings.
              </p>

            </div>

          </header>

          {/* CONTENT */}

          <div className="px-6 py-5">

            {activeSection === "main" &&
              renderMainSettings()}

            {activeSection === "profile" &&
              renderProfile()}

            {activeSection === "security" &&
              renderSecurity()}

            {activeSection === "notifications" &&
              renderNotifications()}

          </div>

        </main>

      </div>

    </div>
  );
}