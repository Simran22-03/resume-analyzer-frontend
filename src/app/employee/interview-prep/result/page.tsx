"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";

import {
  getInterviewSession,
  type InterviewSession,
} from "@/lib/api";

export default function InterviewResultPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const sessionId =
    searchParams.get("sessionId");

  const [session, setSession] =
    useState<InterviewSession | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================================
     LOAD RESULT
  ========================================================= */

  useEffect(() => {
    if (!sessionId) {
      setError(
        "Interview session ID is missing."
      );

      setLoading(false);

      return;
    }

    const loadResult =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getInterviewSession(
              sessionId
            );

          setSession(response);
        } catch (err: any) {
          console.error(
            "FAILED TO LOAD INTERVIEW RESULT:",
            err
          );

          const message =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load interview result.";

          setError(message);
        } finally {
          setLoading(false);
        }
      };

    loadResult();
  }, [sessionId]);

  /* =========================================================
     CALCULATE RESULT
  ========================================================= */

  const attemptedQuestions =
    useMemo(() => {
      return (
        session?.questions?.filter(
          (question) =>
            question.is_attempted
        ) || []
      );
    }, [session]);

  const calculatedScore =
    useMemo(() => {
      if (
        !attemptedQuestions.length
      ) {
        return 0;
      }

      const validScores =
        attemptedQuestions
          .map(
            (question) =>
              question.score
          )
          .filter(
            (
              score
            ): score is number =>
              typeof score ===
                "number" &&
              Number.isFinite(
                score
              )
          );

      if (!validScores.length) {
        return 0;
      }

      return Math.round(
        validScores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) / validScores.length
      );
    }, [attemptedQuestions]);

  const readinessScore =
    session?.readiness_score ??
    calculatedScore;

  const totalQuestions =
    session?.total_questions ||
    session?.questions?.length ||
    0;

  const attemptedCount =
    session?.attempted_questions ??
    attemptedQuestions.length;

  const percentage =
    totalQuestions > 0
      ? Math.round(
          (attemptedCount /
            totalQuestions) *
            100
        )
      : 0;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <EmployeeSidebar />

        <div
          className="min-h-screen"
          style={{
            marginLeft:
              "var(--employee-sidebar-width, 236px)",
          }}
        >
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dbe4f0] border-t-[#2563eb]" />

              <p className="text-[12px] font-medium text-[#475569]">
                Preparing your interview result...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
        <EmployeeSidebar />

        <div
          className="min-h-screen"
          style={{
            marginLeft:
              "var(--employee-sidebar-width, 236px)",
          }}
        >
          <header className="border-b border-[#e2e8f0] bg-white">
            <div className="flex min-h-[76px] items-center gap-3 px-5 sm:px-7">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#2563eb]"
              >
                <ArrowLeft
                  size={17}
                />
              </button>

              <div>
                <h1 className="text-[18px] font-semibold text-[#102a56]">
                  Interview Result
                </h1>

                <p className="text-[10px] text-[#64748b]">
                  Interview Preparation
                </p>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-7">
            <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <h2 className="text-[14px] font-semibold text-[#102a56]">
                    Unable to load result
                  </h2>

                  <p className="mt-1 text-[11px] text-red-600">
                    {error ||
                      "Interview result could not be loaded."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="mt-5 flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-[11px] font-medium text-white transition hover:bg-[#1d4ed8]"
              >
                Back to Interview Preparation
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     RESULT UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <EmployeeSidebar />

      <div
        className="min-h-screen"
        style={{
          marginLeft:
            "var(--employee-sidebar-width, 236px)",
        }}
      >
        {/* HEADER */}

        <header className="border-b border-[#e2e8f0] bg-white">
          <div className="flex min-h-[76px] items-center justify-between px-5 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#2563eb]"
              >
                <ArrowLeft
                  size={17}
                />
              </button>

              <div>
                <h1 className="text-[18px] font-semibold leading-tight text-[#102a56]">
                  Interview Result
                </h1>

                <p className="mt-0.5 text-[10px] text-[#64748b]">
                  Your AI-powered interview performance
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-10 pt-6 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">

            {/* =================================================
                SUCCESS HEADER
            ================================================== */}

            <section className="mb-4 overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">
              <div className="flex flex-col items-center px-6 py-8 text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ecfdf5]">
                  <Trophy
                    size={27}
                    className="text-[#16a34a]"
                  />
                </div>

                <h2 className="text-[20px] font-semibold text-[#102a56]">
                  Interview Completed
                </h2>

                <p className="mt-1 max-w-lg text-[11px] leading-5 text-[#64748b]">
                  You have completed your AI-powered
                  interview. Here is your performance
                  summary.
                </p>
              </div>
            </section>

            {/* =================================================
                SCORE CARDS
            ================================================== */}

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  Overall Score
                </p>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-[30px] font-semibold text-[#2563eb]">
                    {readinessScore}
                  </span>

                  <span className="mb-1 text-[11px] text-[#94a3b8]">
                    /100
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  Questions Attempted
                </p>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-[30px] font-semibold text-[#102a56]">
                    {attemptedCount}
                  </span>

                  <span className="mb-1 text-[11px] text-[#94a3b8]">
                    / {totalQuestions}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
                <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  Completion
                </p>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-[30px] font-semibold text-[#16a34a]">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                INTERVIEW DETAILS
            ================================================== */}

            <section className="mb-4 rounded-xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff]">
                  <Sparkles
                    size={15}
                    className="text-[#2563eb]"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#102a56]">
                    Interview Details
                  </p>

                  <p className="text-[9px] text-[#94a3b8]">
                    Session information
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-lg bg-[#f8fafc] p-3">
                  <p className="text-[9px] text-[#94a3b8]">
                    Interview Type
                  </p>

                  <p className="mt-1 text-[11px] font-medium capitalize text-[#102a56]">
                    {session.interview_type}
                  </p>
                </div>

                <div className="rounded-lg bg-[#f8fafc] p-3">
                  <p className="text-[9px] text-[#94a3b8]">
                    Target Role
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-[#102a56]">
                    {session.target_role}
                  </p>
                </div>

                <div className="rounded-lg bg-[#f8fafc] p-3">
                  <p className="text-[9px] text-[#94a3b8]">
                    Experience
                  </p>

                  <p className="mt-1 text-[11px] font-medium capitalize text-[#102a56]">
                    {session.experience_level}
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                QUESTION REVIEW
            ================================================== */}

            <section className="rounded-xl border border-[#dbe4f0] bg-white shadow-sm">
              <div className="border-b border-[#edf1f5] px-5 py-4">
                <p className="text-[12px] font-semibold text-[#102a56]">
                  Question Review
                </p>

                <p className="mt-0.5 text-[9px] text-[#94a3b8]">
                  Review your answers and individual scores.
                </p>
              </div>

              <div className="divide-y divide-[#edf1f5]">
                {session.questions.map(
                  (question) => (
                    <div
                      key={question.id}
                      className="px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[9px] font-semibold text-[#2563eb]">
                            {question.question_number}
                          </div>

                          <div>
                            <p className="text-[11px] font-medium leading-5 text-[#102a56]">
                              {question.question_text}
                            </p>

                            {question.category && (
                              <p className="mt-1 text-[8px] uppercase tracking-wide text-[#94a3b8]">
                                {question.category}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {question.is_attempted ? (
                            <>
                              <p className="text-[16px] font-semibold text-[#2563eb]">
                                {question.score ??
                                  0}
                              </p>

                              <p className="text-[8px] text-[#94a3b8]">
                                /100
                              </p>
                            </>
                          ) : (
                            <span className="text-[9px] text-[#94a3b8]">
                              Not attempted
                            </span>
                          )}
                        </div>
                      </div>

                      {question.feedback && (
                        <div className="mt-3 ml-10 rounded-lg bg-[#f8fafc] p-3">
                          <p className="text-[9px] font-semibold text-[#102a56]">
                            AI Feedback
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-[#64748b]">
                            {question.feedback}
                          </p>
                        </div>
                      )}

                      {question.is_attempted && (
                        <div className="mt-3 ml-10 flex items-center gap-1.5">
                          <CheckCircle2
                            size={12}
                            className="text-[#16a34a]"
                          />

                          <span className="text-[8px] font-medium text-[#15803d]">
                            Answer evaluated
                          </span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="mt-5 flex justify-center gap-2">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex h-9 items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-5 text-[10px] font-medium text-[#475569] transition hover:bg-[#f8fafc]"
              >
                <ArrowLeft
                  size={13}
                />

                Back to Interview Prep
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-5 text-[10px] font-medium text-white transition hover:bg-[#1d4ed8]"
              >
                <Sparkles
                  size={13}
                />

                Start New Interview
              </button>
            </div>

            <p className="mt-4 text-center text-[8px] text-[#94a3b8]">
              Session #{session.id}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}