"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileCheck,
  FileSearch,
  Lightbulb,
  AlertTriangle,
  Target,
  LayoutDashboard,
  FileText,
  Users,
  BriefcaseBusiness,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCircle,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import api from "@/lib/api";
import CopilotPanel from "@/components/CopilotPanel";


type Analysis = {
  id: number;
  resume_id: number;
  ats_score: number;
  strengths: string[];
  missing_skills: string[];
  weaknesses: string[];
  suggestions: string[];
};


type Resume = {
  id: number;
  file: string | null;
  uploaded_at: string;
  is_analyzed: boolean;
};


type ApiResponse = {
  resume: Resume;
  analysis: Analysis;
};


type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string | null;
};


type DashboardResponse = {
  user: User;
};


export default function ResumeAnalysisPage() {
  const router = useRouter();

  const params = useParams();

  const resumeId =
    params?.id as string;


  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);


  const [user, setUser] =
    useState<User | null>(null);


  const [resume, setResume] =
    useState<Resume | null>(null);


  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [copilotOpen, setCopilotOpen] =
    useState(true);


  /* =====================================================
     LOAD ANALYSIS
  ===================================================== */

  useEffect(() => {
    if (!resumeId) return;

    const fetchAnalysis = async () => {
      try {
        const [
          analysisResponse,
          dashboardResponse,
        ] = await Promise.all([
          api.get<ApiResponse>(
            `/dashboard/resumes/${resumeId}/analysis/`
          ),

          api.get<DashboardResponse>(
            "/dashboard/"
          ),
        ]);

        setResume(
          analysisResponse.data.resume
        );

        setAnalysis(
          analysisResponse.data.analysis
        );

        setUser(
          dashboardResponse.data.user
        );

      } catch (error: any) {
        console.error(
          "Analysis error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.response?.data?.detail ||
            "Unable to load resume analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [resumeId]);


  /* =====================================================
     NAVIGATION
  ===================================================== */

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
      label: "AI Assistant",
      icon: Bot,
      path: "/employee/ai-assistant",
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


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#dce6f5] border-t-[#2463eb]" />

          <p className="mt-3 text-[10px] text-[#71829c]">
            Loading analysis...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

        <div className="flex min-h-screen">

          {/* SIDEBAR */}

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

                {navigationItems.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          router.push(
                            item.path
                          )
                        }
                        title={
                          sidebarCollapsed
                            ? item.label
                            : undefined
                        }
                        className={`flex w-full items-center rounded-lg ${
                          sidebarCollapsed
                            ? "justify-center px-3 py-2.5"
                            : "gap-3 px-3 py-2.5"
                        } ${
                          item.path ===
                          "/employee/resume-analyzer"
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
                  }
                )}

              </div>

            </nav>


            {/* USER */}

            <div className="border-t border-[#e8edf4] p-3">

              <div
                className={`flex items-center rounded-xl bg-[#f7f9fc] ${
                  sidebarCollapsed
                    ? "justify-center p-2"
                    : "justify-between px-3 py-2.5"
                }`}
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                    <UserCircle size={18} />
                  </div>

                  {!sidebarCollapsed && (
                    <div>

                      <p className="text-[11px] font-semibold">
                        {user?.name ||
                          "Loading..."}
                      </p>

                      <p className="text-[9px] text-[#8190a6]">
                        {user?.role ||
                          "Loading..."}
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

            </div>


            {/* COLLAPSE */}

            <button
              type="button"
              onClick={() =>
                setSidebarCollapsed(
                  !sidebarCollapsed
                )
              }
              title={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm hover:text-[#2463eb]"
            >

              {sidebarCollapsed ? (
                <ChevronRight
                  size={14}
                />
              ) : (
                <ChevronLeft
                  size={14}
                />
              )}

            </button>

          </aside>


          {/* ERROR MAIN */}

          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarCollapsed
                ? "ml-[72px]"
                : "ml-[236px]"
            }`}
          >

            <header className="flex h-[70px] items-center border-b border-[#e3eaf3] bg-white px-6">

              <div>
                <h1 className="text-[19px] font-bold">
                  Resume Analysis
                </h1>

                <p className="mt-0.5 text-[10px] text-[#71829c]">
                  Resume analysis results
                </p>
              </div>

            </header>


            <div className="px-6 py-6">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/resume-analyzer"
                  )
                }
                className="mb-5 flex items-center gap-2 text-[10px] font-medium text-[#60728d] hover:text-[#2463eb]"
              >
                <ArrowLeft size={14} />
                Back
              </button>


              <div className="rounded-xl border border-[#dfe7f1] bg-white p-8 text-center">

                <p className="text-[11px] font-semibold text-red-500">
                  {error ||
                    "Analysis not found."}
                </p>

              </div>

            </div>

          </main>


  
        </div>
      </div>
    );
  }


  /* =====================================================
     RESUME NAME
  ===================================================== */

  const resumeName =
    resume?.file
      ?.split("/")
      .pop() ||
    "Resume";


  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

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

              {navigationItems.map(
                (item) => {

                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        router.push(
                          item.path
                        )
                      }
                      title={
                        sidebarCollapsed
                          ? item.label
                          : undefined
                      }
                      className={`flex w-full items-center rounded-lg ${
                        sidebarCollapsed
                          ? "justify-center px-3 py-2.5"
                          : "gap-3 px-3 py-2.5"
                      } ${
                        item.path ===
                        "/employee/resume-analyzer"
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
                }
              )}

            </div>

          </nav>


          {/* USER */}

          <div className="border-t border-[#e8edf4] p-3">

            <div
              className={`flex items-center rounded-xl bg-[#f7f9fc] ${
                sidebarCollapsed
                  ? "justify-center p-2"
                  : "justify-between px-3 py-2.5"
              }`}
            >

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                  <UserCircle size={18} />
                </div>

                {!sidebarCollapsed && (
                  <div>

                    <p className="text-[11px] font-semibold">
                      {user?.name ||
                        "Loading..."}
                    </p>

                    <p className="text-[9px] text-[#8190a6]">
                      {user?.role ||
                        "Loading..."}
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

          </div>


          {/* COLLAPSE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setSidebarCollapsed(
                !sidebarCollapsed
              )
            }
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="absolute -right-3 top-[105px] flex h-7 w-7 items-center justify-center rounded-full border border-[#dfe6ef] bg-white text-[#60728d] shadow-sm hover:text-[#2463eb]"
          >

            {sidebarCollapsed ? (
              <ChevronRight
                size={14}
              />
            ) : (
              <ChevronLeft
                size={14}
              />
            )}

          </button>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <main
          className={`min-h-screen flex-1 transition-all duration-300 ${
            sidebarCollapsed
              ? "ml-[72px]"
              : "ml-[236px]"
          } ${
            copilotOpen
              ? "mr-[360px]"
              : "mr-[46px]"
          }`}
        >

          {/* HEADER */}

          <header className="flex h-[70px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

            <div>

              <h1 className="text-[19px] font-bold">
                Resume Analyzer
              </h1>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Resume analysis results
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/resume-analyzer"
                )
              }
              className="flex items-center gap-2 rounded-lg border border-[#dfe7f1] px-3 py-2 text-[10px] font-semibold text-[#60728d] hover:text-[#2463eb]"
            >

              <ArrowLeft size={13} />

              Back

            </button>

          </header>


          {/* CONTENT */}

          <main className="min-h-[calc(100vh-70px)] overflow-y-auto px-6 py-6">

            {/* RESUME */}

            <section className="mb-5 rounded-xl border border-[#dfe7f1] bg-white p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                  <FileCheck size={20} />
                </div>


                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8190a6]">
                    Resume
                  </p>

                  <h2 className="mt-1 text-[14px] font-bold">
                    {resumeName}
                  </h2>

                  <p className="mt-1 text-[9px] text-[#8190a6]">
                    Analysis completed
                  </p>

                </div>


                <div className="ml-auto flex items-center gap-2 rounded-full bg-[#eaf7f0] px-3 py-1.5 text-[9px] font-semibold text-[#21a366]">

                  <CheckCircle2 size={12} />

                  Analyzed

                </div>

              </div>

            </section>


            {/* ATS SCORE */}

            <section className="mb-5 rounded-xl border border-[#dfe7f1] bg-white p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                  <Target size={18} />
                </div>


                <div>

                  <h2 className="text-[13px] font-bold">
                    ATS Score
                  </h2>

                  <p className="text-[9px] text-[#8190a6]">
                    Resume compatibility with the job description
                  </p>

                </div>

              </div>


              <div className="mt-5 flex items-center gap-5">

                <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-[8px] border-[#edf4ff]">

                  <span className="text-[25px] font-bold text-[#2463eb]">
                    {analysis.ats_score}
                  </span>

                </div>


                <div>

                  <p className="text-[12px] font-semibold">

                    {analysis.ats_score >=
                    80
                      ? "Strong match"
                      : analysis.ats_score >=
                        60
                      ? "Moderate match"
                      : "Needs improvement"}

                  </p>

                  <p className="mt-1 max-w-[500px] text-[10px] leading-relaxed text-[#71829c]">
                    Your score is based on the resume and job description provided during analysis.
                  </p>

                </div>

              </div>

            </section>


            {/* ANALYSIS GRID */}

            <div className="grid grid-cols-2 gap-5">

              <AnalysisCard
                title="Strengths"
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
                items={
                  analysis.strengths
                }
                iconClass="bg-[#eaf7f0] text-[#21a366]"
                itemClass="bg-[#f7fbf9]"
                emptyText="No strengths identified."
              />


              <AnalysisCard
                title="Missing Skills"
                icon={
                  <AlertTriangle
                    size={17}
                  />
                }
                items={
                  analysis.missing_skills
                }
                iconClass="bg-[#fff1df] text-[#c48635]"
                itemClass="bg-[#fffaf4]"
                emptyText="No major missing skills identified."
              />


              <AnalysisCard
                title="Weaknesses"
                icon={
                  <FileSearch
                    size={17}
                  />
                }
                items={
                  analysis.weaknesses
                }
                iconClass="bg-[#ffecec] text-[#c65b5b]"
                itemClass="bg-[#fff8f8]"
                emptyText="No major weaknesses identified."
              />


              <AnalysisCard
                title="Suggestions"
                icon={
                  <Lightbulb
                    size={17}
                  />
                }
                items={
                  analysis.suggestions
                }
                iconClass="bg-[#edf4ff] text-[#2463eb]"
                itemClass="bg-[#f5f8ff]"
                emptyText="No suggestions available."
              />

            </div>


            {/* SAVED MESSAGE */}

            <div className="mt-5 flex justify-center">

              <div className="flex items-center gap-2 rounded-lg border border-[#dfe7f1] bg-white px-4 py-2.5 text-[10px] text-[#71829c]">

                <Bot
                  size={14}
                  className="text-[#2463eb]"
                />

                This analysis is saved in your account.

              </div>

            </div>

          </main>

        </main>


        {/* =================================================
            COPILOT
        ================================================= */}

        <CopilotPanel
          isOpen={copilotOpen}
          onOpen={() =>
            setCopilotOpen(true)
          }
          onClose={() =>
            setCopilotOpen(false)
          }
          resumeId={resumeId}
        />

      </div>

    </div>
  );
}


/* =========================================================
   ANALYSIS CARD
========================================================= */

function AnalysisCard({
  title,
  icon,
  items,
  iconClass,
  itemClass,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  iconClass: string;
  itemClass: string;
  emptyText: string;
}) {
  return (
    <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <h2 className="text-[13px] font-bold">
          {title}
        </h2>

      </div>


      <div className="mt-4 space-y-2">

        {items.length > 0 ? (

          items.map(
            (item, index) => (

              <div
                key={index}
                className={`rounded-lg px-3 py-2.5 text-[10px] leading-relaxed text-[#52647d] ${itemClass}`}
              >
                {item}
              </div>

            )
          )

        ) : (

          <div className="rounded-lg bg-[#f7f9fc] px-3 py-2.5 text-[10px] text-[#71829c]">
            {emptyText}
          </div>

        )}

      </div>

    </section>
  );
}