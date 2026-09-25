"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  LogOut,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";
import { api, clearAuthTokens } from "@/lib/api";

type SettingsSection =
  | "main"
  | "profile"
  | "security";

type ProfileData = {
  id: number;
  full_name: string;
  email: string;
};

export default function SettingsPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("main");

  /* =========================================================
     PROFILE STATE
  ========================================================= */

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  /* =========================================================
     PASSWORD STATE
  ========================================================= */

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

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const response =
          await api.get<ProfileData>(
            "/settings/profile/"
          );

        const profile = response.data;

        setFullName(
          profile.full_name || ""
        );

        setEmail(
          profile.email || ""
        );
      } catch (error: any) {
        console.error(
          "Failed to load profile:",
          error
        );

        if (
          error?.response?.status === 401
        ) {
          clearAuthTokens();
          router.push("/login");
        }
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    clearAuthTokens();

    router.replace("/login");
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      alert("Full name is required.");
      return;
    }

    if (!email.trim()) {
      alert("Email address is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setSaved(false);

      const response =
        await api.patch(
          "/settings/profile/",
          {
            full_name:
              fullName.trim(),

            email:
              email.trim(),
          }
        );

      const updatedProfile =
        response.data?.profile;

      if (updatedProfile) {
        setFullName(
          updatedProfile.full_name ||
            ""
        );

        setEmail(
          updatedProfile.email ||
            ""
        );
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error
      );

      const responseData =
        error?.response?.data;

      if (
        responseData?.email
      ) {
        alert(
          Array.isArray(
            responseData.email
          )
            ? responseData.email[0]
            : responseData.email
        );

        return;
      }

      if (
        responseData?.full_name
      ) {
        alert(
          Array.isArray(
            responseData.full_name
          )
            ? responseData.full_name[0]
            : responseData.full_name
        );

        return;
      }

      alert(
        responseData?.detail ||
          responseData?.message ||
          "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handleChangePassword =
    async () => {
      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        alert(
          "Please fill in all password fields."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        alert(
          "New password and confirm password do not match."
        );

        return;
      }

      if (newPassword.length < 8) {
        alert(
          "New password must be at least 8 characters long."
        );

        return;
      }

      try {
        setPasswordLoading(true);

        const response =
          await api.post(
            "/settings/change-password/",
            {
              current_password:
                currentPassword,

              new_password:
                newPassword,

              confirm_password:
                confirmPassword,
            }
          );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setShowCurrentPassword(
          false
        );

        setShowNewPassword(false);

        setShowConfirmPassword(
          false
        );

        alert(
          response.data?.message ||
            "Password updated successfully."
        );

        /*
         * Password changes invalidate the
         * old authentication credentials
         * depending on the authentication
         * configuration.
         *
         * Send the user back to login so
         * they can authenticate again.
         */

        clearAuthTokens();

        router.replace("/login");
      } catch (error: any) {
        console.error(
          "Failed to change password:",
          error
        );

        const responseData =
          error?.response?.data;

        if (
          responseData?.current_password
        ) {
          alert(
            Array.isArray(
              responseData.current_password
            )
              ? responseData.current_password[0]
              : responseData.current_password
          );

          return;
        }

        if (
          responseData?.new_password
        ) {
          alert(
            Array.isArray(
              responseData.new_password
            )
              ? responseData.new_password[0]
              : responseData.new_password
          );

          return;
        }

        if (
          responseData?.confirm_password
        ) {
          alert(
            Array.isArray(
              responseData.confirm_password
            )
              ? responseData.confirm_password[0]
              : responseData.confirm_password
          );

          return;
        }

        alert(
          responseData?.detail ||
            responseData?.message ||
            "Failed to update password."
        );
      } finally {
        setPasswordLoading(false);
      }
    };

  /* =========================================================
     MAIN SETTINGS
  ========================================================= */

  const renderMainSettings = () => {
    return (
      <div className="max-w-[900px]">

        <div className="overflow-hidden rounded-xl border border-[#dfe7f1] bg-white">

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              setActiveSection(
                "profile"
              )
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
              setActiveSection(
                "security"
              )
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

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-5 py-5 text-left transition hover:bg-[#fff7f7]"
          >
            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff0f0] text-[#dc2626]">
                <LogOut size={18} />
              </div>

              <div>
                <h2 className="text-[13px] font-semibold text-[#dc2626]">
                  Logout
                </h2>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  Sign out of your employee account.
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

  /* =========================================================
     PROFILE
  ========================================================= */

  const renderProfile = () => {
    return (
      <div className="max-w-[700px]">

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

            {/* FULL NAME */}

            <div>
              <label className="mb-2 block text-[10px] font-semibold">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                disabled={
                  profileLoading ||
                  profileSaving
                }
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 text-[11px] outline-none focus:border-[#2463eb] disabled:bg-[#f7f9fc]"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-[10px] font-semibold">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                disabled={
                  profileLoading ||
                  profileSaving
                }
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 text-[11px] outline-none focus:border-[#2463eb] disabled:bg-[#f7f9fc]"
              />
            </div>

            {/* ACCOUNT TYPE */}

            <div>
              <label className="mb-2 block text-[10px] font-semibold">
                Account Type
              </label>

              <div className="flex h-10 items-center rounded-lg border border-[#e2e8f0] bg-[#f7f9fc] px-3 text-[10px] text-[#60728d]">
                Employee
              </div>
            </div>

            {/* SAVE */}

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
                onClick={
                  handleSaveProfile
                }
                disabled={
                  profileLoading ||
                  profileSaving
                }
                className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1f57d0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={13} />

                {profileSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     SECURITY
  ========================================================= */

  const renderSecurity = () => {
    return (
      <div className="max-w-[700px]">

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

            {/* CURRENT PASSWORD */}

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
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  disabled={
                    passwordLoading
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb] disabled:bg-[#f7f9fc]"
                />

                <button
                  type="button"
                  disabled={
                    passwordLoading
                  }
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

            {/* NEW PASSWORD */}

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
                    setNewPassword(
                      e.target.value
                    )
                  }
                  disabled={
                    passwordLoading
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb] disabled:bg-[#f7f9fc]"
                />

                <button
                  type="button"
                  disabled={
                    passwordLoading
                  }
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

            {/* CONFIRM PASSWORD */}

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
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={
                    passwordLoading
                  }
                  className="h-10 w-full rounded-lg border border-[#d7e1ed] bg-white px-3 pr-10 text-[11px] outline-none focus:border-[#2463eb] disabled:bg-[#f7f9fc]"
                />

                <button
                  type="button"
                  disabled={
                    passwordLoading
                  }
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

            {/* UPDATE PASSWORD */}

            <button
              type="button"
              onClick={
                handleChangePassword
              }
              disabled={
                passwordLoading
              }
              className="flex items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1f57d0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={13} />

              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">

        {/* =====================================================
           SHARED SIDEBAR
        ===================================================== */}

        <EmployeeSidebar />

        {/* =====================================================
           MAIN CONTENT
        ===================================================== */}

        <main className="ml-[236px] min-h-screen flex-1">

          {/* ===================================================
             TOP BAR
          =================================================== */}

          <header className="flex h-[70px] items-center border-b border-[#e3eaf3] bg-white px-6">

            {activeSection === "main" ? (

              <h2 className="text-[19px] font-bold">
                Settings
              </h2>

            ) : (

              <button
                type="button"
                onClick={() =>
                  setActiveSection(
                    "main"
                  )
                }
                className="flex items-center gap-2 text-[18px] font-bold text-[#102a56] transition hover:text-[#2463eb]"
              >
                <ArrowLeft
                  size={19}
                  strokeWidth={1.8}
                />

                {activeSection ===
                "profile"
                  ? "Profile & Account"
                  : "Security"}
              </button>

            )}

          </header>

          {/* ===================================================
             CONTENT
          =================================================== */}

          <div className="px-6 py-5">

            {activeSection ===
              "main" &&
              renderMainSettings()}

            {activeSection ===
              "profile" &&
              renderProfile()}

            {activeSection ===
              "security" &&
              renderSecurity()}

          </div>

        </main>

      </div>

    </div>
  );
}