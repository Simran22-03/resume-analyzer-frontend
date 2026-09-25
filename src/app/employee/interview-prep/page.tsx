"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  Code2,
  Users,
  Brain,
} from "lucide-react";
import EmployeeSidebar from "@/components/EmployeeSidebar";

type PracticeType = "technical" | "hr" | "behavioral";

export default function InterviewPrepPage() {
  const router = useRouter();

  const [quickPracticeOpen, setQuickPracticeOpen] =
    useState(false);

  const [practiceType, setPracticeType] =
    useState<PracticeType>("technical");

  const [technicalTopic, setTechnicalTopic] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState("");

  const handleInterviewPrep = () => {
    router.push("/employee/interview-prep/interview");
  };

  const handleQuickPracticeToggle = () => {
    setQuickPracticeOpen((prev) => !prev);
  };

  const handlePracticeTypeChange = (
    value: PracticeType
  ) => {
    setPracticeType(value);

    if (value !== "technical") {
      setTechnicalTopic("");
    }
  };

  const handleStartPractice = () => {
    /*
     * ---------------------------------------------------------
     * QUICK PRACTICE VALIDATION
     *
     * UI is unchanged.
     * We only make sure the selected values are available
     * to the practice page.
     * ---------------------------------------------------------
     */

    if (!difficulty) {
      return;
    }

    if (!questionCount) {
      return;
    }

    if (
      practiceType === "technical" &&
      !technicalTopic
    ) {
      return;
    }

    /*
     * ---------------------------------------------------------
     * TECHNICAL PRACTICE
     * ---------------------------------------------------------
     */

    if (practiceType === "technical") {
      const params = new URLSearchParams();

      params.set(
        "practice_type",
        practiceType
      );

      params.set(
        "topic",
        technicalTopic
      );

      params.set(
        "difficulty",
        difficulty
      );

      params.set(
        "question_count",
        questionCount
      );

      router.push(
        `/employee/interview-prep/quick-practice/technical?${params.toString()}`
      );

      return;
    }

    /*
     * ---------------------------------------------------------
     * HR PRACTICE
     * ---------------------------------------------------------
     */

    if (practiceType === "hr") {
      const params = new URLSearchParams();

      params.set(
        "practice_type",
        practiceType
      );

      params.set(
        "difficulty",
        difficulty
      );

      params.set(
        "question_count",
        questionCount
      );

      router.push(
        `/employee/interview-prep/quick-practice/hr?${params.toString()}`
      );

      return;
    }

    /*
     * ---------------------------------------------------------
     * BEHAVIORAL PRACTICE
     * ---------------------------------------------------------
     */

    if (practiceType === "behavioral") {
      const params = new URLSearchParams();

      params.set(
        "practice_type",
        practiceType
      );

      params.set(
        "difficulty",
        difficulty
      );

      params.set(
        "question_count",
        questionCount
      );

      router.push(
        `/employee/interview-prep/quick-practice/behavioral?${params.toString()}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <EmployeeSidebar />

      <div
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft:
            "var(--employee-sidebar-width, 236px)",
        }}
      >
        {/* =====================================================
            TOP BAR
        ====================================================== */}

        <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white">
          <div className="flex min-h-[68px] items-center justify-between px-5 sm:px-7">
            <div>
              <h1 className="text-[18px] font-semibold text-[#102a56]">
                Interview Preparation
              </h1>

              <p className="mt-0.5 text-[10px] text-[#64748b]">
                Prepare smarter for your next interview.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-3 py-2 sm:flex">
              <FileText
                size={14}
                className="text-[#2563eb]"
              />

              <span className="text-[10px] font-medium text-[#475569]">
                Interview Preparation
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <main className="mx-auto w-full max-w-[1280px] px-4 py-2 sm:px-5">
          <div className="space-y-1.5">

            {/* =================================================
                FULL INTERVIEW
            ================================================== */}

            <button
              type="button"
              onClick={handleInterviewPrep}
              className="group flex w-full items-center justify-between rounded-xl border border-[#dbe4f0] bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-[#bfdbfe] hover:shadow-md"
            >
              <div className="flex items-center gap-3">

                {/* ICON */}

                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#eef4ff]">
                  <FileText
                    size={24}
                    strokeWidth={1.8}
                    className="text-[#2563eb]"
                  />
                </div>

                {/* CONTENT */}

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#2563eb]">
                      Full Interview
                    </span>

                    <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[8px] font-medium text-[#2563eb]">
                      Standard
                    </span>
                  </div>

                  <h2 className="text-[15px] font-semibold leading-tight text-[#102a56]">
                    Interview Prep
                  </h2>

                  <p className="mt-0.5 text-[10px] leading-4 text-[#64748b]">
                    Practice a complete interview with AI
                    feedback and performance analysis.
                  </p>
                </div>
              </div>

              <ArrowRight
                size={18}
                className="mr-1 shrink-0 text-[#64748b] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#2563eb]"
              />
            </button>

            {/* =================================================
                QUICK PRACTICE
            ================================================== */}

            <section
              className={`rounded-xl border border-[#dbe4f0] bg-white shadow-sm transition ${
                quickPracticeOpen
                  ? "border-[#cbdcf5]"
                  : ""
              }`}
            >

              {/* QUICK PRACTICE HEADER */}

              <button
                type="button"
                onClick={handleQuickPracticeToggle}
                className="group flex w-full items-center justify-between px-4 py-2.5 text-left"
              >
                <div className="flex items-center gap-3">

                  {/* ICON */}

                  <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#eef4ff]">
                    <Zap
                      size={25}
                      strokeWidth={1.8}
                      className="text-[#2563eb]"
                    />
                  </div>

                  {/* CONTENT */}

                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#2563eb]">
                        Focused Drills
                      </span>

                      <span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[8px] font-medium text-[#16a34a]">
                        Recommended
                      </span>
                    </div>

                    <h2 className="text-[15px] font-semibold leading-tight text-[#102a56]">
                      Quick Practice
                    </h2>

                    <p className="mt-0.5 text-[10px] leading-4 text-[#64748b]">
                      Practice specific interview categories
                      like Technical, HR, or Behavioral.
                    </p>
                  </div>
                </div>

                {quickPracticeOpen ? (
                  <ChevronUp
                    size={18}
                    className="mr-1 shrink-0 text-[#64748b]"
                  />
                ) : (
                  <ChevronDown
                    size={18}
                    className="mr-1 shrink-0 text-[#64748b]"
                  />
                )}
              </button>

              {/* =================================================
                  QUICK PRACTICE OPTIONS
              ================================================== */}

              {quickPracticeOpen && (
                <div className="border-t border-[#edf1f5] px-4 pb-2.5 pt-2">

                  {/* FORM GRID */}

                  <div
                    className={`grid gap-3 ${
                      practiceType === "technical"
                        ? "lg:grid-cols-[1fr_1fr_0.85fr_0.85fr_auto]"
                        : "lg:grid-cols-[1fr_0.85fr_0.85fr_auto]"
                    }`}
                  >

                    {/* =================================================
                        PRACTICE TYPE
                    ================================================== */}

                    <div>
                      <label className="mb-1.5 block text-[9px] font-semibold text-[#334155]">
                        Practice Type
                      </label>

                      <div className="relative">
                        <select
                          value={practiceType}
                          onChange={(e) =>
                            handlePracticeTypeChange(
                              e.target.value as PracticeType
                            )
                          }
                          className="h-10 w-full appearance-none rounded-lg border border-[#dbe4f0] bg-white px-3 pr-8 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#dbeafe]"
                        >
                          <option value="technical">
                            Technical
                          </option>

                          <option value="hr">
                            HR
                          </option>

                          <option value="behavioral">
                            Behavioral
                          </option>
                        </select>

                        <ChevronDown
                          size={13}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                        />
                      </div>
                    </div>

                    {/* =================================================
                        TECHNICAL TOPIC
                    ================================================== */}

                    {practiceType === "technical" && (
                      <div>
                        <label className="mb-1.5 block text-[9px] font-semibold text-[#334155]">
                          Technical Topic
                        </label>

                        <div className="relative">
                          <select
                            value={technicalTopic}
                            onChange={(e) =>
                              setTechnicalTopic(
                                e.target.value
                              )
                            }
                            className="h-10 w-full appearance-none rounded-lg border border-[#dbe4f0] bg-white px-3 pr-8 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#dbeafe]"
                          >
                            <option value="">
                              Select topic
                            </option>

                            <option value="data-structures">
                              Data Structures & Algorithms
                            </option>

                            <option value="programming">
                              Programming / Coding
                            </option>

                            <option value="oop">
                              Object-Oriented Programming
                            </option>

                            <option value="dbms">
                              DBMS (Databases)
                            </option>

                            <option value="operating-systems">
                              Operating Systems
                            </option>

                            <option value="computer-networks">
                              Computer Networks
                            </option>

                            <option value="web-development">
                              Web Development
                            </option>

                            <option value="system-design">
                              System Design
                            </option>

                            <option value="cloud-devops">
                              Cloud Computing / DevOps
                            </option>

                            <option value="cyber-security">
                              Cyber Security
                            </option>

                            <option value="ai-ml">
                              AI / Machine Learning
                            </option>

                            <option value="programming-languages">
                              Programming Languages
                            </option>

                            <option value="others">
                              Others
                            </option>
                          </select>

                          <ChevronDown
                            size={13}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                          />
                        </div>
                      </div>
                    )}

                    {/* =================================================
                        DIFFICULTY
                    ================================================== */}

                    <div>
                      <label className="mb-1.5 block text-[9px] font-semibold text-[#334155]">
                        Difficulty Level
                      </label>

                      <div className="relative">
                        <select
                          value={difficulty}
                          onChange={(e) =>
                            setDifficulty(
                              e.target.value
                            )
                          }
                          className="h-10 w-full appearance-none rounded-lg border border-[#dbe4f0] bg-white px-3 pr-8 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#dbeafe]"
                        >
                          <option value="">
                            Select difficulty
                          </option>

                          <option value="easy">
                            Easy
                          </option>

                          <option value="medium">
                            Medium
                          </option>

                          <option value="hard">
                            Hard
                          </option>
                        </select>

                        <ChevronDown
                          size={13}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                        />
                      </div>
                    </div>

                    {/* =================================================
                        NUMBER OF QUESTIONS
                    ================================================== */}

                    <div>
                      <label className="mb-1.5 block text-[9px] font-semibold text-[#334155]">
                        Number of Questions
                      </label>

                      <div className="relative">
                        <select
                          value={questionCount}
                          onChange={(e) =>
                            setQuestionCount(
                              e.target.value
                            )
                          }
                          className="h-10 w-full appearance-none rounded-lg border border-[#dbe4f0] bg-white px-3 pr-8 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-1 focus:ring-[#dbeafe]"
                        >
                          <option value="">
                            Select number
                          </option>

                          <option value="5">
                            5 Questions
                          </option>

                          <option value="10">
                            10 Questions
                          </option>

                          <option value="15">
                            15 Questions
                          </option>

                          <option value="20">
                            20 Questions
                          </option>
                        </select>

                        <ChevronDown
                          size={13}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                        />
                      </div>
                    </div>

                    {/* =================================================
                        START PRACTICE
                    ================================================== */}

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleStartPractice}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8] lg:w-auto"
                      >
                        Start Practice

                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      HELPER TEXT
                  ================================================== */}

                  <div className="mt-1.5 flex items-center gap-2 text-[9px] text-[#94a3b8]">

                    {practiceType === "technical" && (
                      <>
                        <Code2
                          size={11}
                          className="text-[#2563eb]"
                        />

                        <span>
                          Select a technical topic,
                          difficulty, and question count.
                        </span>
                      </>
                    )}

                    {practiceType === "hr" && (
                      <>
                        <Users
                          size={11}
                          className="text-[#2563eb]"
                        />

                        <span>
                          Practice common HR and
                          interview questions.
                        </span>
                      </>
                    )}

                    {practiceType === "behavioral" && (
                      <>
                        <Brain
                          size={11}
                          className="text-[#2563eb]"
                        />

                        <span>
                          Practice real-world behavioral
                          and situational questions.
                        </span>
                      </>
                    )}

                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}