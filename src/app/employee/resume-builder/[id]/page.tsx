"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Code2,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  User,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";
import { api } from "@/lib/api";

type Experience = {
  id: number;
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  responsibilities: string;
};

type Education = {
  id: number;
  degree: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Skill = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  technologies: string;
  project_url: string;
};

type Resume = {
  id: number;
  title: string;
  full_name: string;
  professional_title: string;
  email: string;
  phone: string;
  location: string;
  professional_summary: string;
  created_at: string;
  updated_at: string;
  is_generated: boolean;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
};

export default function ResumeDetailPage() {

  const router = useRouter();

  const params = useParams();

  const id = params?.id;

  const [resume, setResume] =
    useState<Resume | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // TOKEN
  // =========================================================

  const getAccessToken = () => {

    const access =
      localStorage.getItem("access") ||
      localStorage.getItem(
        "access_token"
      );

    if (!access) {
      return null;
    }

    return access.replace(
      /^"|"$/g,
      ""
    );
  };

  // =========================================================
  // LOAD RESUME
  // =========================================================

  useEffect(() => {

    if (!id) {
      return;
    }

    const loadResume =
      async () => {

        try {

          setLoading(true);
          setError("");

          const token =
            getAccessToken();

          if (!token) {

            router.replace(
              "/login"
            );

            return;
          }

          const response = await api.get(
            `/resume-builder/resumes/${id}/`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const data = response.data;

          console.log(
            "Resume detail response:",
            data
          );

          setResume(data);

        } catch (err: any) {

          console.error(
            "Resume detail error:",
            err
          );

          const status =
            err?.response?.status;

          if (
            status === 401 ||
            status === 403
          ) {

            localStorage.removeItem(
              "access"
            );

            localStorage.removeItem(
              "access_token"
            );

            localStorage.removeItem(
              "refresh_token"
            );

            router.replace(
              "/login"
            );

            return;
          }

          if (status === 404) {

            setError(
              "Resume not found."
            );

            return;
          }

          if (status) {

            setError(
              err?.response?.data?.detail ||
                "Unable to load resume."
            );

            return;
          }

          setError(
            "Unable to connect to the server."
          );

        } finally {

          setLoading(false);
        }
      };

    loadResume();

  }, [id, router]);

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (
    value: string
  ) => {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-[#f6f8fc]">

        <EmployeeSidebar />

        <main className="ml-[236px] min-h-screen">

          <div className="flex min-h-screen items-center justify-center">

            <p className="text-[12px] text-[#8190a6]">
              Loading resume...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !resume) {

    return (
      <div className="min-h-screen bg-[#f6f8fc]">

        <EmployeeSidebar />

        <main className="ml-[236px] min-h-screen">

          <div className="flex min-h-screen flex-col items-center justify-center">

            <FileText
              size={40}
              className="mb-3 text-[#9aa8ba]"
            />

            <h2 className="text-[16px] font-semibold text-[#102a56]">
              {error ||
                "Resume not found"}
            </h2>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/resume-builder"
                )
              }
              className="mt-4 rounded-lg bg-[#2463eb] px-4 py-2 text-[11px] font-medium text-white"
            >
              Back to Resume Builder
            </button>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <EmployeeSidebar />

      <main className="ml-[236px] min-h-screen">

        {/* HEADER */}

        <div className="flex h-[74px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/resume-builder"
                )
              }
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#dce5f0] bg-white text-[#60728d] hover:bg-[#f7f9fc] hover:text-[#2463eb]"
            >

              <ArrowLeft
                size={15}
              />

            </button>

            <div>

              <h1 className="text-[18px] font-bold text-[#102a56]">
                {resume.title}
              </h1>

              <p className="mt-1 text-[10px] text-[#6f819d]">
                Resume Preview
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span
              className={`rounded-full px-2 py-1 text-[8px] font-semibold ${
                resume.is_generated
                  ? "bg-[#e9f8f1] text-[#15945d]"
                  : "bg-[#fff7e8] text-[#c47a00]"
              }`}
            >
              {resume.is_generated
                ? "Generated"
                : "Draft"}
            </span>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/resume-builder/create"
                )
              }
              className="flex h-[36px] items-center gap-1.5 rounded-lg border border-[#dce5f0] bg-white px-4 text-[11px] font-medium text-[#60728d] hover:bg-[#f7f9fc]"
            >
              <FileText
                size={13}
              />

              Create New
            </button>

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-6">

          <div className="mx-auto max-w-[850px]">

            {/* RESUME CARD */}

            <div className="rounded-xl border border-[#dfe7f1] bg-white p-10 shadow-[0_2px_8px_rgba(15,35,70,0.06)]">

              {/* PERSONAL */}

              <div className="border-b border-[#e5ebf3] pb-6">

                <h1 className="text-[30px] font-bold text-[#102a56]">
                  {resume.full_name ||
                    "Your Name"}
                </h1>

                <p className="mt-1 text-[14px] font-medium text-[#2463eb]">
                  {resume.professional_title ||
                    "Professional Title"}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#60728d]">

                  {resume.email && (
                    <span>
                      {resume.email}
                    </span>
                  )}

                  {resume.phone && (
                    <span>
                      {resume.phone}
                    </span>
                  )}

                  {resume.location && (
                    <span>
                      {resume.location}
                    </span>
                  )}

                </div>

              </div>

              {/* SUMMARY */}

              <ResumeSection
                icon={
                  <FileText
                    size={14}
                  />
                }
                title="PROFESSIONAL SUMMARY"
              >

                <p className="whitespace-pre-line text-[10px] leading-[1.7] text-[#52657f]">
                  {resume.professional_summary ||
                    "No professional summary added."}
                </p>

              </ResumeSection>

              {/* EXPERIENCE */}

              <ResumeSection
                icon={
                  <Briefcase
                    size={14}
                  />
                }
                title="WORK EXPERIENCE"
              >

                {resume.experiences
                  ?.length > 0 ? (

                  <div className="space-y-5">

                    {resume.experiences.map(
                      (experience) => (

                        <div
                          key={
                            experience.id
                          }
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <h4 className="text-[11px] font-bold text-[#102a56]">
                                {
                                  experience.job_title
                                }
                              </h4>

                              <p className="mt-0.5 text-[10px] font-medium text-[#2463eb]">
                                {
                                  experience.company_name
                                }
                              </p>

                            </div>

                            <p className="text-right text-[9px] text-[#8190a6]">

                              {experience.start_date}

                              {experience.start_date &&
                                (experience.end_date ||
                                  experience.currently_working) &&
                                " - "}

                              {experience.currently_working
                                ? "Present"
                                : experience.end_date}

                            </p>

                          </div>

                          {experience.location && (

                            <p className="mt-1 text-[9px] text-[#8190a6]">
                              {
                                experience.location
                              }
                            </p>

                          )}

                          {experience.responsibilities && (

                            <p className="mt-2 whitespace-pre-line text-[9px] leading-[1.6] text-[#52657f]">
                              {
                                experience.responsibilities
                              }
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="text-[9px] italic text-[#8190a6]">
                    No work experience added.
                  </p>

                )}

              </ResumeSection>

              {/* EDUCATION */}

              <ResumeSection
                icon={
                  <GraduationCap
                    size={14}
                  />
                }
                title="EDUCATION"
              >

                {resume.education
                  ?.length > 0 ? (

                  <div className="space-y-4">

                    {resume.education.map(
                      (item) => (

                        <div
                          key={
                            item.id
                          }
                        >

                          <div className="flex items-start justify-between">

                            <div>

                              <h4 className="text-[11px] font-bold text-[#102a56]">
                                {
                                  item.degree
                                }
                              </h4>

                              <p className="mt-0.5 text-[10px] text-[#60728d]">
                                {
                                  item.institution
                                }
                              </p>

                            </div>

                            <p className="text-[9px] text-[#8190a6]">

                              {item.start_date}

                              {item.start_date &&
                                item.end_date &&
                                " - "}

                              {item.end_date}

                            </p>

                          </div>

                          {item.location && (

                            <p className="mt-1 text-[9px] text-[#8190a6]">
                              {
                                item.location
                              }
                            </p>

                          )}

                          {item.description && (

                            <p className="mt-1 text-[9px] leading-[1.5] text-[#52657f]">
                              {
                                item.description
                              }
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="text-[9px] italic text-[#8190a6]">
                    No education details added.
                  </p>

                )}

              </ResumeSection>

              {/* SKILLS */}

              <ResumeSection
                icon={
                  <Code2
                    size={14}
                  />
                }
                title="SKILLS"
              >

                {resume.skills
                  ?.length > 0 ? (

                  <div className="flex flex-wrap gap-2">

                    {resume.skills.map(
                      (skill) => (

                        <span
                          key={
                            skill.id
                          }
                          className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[9px] font-medium text-[#2463eb]"
                        >
                          {skill.name}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <p className="text-[9px] italic text-[#8190a6]">
                    No skills added.
                  </p>

                )}

              </ResumeSection>

              {/* PROJECTS */}

              <ResumeSection
                icon={
                  <FolderKanban
                    size={14}
                  />
                }
                title="PROJECTS"
              >

                {resume.projects
                  ?.length > 0 ? (

                  <div className="space-y-5">

                    {resume.projects.map(
                      (project) => (

                        <div
                          key={
                            project.id
                          }
                        >

                          <h4 className="text-[11px] font-bold text-[#102a56]">
                            {
                              project.name
                            }
                          </h4>

                          {project.technologies && (

                            <p className="mt-0.5 text-[9px] font-medium text-[#2463eb]">
                              {
                                project.technologies
                              }
                            </p>

                          )}

                          {project.description && (

                            <p className="mt-1.5 whitespace-pre-line text-[9px] leading-[1.6] text-[#52657f]">
                              {
                                project.description
                              }
                            </p>

                          )}

                          {project.project_url && (

                            <p className="mt-1 text-[9px] text-[#60728d]">
                              {
                                project.project_url
                              }
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <p className="text-[9px] italic text-[#8190a6]">
                    No projects added.
                  </p>

                )}

              </ResumeSection>

              {/* FOOTER */}

              <div className="mt-8 border-t border-[#e5ebf3] pt-4 text-center">

                <p className="text-[8px] italic text-[#9aa8ba]">
                  Created with AI Resume Analyzer
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

// =========================================================
// RESUME SECTION
// =========================================================

function ResumeSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">

      <div className="mb-3 flex items-center gap-2 border-b border-[#e5ebf3] pb-2">

        <span className="text-[#2463eb]">
          {icon}
        </span>

        <h2 className="text-[10px] font-bold tracking-[0.08em] text-[#2463eb]">
          {title}
        </h2>

      </div>

      {children}

    </section>
  );
}