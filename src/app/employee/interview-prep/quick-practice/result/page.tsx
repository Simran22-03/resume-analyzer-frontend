"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Loader2,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import { api } from "@/lib/api";

type QuestionResult = {
  id: number | string;
  question_number: number;
  category?: string;
  question_text: string;
  answer?: string;
  score?: number | null;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  is_attempted?: boolean;
  attempted_at?: string | null;
};

type InterviewResult = {
  session_id: number | string;
  interview_type: string;
  custom_interview_type?: string | null;
  target_role: string;
  experience_level: string;
  experience_duration?: string | null;
  status: string;
  total_questions: number;
  attempted_questions: number;
  overall_score: number;
  readiness_score: number;
  strengths: string[];
  improvements: string[];
  questions: QuestionResult[];
};

type ResultResponse = {
  success?: boolean;
  message?: string;
  result?: InterviewResult;
};

export default function InterviewResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] =
    useState<InterviewResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expandedQuestion, setExpandedQuestion] =
    useState<number | string | null>(null);

  /*
   * ==========================================================
   * LOAD RESULT
   * ==========================================================
   */

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Support BOTH parameter formats:
         *
         * ?sessionId=123
         * ?session_id=123
         *
         * This prevents breaking the existing interview flow.
         */

        const sessionId =
          searchParams.get("sessionId") ||
          searchParams.get("session_id");

        if (!sessionId) {
          throw new Error(
            "Interview session was not found."
          );
        }

        const response =
          await api.get<ResultResponse>(
            `/interview-prep/${sessionId}/result/`
          );

        if (
          !response.data?.success ||
          !response.data?.result
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to load interview result."
          );
        }

        setResult(
          response.data.result
        );
      } catch (err: any) {
        console.error(
          "Failed to load interview result:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.detail ||
            err?.message ||
            "Unable to load interview result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [searchParams]);

  /*
   * ==========================================================
   * SCORE HELPERS
   * ==========================================================
   */

  const scoreLabel = useMemo(() => {
    if (!result) return "";

    const score =
      Number(result.overall_score) || 0;

    if (score >= 80) {
      return "Strong Performance";
    }

    if (score >= 60) {
      return "Good Performance";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Keep Practicing";
  }, [result]);

  const scorePercentage = useMemo(() => {
    if (!result) return 0;

    return Math.max(
      0,
      Math.min(
        100,
        Number(result.overall_score) || 0
      )
    );
  }, [result]);

  /*
   * ==========================================================
   * QUESTION TOGGLE
   * ==========================================================
   */

  const toggleQuestion = (
    questionId: number | string
  ) => {
    setExpandedQuestion((previous) =>
      previous === questionId
        ? null
        : questionId
    );
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-[#f8fafc] text-[#0f172a]">
        <EmployeeSidebar />

        <div
          className="flex h-screen items-center justify-center"
          style={{
            marginLeft:
              "var(--employee-sidebar-width, 236px)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={26}
              className="animate-spin text-[#2563eb]"
            />

            <p className="text-[11px] text-[#64748b]">
              Preparing your interview result...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error || !result) {
    return (
      <div className="h-screen overflow-hidden bg-[#f8fafc] text-[#0f172a]">
        <EmployeeSidebar />

        <div
          className="flex h-screen items-center justify-center px-6"
          style={{
            marginLeft:
              "var(--employee-sidebar-width, 236px)",
          }}
        >
          <div className="w-full max-w-[500px] rounded-xl border border-[#dbe4f0] bg-white p-6 text-center shadow-sm">
            <CircleAlert
              size={28}
              className="mx-auto text-[#ef4444]"
            />

            <h2 className="mt-3 text-[15px] font-semibold text-[#102a56]">
              Unable to Load Result
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-[#64748b]">
              {error ||
                "The interview result could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/interview-prep"
                )
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              <ArrowLeft size={13} />
              Back to Interview Prep
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * RESULT PAGE
   * ==========================================================
   */

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] text-[#0f172a]">
      <EmployeeSidebar />

      <div
        className="flex h-screen flex-col overflow-hidden transition-all duration-300"
        style={{
          marginLeft:
            "var(--employee-sidebar-width, 236px)",
        }}
      >
        <header className="shrink-0 border-b border-[#e2e8f0] bg-white">
          <div className="flex h-[68px] items-center justify-between px-5 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dbe4f0] bg-white text-[#64748b] transition hover:border-[#bfdbfe] hover:bg-[#f8fbff] hover:text-[#2563eb]"
                aria-label="Back to Interview Preparation"
              >
                <ArrowLeft size={15} />
              </button>

              <div>
                <h1 className="text-[18px] font-semibold text-[#102a56]">
                  Interview Result
                </h1>

                <p className="mt-0.5 text-[10px] text-[#64748b]">
                  Review your performance and identify areas to improve.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#dbe4f0] bg-white px-3 py-2">
              <span className="text-[10px] font-medium text-[#475569]">
                {result.target_role}
              </span>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mx-auto w-full max-w-[1100px]">

            <div className="mb-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#2563eb]">
                  Interview Completed
                </span>

                <span className="text-[9px] text-[#94a3b8]">
                  {result.interview_type}
                </span>
              </div>

              <h2 className="text-[17px] font-semibold text-[#102a56]">
                Your Interview Performance
              </h2>

              <p className="mt-1 text-[10px] text-[#64748b]">
                Here is a detailed breakdown of your interview performance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1.9fr]">

              <section className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#64748b]">
                      Overall Score
                    </p>

                    <h3 className="mt-1 text-[13px] font-semibold text-[#102a56]">
                      {scoreLabel}
                    </h3>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4ff]">
                    <Target
                      size={17}
                      className="text-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-5">
                  <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full border-[8px] border-[#e8eef7]">
                    <div
                      className="absolute inset-[-8px] rounded-full border-[8px] border-[#2563eb]"
                      style={{
                        clipPath: `polygon(
                          0 0,
                          100% 0,
                          100% 100%,
                          0 100%
                        )`,
                        transform: `rotate(${
                          scorePercentage * 3.6
                        }deg)`,
                        transformOrigin:
                          "center",
                      }}
                    />

                    <div className="text-center">
                      <p className="text-[24px] font-bold leading-none text-[#102a56]">
                        {Math.round(
                          scorePercentage
                        )}
                      </p>

                      <p className="mt-1 text-[8px] font-medium text-[#94a3b8]">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-[9px] text-[#94a3b8]">
                        Questions
                      </p>

                      <p className="mt-0.5 text-[13px] font-semibold text-[#102a56]">
                        {result.attempted_questions}
                        <span className="font-normal text-[#94a3b8]">
                          {" "}
                          /{" "}
                          {result.total_questions}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-[9px] text-[#94a3b8]">
                        Readiness Score
                      </p>

                      <p className="mt-0.5 text-[13px] font-semibold text-[#102a56]">
                        {Number(
                          result.readiness_score || 0
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff]">
                    <TrendingUp
                      size={16}
                      className="text-[#2563eb]"
                    />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#64748b]">
                      Interview Summary
                    </p>

                    <h3 className="mt-0.5 text-[13px] font-semibold text-[#102a56]">
                      Performance Overview
                    </h3>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] p-3">
                    <p className="text-[8px] text-[#94a3b8]">
                      Interview Type
                    </p>

                    <p className="mt-1 text-[10px] font-semibold capitalize text-[#334155]">
                      {result.interview_type}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] p-3">
                    <p className="text-[8px] text-[#94a3b8]">
                      Experience
                    </p>

                    <p className="mt-1 text-[10px] font-semibold capitalize text-[#334155]">
                      {result.experience_level}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] p-3">
                    <p className="text-[8px] text-[#94a3b8]">
                      Target Role
                    </p>

                    <p className="mt-1 truncate text-[10px] font-semibold text-[#334155]">
                      {result.target_role}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] p-3">
                    <p className="text-[8px] text-[#94a3b8]">
                      Status
                    </p>

                    <p className="mt-1 text-[10px] font-semibold capitalize text-[#334155]">
                      {result.status.replace(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

              <section className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-[#2563eb]"
                  />

                  <h3 className="text-[12px] font-semibold text-[#102a56]">
                    Your Strengths
                  </h3>
                </div>

                {result.strengths?.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {result.strengths.map(
                      (
                        strength,
                        index
                      ) => (
                        <div
                          key={`${strength}-${index}`}
                          className="flex gap-2 rounded-lg bg-[#f8fafc] px-3 py-2.5"
                        >
                          <CheckCircle2
                            size={12}
                            className="mt-0.5 shrink-0 text-[#2563eb]"
                          />

                          <p className="text-[9px] leading-4 text-[#475569]">
                            {strength}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-[9px] text-[#94a3b8]">
                    No strengths were recorded.
                  </p>
                )}
              </section>

              <section className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CircleAlert
                    size={16}
                    className="text-[#f59e0b]"
                  />

                  <h3 className="text-[12px] font-semibold text-[#102a56]">
                    Areas to Improve
                  </h3>
                </div>

                {result.improvements?.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {result.improvements.map(
                      (
                        improvement,
                        index
                      ) => (
                        <div
                          key={`${improvement}-${index}`}
                          className="flex gap-2 rounded-lg bg-[#f8fafc] px-3 py-2.5"
                        >
                          <CircleAlert
                            size={12}
                            className="mt-0.5 shrink-0 text-[#f59e0b]"
                          />

                          <p className="text-[9px] leading-4 text-[#475569]">
                            {improvement}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-[9px] text-[#94a3b8]">
                    No improvement areas were recorded.
                  </p>
                )}
              </section>
            </div>

            <section className="mt-4 rounded-xl border border-[#dbe4f0] bg-white shadow-sm">
              <div className="border-b border-[#eef2f7] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#64748b]">
                      Detailed Review
                    </p>

                    <h3 className="mt-0.5 text-[13px] font-semibold text-[#102a56]">
                      Question Breakdown
                    </h3>
                  </div>

                  <span className="text-[9px] text-[#94a3b8]">
                    {result.questions.length} questions
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#eef2f7]">
                {result.questions.map(
                  (question) => {
                    const isExpanded =
                      expandedQuestion ===
                      question.id;

                    const score =
                      question.score;

                    return (
                      <div
                        key={question.id}
                        className="px-5 py-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleQuestion(
                              question.id
                            )
                          }
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[9px] font-semibold text-[#2563eb]">
                            {question.question_number}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#f1f5f9] px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-[#64748b]">
                                {question.category ||
                                  "General"}
                              </span>

                              {question.is_attempted && (
                                <span className="text-[8px] text-[#94a3b8]">
                                  Answered
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-[10px] font-medium text-[#334155]">
                              {question.question_text}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-[11px] font-semibold text-[#102a56]">
                              {score !==
                                null &&
                              score !==
                                undefined
                                ? Math.round(
                                    Number(
                                      score
                                    )
                                  )
                                : "—"}
                            </span>

                            {isExpanded ? (
                              <ChevronUp
                                size={14}
                                className="text-[#64748b]"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-[#64748b]"
                              />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="ml-10 mt-4 space-y-4 pb-2">

                            <div>
                              <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                Question
                              </p>

                              <p className="text-[10px] leading-5 text-[#334155]">
                                {
                                  question.question_text
                                }
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                Your Answer
                              </p>

                              <div className="rounded-lg border border-[#eef2f7] bg-[#f8fafc] px-3 py-2.5">
                                <p className="whitespace-pre-wrap text-[10px] leading-5 text-[#475569]">
                                  {question.answer ||
                                    "No answer submitted."}
                                </p>
                              </div>
                            </div>

                            {question.feedback && (
                              <div>
                                <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                  AI Feedback
                                </p>

                                <p className="text-[10px] leading-5 text-[#475569]">
                                  {
                                    question.feedback
                                  }
                                </p>
                              </div>
                            )}

                            {question.strengths &&
                              question.strengths.length >
                                0 && (
                                <div>
                                  <p className="mb-2 text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                    Strengths
                                  </p>

                                  <div className="space-y-1.5">
                                    {question.strengths.map(
                                      (
                                        item,
                                        index
                                      ) => (
                                        <div
                                          key={`${item}-${index}`}
                                          className="flex gap-2"
                                        >
                                          <CheckCircle2
                                            size={
                                              11
                                            }
                                            className="mt-0.5 shrink-0 text-[#2563eb]"
                                          />

                                          <p className="text-[9px] leading-4 text-[#475569]">
                                            {item}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {question.improvements &&
                              question.improvements.length >
                                0 && (
                                <div>
                                  <p className="mb-2 text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                    Improvements
                                  </p>

                                  <div className="space-y-1.5">
                                    {question.improvements.map(
                                      (
                                        item,
                                        index
                                      ) => (
                                        <div
                                          key={`${item}-${index}`}
                                          className="flex gap-2"
                                        >
                                          <CircleAlert
                                            size={
                                              11
                                            }
                                            className="mt-0.5 shrink-0 text-[#f59e0b]"
                                          />

                                          <p className="text-[9px] leading-4 text-[#475569]">
                                            {item}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <div className="flex items-center justify-end gap-2 py-5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-[#dbe4f0] bg-white px-4 py-2 text-[10px] font-medium text-[#475569] transition hover:border-[#bfdbfe] hover:text-[#2563eb]"
              >
                <ArrowLeft size={13} />
                Interview Prep
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                <RotateCcw size={13} />
                Start Again
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}