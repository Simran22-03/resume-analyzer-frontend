"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  BriefcaseBusiness,
  FileSearch,
  Clock3,
  Target,
  CircleUserRound,
  ArrowRight,
  Upload,
} from "lucide-react";

import api from "@/lib/api";
import EmployeeSidebar from "@/components/EmployeeSidebar";

type DashboardData = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company_name?: string | null;
  };

  statistics: {
    resumes_analyzed: number;
    comparisons: number;
    interviews: number;
  };

  recent_activity: {
    title?: string;
    description?: string;
    date?: string;
  }[];

  resume: {
    uploaded: boolean;
    status: string;
  };
};

export default function EmployeePage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response =
          await api.get<DashboardData>("/dashboard/");

        setDashboardData(response.data);
      } catch (error: any) {
        console.error(
          "Error fetching dashboard:",
          error?.response?.data ||
            error?.message ||
            error
        );
      }
    };

    fetchDashboard();
  }, []);

  const resumeUploaded =
    dashboardData?.resume?.uploaded ?? false;

  const resumeStatus =
    dashboardData?.resume?.status ||
    "Loading...";

  const analysisStatus =
    dashboardData?.statistics?.resumes_analyzed &&
    dashboardData.statistics.resumes_analyzed > 0
      ? `${dashboardData.statistics.resumes_analyzed} analysis completed`
      : "No analysis yet";

  const interviewStatus =
    dashboardData?.statistics?.interviews &&
    dashboardData.statistics.interviews > 0
      ? `${dashboardData.statistics.interviews} session completed`
      : "Not started";

  const profileStatus =
    dashboardData?.user?.name
      ? "Profile available"
      : "Loading...";

  const overviewCards = [
    {
      title: "Resume",
      status: resumeStatus,
      description: resumeUploaded
        ? "Resume uploaded"
        : "Upload your resume",
      icon: FileText,
      path: "/employee/resume-analyzer",
    },
    {
      title: "Analysis",
      status: analysisStatus,
      description: "Analyze your resume",
      icon: FileSearch,
      path: "/employee/resume-analyzer",
    },
    {
      title: "Interview",
      status: interviewStatus,
      description: "Prepare for interviews",
      icon: BriefcaseBusiness,
      path: "/employee/interview-prep",
    },
    {
      title: "Profile",
      status: profileStatus,
      description: "Manage your profile",
      icon: CircleUserRound,
      path: "/employee/settings",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] text-[#102a56]">
      <div className="flex h-screen">

        {/* =====================================================
            SHARED EMPLOYEE SIDEBAR
            ===================================================== */}

        <EmployeeSidebar />

        {/* =====================================================
            MAIN DASHBOARD
            ===================================================== */}

        <main className="ml-[236px] h-screen flex-1">

          {/* HEADER */}

          <header className="flex h-[70px] items-center border-b border-[#e3eaf3] bg-white px-6">
            <div>
              <h2 className="text-[19px] font-bold">
                Welcome Back!
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Let's analyze your resume and build your career profile.
              </p>
            </div>
          </header>

          {/* CONTENT */}

          <div className="h-[calc(100vh-70px)] overflow-hidden px-6 py-5">

            <div className="mb-4">
              <h1 className="text-[20px] font-bold">
                Employee Dashboard
              </h1>

              <p className="mt-1 text-[10px] text-[#71829c]">
                Overview of your resume and career profile.
              </p>
            </div>

            {/* =================================================
                OVERVIEW CARDS
                ================================================= */}

            <div className="grid grid-cols-4 gap-3">

              {overviewCards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() =>
                      router.push(card.path)
                    }
                    className="flex h-[86px] items-center justify-between rounded-xl border border-[#dfe7f1] bg-white px-4 text-left shadow-[0_1px_3px_rgba(20,40,70,0.04)] transition hover:border-[#cbdaf1] hover:shadow-[0_4px_12px_rgba(36,99,235,0.06)]"
                  >
                    <div>
                      <p className="text-[10px] font-medium text-[#8190a6]">
                        {card.title}
                      </p>

                      <h3 className="mt-1 text-[13px] font-semibold">
                        {card.status}
                      </h3>

                      <p className="mt-1 text-[9px] text-[#8a98ab]">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                      <Icon size={17} />
                    </div>
                  </button>
                );
              })}

            </div>

            {/* =================================================
                MAIN OVERVIEW
                ================================================= */}

            <div className="mt-4 grid grid-cols-[1.55fr_1fr] gap-4">

              {/* =================================================
                  RESUME STATUS
                  ================================================= */}

              <section className="h-[285px] rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

                <div className="border-b border-[#e8edf4] px-5 py-3.5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                      <FileSearch size={16} />
                    </div>

                    <div>

                      <h2 className="text-[13px] font-bold">
                        Resume Status
                      </h2>

                      <p className="text-[9px] text-[#8190a6]">
                        Your current resume overview
                      </p>

                    </div>

                  </div>

                </div>

                <div className="flex h-[220px] items-center px-6">

                  <div className="flex w-full items-center gap-5">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f3f6fa] text-[#91a0b2]">
                      <FileText
                        size={27}
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="flex-1">

                      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8a98ab]">
                        Current Status
                      </p>

                      <h3 className="mt-1 text-[16px] font-semibold">
                        {dashboardData
                          ? resumeStatus
                          : "Loading..."}
                      </h3>

                      <p className="mt-1 max-w-[470px] text-[10px] leading-relaxed text-[#8190a6]">
                        {resumeUploaded
                          ? "Your resume is available for analysis and career insights."
                          : "Upload your resume to start analyzing your skills, strengths and improvement areas."}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/employee/resume-analyzer"
                          )
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#1f57d0]"
                      >
                        <Upload size={13} />

                        {resumeUploaded
                          ? "Open Resume Analyzer"
                          : "Upload Resume"}

                        <ArrowRight size={13} />
                      </button>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  RECENT ACTIVITY
                  ================================================= */}

              <section className="h-[285px] rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

                <div className="border-b border-[#e8edf4] px-5 py-3.5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                      <Clock3 size={16} />
                    </div>

                    <div>

                      <h2 className="text-[13px] font-bold">
                        Recent Activity
                      </h2>

                      <p className="text-[9px] text-[#8190a6]">
                        Your latest activity
                      </p>

                    </div>

                  </div>

                </div>

                {dashboardData?.recent_activity &&
                dashboardData.recent_activity.length > 0 ? (

                  <div className="h-[220px] overflow-y-auto px-5 py-4">

                    <div className="space-y-3">

                      {dashboardData.recent_activity.map(
                        (activity, index) => (

                          <div
                            key={index}
                            className="rounded-lg bg-[#f7f9fc] px-3 py-3"
                          >

                            <p className="text-[11px] font-semibold">
                              {activity.title ||
                                "Activity"}
                            </p>

                            <p className="mt-1 text-[9px] text-[#8190a6]">
                              {activity.description ||
                                "Recent activity"}
                            </p>

                            {activity.date && (
                              <p className="mt-1 text-[8px] text-[#9aa8ba]">
                                {activity.date}
                              </p>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                ) : (

                  <div className="flex h-[220px] flex-col items-center justify-center text-center">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f6fa] text-[#9aa8ba]">
                      <Clock3 size={19} />
                    </div>

                    <h3 className="mt-3 text-[12px] font-semibold">
                      No recent activity
                    </h3>

                    <p className="mt-1 max-w-[190px] text-[9px] leading-relaxed text-[#8b98aa]">
                      Your resume analysis and career activities will appear here.
                    </p>

                  </div>

                )}

              </section>

            </div>

            {/* =================================================
                BOTTOM
                ================================================= */}

            <section className="mt-4 h-[92px] rounded-xl border border-[#dfe7f1] bg-white px-5 shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

              <div className="flex h-full items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                    <Target size={17} />
                  </div>

                  <div>

                    <h2 className="text-[12px] font-semibold">
                      Start improving your career profile
                    </h2>

                    <p className="mt-0.5 text-[9px] text-[#8190a6]">
                      Upload your resume to unlock resume analysis and career insights.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/employee/resume-analyzer"
                    )
                  }
                  className="flex items-center gap-2 rounded-lg border border-[#d8e4f7] bg-[#f3f7ff] px-3.5 py-2 text-[10px] font-semibold text-[#2463eb] hover:bg-[#eaf1ff]"
                >
                  Get Started
                  <ArrowRight size={13} />
                </button>

              </div>

            </section>

          </div>

        </main>

      </div>
    </div>
  );
}