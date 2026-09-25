"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";
import {
  getInterviewSession,
  submitInterviewAnswer,
  type InterviewQuestion,
  type InterviewSession,
} from "@/lib/api";

export default function InterviewQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* =========================================================
     SESSION ID
  ========================================================= */

  const sessionId = searchParams.get("sessionId");

  /* =========================================================
     STATE
  ========================================================= */

  const [session, setSession] =
    useState<InterviewSession | null>(null);

  const [questions, setQuestions] =
    useState<InterviewQuestion[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [feedback, setFeedback] =
    useState("");

  const [score, setScore] =
    useState<number | null>(null);

  const [strengths, setStrengths] =
    useState<string[]>([]);

  const [improvements, setImprovements] =
    useState<string[]>([]);

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const currentQuestion =
    questions[currentIndex];

  /* =========================================================
     PROGRESS
  ========================================================= */

  const progress = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    return Math.round(
      ((currentIndex + 1) /
        questions.length) *
        100
    );
  }, [currentIndex, questions.length]);

  /* =========================================================
     LOAD INTERVIEW
  ========================================================= */

  useEffect(() => {
    if (!sessionId) {
      setError(
        "Interview session ID is missing."
      );

      setLoading(false);

      return;
    }

    const loadInterview = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getInterviewSession(
            sessionId
          );

        console.log(
          "INTERVIEW SESSION:",
          response
        );

        setSession(response);

        const generatedQuestions =
          response?.questions || [];

        if (
          !generatedQuestions.length
        ) {
          setError(
            "The interview session was created, but no questions were returned."
          );

          return;
        }

        setQuestions(
          generatedQuestions
        );

        /* -----------------------------------------------------
           Resume from backend current question
        ----------------------------------------------------- */

        const backendQuestion =
          Number(
            response.current_question || 1
          );

        const initialIndex =
          Math.max(
            0,
            Math.min(
              generatedQuestions.length - 1,
              backendQuestion - 1
            )
          );

        setCurrentIndex(
          initialIndex
        );

        /* -----------------------------------------------------
           Restore existing answer
        ----------------------------------------------------- */

        const existingQuestion =
          generatedQuestions[
            initialIndex
          ];

        resetQuestionState(
          existingQuestion
        );

      } catch (err: any) {
        console.error(
          "FAILED TO LOAD INTERVIEW:",
          err
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load the interview.";

        setError(message);

      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [sessionId]);

  /* =========================================================
     RESET QUESTION STATE
  ========================================================= */

  const resetQuestionState = (
    question: InterviewQuestion
  ) => {
    setAnswer(
      question?.answer || ""
    );

    if (question?.is_attempted) {
      setSubmitted(true);

      setScore(
        question.score ??
          null
      );

      setFeedback(
        question.feedback ||
          ""
      );

      setStrengths(
        Array.isArray(
          question.strengths
        )
          ? question.strengths
          : []
      );

      setImprovements(
        Array.isArray(
          question.improvements
        )
          ? question.improvements
          : []
      );
    } else {
      setSubmitted(false);
      setScore(null);
      setFeedback("");
      setStrengths([]);
      setImprovements([]);
    }
  };

  /* =========================================================
     SUBMIT ANSWER
  ========================================================= */

  const handleSubmitAnswer =
    async () => {
      if (!sessionId) {
        setError(
          "Interview session ID is missing."
        );

        return;
      }

      if (!currentQuestion) {
        setError(
          "Current question is not available."
        );

        return;
      }

      if (!currentQuestion.id) {
        setError(
          "Question ID is missing. Please reload the interview."
        );

        console.error(
          "QUESTION WITHOUT ID:",
          currentQuestion
        );

        return;
      }

      if (!answer.trim()) {
        setError(
          "Please enter your answer before submitting."
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        console.log(
          "SUBMITTING ANSWER:",
          {
            sessionId,
            questionId:
              currentQuestion.id,
            questionNumber:
              currentQuestion.question_number,
            answer:
              answer.trim(),
          }
        );

        /*
         * IMPORTANT
         *
         * Backend API expects question_id.
         *
         * DO NOT send question_number here.
         */

        const response =
          await submitInterviewAnswer(
            sessionId,
            {
              question_id:
                currentQuestion.id,

              answer:
                answer.trim(),
            }
          );

        console.log(
          "ANSWER SUBMISSION RESPONSE:",
          response
        );

        /* =====================================================
           EXTRACT EVALUATION
        ===================================================== */

        const result =
          response?.result ||
          response?.evaluation ||
          response?.data?.result ||
          response?.data?.evaluation ||
          response?.data ||
          response;

        console.log(
          "EXTRACTED EVALUATION:",
          result
        );

        /* =====================================================
           SCORE
        ===================================================== */

        const returnedScore =
          result?.score ??
          result?.evaluation_score ??
          result?.overall_score;

        const numericScore =
          returnedScore !== undefined &&
          returnedScore !== null &&
          returnedScore !== ""
            ? Number(returnedScore)
            : null;

        /* =====================================================
           FEEDBACK
        ===================================================== */

        const returnedFeedback =
          result?.feedback ??
          result?.overall_feedback ??
          result?.evaluation_feedback ??
          "";

        /* =====================================================
           STRENGTHS
        ===================================================== */

        const returnedStrengths =
          result?.strengths ??
          result?.key_strengths ??
          [];

        /* =====================================================
           IMPROVEMENTS
        ===================================================== */

        const returnedImprovements =
          result?.improvements ??
          result?.areas_to_improve ??
          result?.weaknesses ??
          [];

        const safeStrengths =
          Array.isArray(
            returnedStrengths
          )
            ? returnedStrengths
            : [];

        const safeImprovements =
          Array.isArray(
            returnedImprovements
          )
            ? returnedImprovements
            : [];

        /* =====================================================
           UPDATE UI
        ===================================================== */

        setScore(
          numericScore
        );

        setFeedback(
          String(
            returnedFeedback || ""
          )
        );

        setStrengths(
          safeStrengths
        );

        setImprovements(
          safeImprovements
        );

        setSubmitted(true);

        /* =====================================================
           UPDATE LOCAL QUESTION
        ===================================================== */

        setQuestions(
          (previous) =>
            previous.map(
              (question) =>
                question.id ===
                currentQuestion.id
                  ? {
                      ...question,

                      answer:
                        answer.trim(),

                      score:
                        numericScore ??
                        question.score,

                      feedback:
                        String(
                          returnedFeedback ||
                            question.feedback ||
                            ""
                        ),

                      strengths:
                        safeStrengths.length >
                        0
                          ? safeStrengths
                          : question.strengths ||
                            [],

                      improvements:
                        safeImprovements.length >
                        0
                          ? safeImprovements
                          : question.improvements ||
                            [],

                      is_attempted:
                        true,
                    }
                  : question
            )
        );

        console.log(
          "ANSWER DISPLAYED SUCCESSFULLY"
        );

      } catch (err: any) {
        console.error(
          "FAILED TO SUBMIT ANSWER:",
          err
        );

        console.error(
          "BACKEND RESPONSE:",
          err?.response?.data
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to evaluate your answer.";

        setError(message);

      } finally {
        setSubmitting(false);
      }
    };

  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const handleNext =
    () => {
      if (
        currentIndex >=
        questions.length - 1
      ) {
        router.push(
          `/employee/interview-prep/result?sessionId=${encodeURIComponent(
            String(sessionId)
          )}`
        );

        return;
      }

      const nextIndex =
        currentIndex + 1;

      const nextQuestion =
        questions[nextIndex];

      setCurrentIndex(
        nextIndex
      );

      resetQuestionState(
        nextQuestion
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  /* =========================================================
     PREVIOUS QUESTION
  ========================================================= */

  const handlePrevious =
    () => {
      if (currentIndex <= 0) {
        return;
      }

      const previousIndex =
        currentIndex - 1;

      const previousQuestion =
        questions[
          previousIndex
        ];

      setCurrentIndex(
        previousIndex
      );

      resetQuestionState(
        previousQuestion
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

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
                Loading your interview...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR / NO QUESTIONS
  ========================================================= */

  if (
    error &&
    !currentQuestion
  ) {
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
                  Interview Preparation
                </h1>

                <p className="text-[10px] text-[#64748b]">
                  Interview session
                </p>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-7">
            <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <h2 className="text-[14px] font-semibold text-[#102a56]">
                    Unable to load interview
                  </h2>

                  <p className="mt-1 text-[11px] text-red-600">
                    {error}
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
     MAIN UI
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
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white">
          <div className="flex min-h-[76px] items-center justify-between px-5 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                aria-label="Back"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#2563eb]"
              >
                <ArrowLeft
                  size={17}
                />
              </button>

              <div>
                <h1 className="text-[18px] font-semibold leading-tight text-[#102a56]">
                  Interview Preparation
                </h1>

                <p className="mt-0.5 text-[10px] text-[#64748b]">
                  Complete your AI-powered interview.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-3 py-2 sm:flex">
              <Clock3
                size={14}
                className="text-[#2563eb]"
              />

              <span className="text-[10px] font-medium text-[#475569]">
                {questions.length} Questions
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <main className="w-full px-4 pb-8 pt-5 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">

            {/* PROGRESS */}

            <section className="mb-4 rounded-xl border border-[#dbe4f0] bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-[#64748b]">
                    Interview Progress
                  </p>

                  <p className="mt-1 text-[15px] font-semibold text-[#102a56]">
                    Question{" "}
                    {currentIndex + 1}{" "}
                    <span className="font-normal text-[#94a3b8]">
                      / {questions.length}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[12px] font-semibold text-[#2563eb]">
                    {progress}%
                  </p>

                  <p className="text-[9px] text-[#94a3b8]">
                    Completed
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eaf0f7]">
                <div
                  className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </section>

            {/* QUESTION CARD */}

            <section className="overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">

              {/* CARD HEADER */}

              <div className="border-b border-[#edf1f5] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff]">
                      <Sparkles
                        size={16}
                        className="text-[#2563eb]"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                        {currentQuestion?.category ||
                          "Interview Question"}
                      </p>

                      <p className="text-[11px] font-semibold text-[#102a56]">
                        AI Interviewer
                      </p>
                    </div>
                  </div>

                  {currentQuestion?.is_attempted && (
                    <div className="flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-2.5 py-1">
                      <CheckCircle2
                        size={12}
                        className="text-[#16a34a]"
                      />

                      <span className="text-[9px] font-medium text-[#15803d]">
                        Answered
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* QUESTION */}

              <div className="px-5 py-5">
                <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <p className="text-[14px] font-medium leading-6 text-[#102a56]">
                    {currentQuestion?.question_text}
                  </p>
                </div>

                {/* ANSWER */}

                <div className="mt-5">
                  <label
                    htmlFor="answer"
                    className="mb-2 block text-[10px] font-semibold text-[#102a56]"
                  >
                    Your Answer
                  </label>

                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) =>
                      setAnswer(
                        e.target.value
                      )
                    }
                    disabled={submitted}
                    placeholder="Type your answer here..."
                    className="min-h-[180px] w-full resize-y rounded-lg border border-[#dbe4f0] bg-white px-4 py-3 text-[11px] leading-5 text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 disabled:bg-[#f8fafc] disabled:text-[#64748b]"
                  />

                  <div className="mt-2 flex justify-between">
                    <span className="text-[9px] text-[#94a3b8]">
                      Explain your answer clearly and
                      provide examples where relevant.
                    </span>

                    <span className="text-[9px] text-[#94a3b8]">
                      {answer.length} characters
                    </span>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
                    <AlertCircle
                      size={14}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-[10px] leading-4 text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* =================================================
                    AI EVALUATION
                ================================================== */}

                {submitted && (
                  <div className="mt-5 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-4">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4ff]">
                          <Sparkles
                            size={15}
                            className="text-[#2563eb]"
                          />
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-[#102a56]">
                            AI Evaluation
                          </p>

                          <p className="text-[9px] text-[#94a3b8]">
                            Feedback on your answer
                          </p>
                        </div>
                      </div>

                      {score !== null && (
                        <div className="text-right">
                          <p className="text-[18px] font-semibold text-[#2563eb]">
                            {score}
                            <span className="text-[10px] text-[#94a3b8]">
                              /100
                            </span>
                          </p>

                          <p className="text-[8px] text-[#94a3b8]">
                            Score
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FEEDBACK */}

                    {feedback ? (
                      <div className="mt-4">
                        <p className="mb-1 text-[10px] font-semibold text-[#102a56]">
                          Feedback
                        </p>

                        <p className="whitespace-pre-wrap text-[10px] leading-5 text-[#475569]">
                          {feedback}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-[10px] text-[#64748b]">
                          Your answer has been submitted successfully.
                        </p>
                      </div>
                    )}

                    {/* STRENGTHS */}

                    {strengths.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-semibold text-[#15803d]">
                          Strengths
                        </p>

                        <div className="space-y-1.5">
                          {strengths.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={index}
                                className="flex gap-2"
                              >
                                <CheckCircle2
                                  size={13}
                                  className="mt-0.5 shrink-0 text-[#16a34a]"
                                />

                                <p className="text-[10px] leading-4 text-[#475569]">
                                  {item}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* IMPROVEMENTS */}

                    {improvements.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-semibold text-[#b45309]">
                          Areas to Improve
                        </p>

                        <div className="space-y-1.5">
                          {improvements.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={index}
                                className="flex gap-2"
                              >
                                <ArrowRight
                                  size={13}
                                  className="mt-0.5 shrink-0 text-[#f59e0b]"
                                />

                                <p className="text-[10px] leading-4 text-[#475569]">
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

              {/* FOOTER */}

              <div className="flex items-center justify-between border-t border-[#edf1f5] px-5 py-4">

                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    currentIndex === 0 ||
                    submitting
                  }
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#dbe4f0] bg-white px-4 text-[10px] font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft
                    size={13}
                  />

                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {!submitted ? (
                    <button
                      type="button"
                      onClick={
                        handleSubmitAnswer
                      }
                      disabled={
                        submitting ||
                        !answer.trim()
                      }
                      className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-[10px] font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />

                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send
                            size={13}
                          />

                          Submit Answer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        handleNext
                      }
                      className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-4 text-[10px] font-medium text-white shadow-sm transition hover:bg-[#1d4ed8]"
                    >
                      {currentIndex ===
                      questions.length - 1
                        ? "Finish Interview"
                        : "Next Question"}

                      <ArrowRight
                        size={13}
                      />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* SESSION INFO */}

            {session && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-[9px] text-[#94a3b8]">
                  {session.target_role}
                  {" • "}
                  {session.interview_type}
                  {" • "}
                  {session.experience_level}
                </p>

                <p className="text-[9px] text-[#94a3b8]">
                  Session #{session.id}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}