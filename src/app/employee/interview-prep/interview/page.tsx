"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";

import {
  createInterview,
  getInterviewSession,
  submitInterviewAnswer,
  getInterviewResult,
  type InterviewQuestion,
  type InterviewSession,
} from "@/lib/api";

type InterviewType =
  | "technical"
  | "hr"
  | "behavioral"
  | "mixed"
  | "custom";

type ExperienceLevel =
  | "fresher"
  | "experienced";

type InterviewResult = {
  session_id: number;
  interview_type: string;
  custom_interview_type: string;
  target_role: string;
  experience_level: string;
  experience_duration: string;
  status: string;
  total_questions: number;
  attempted_questions: number;
  overall_score: number;
  readiness_score: number;
  strengths: string[];
  improvements: string[];
  questions: {
    id: number;
    question_number: number;
    category: string;
    question_text: string;
    answer: string;
    score: number | null;
    feedback: string;
    strengths: string[];
    improvements: string[];
    is_attempted: boolean;
    attempted_at: string | null;
  }[];
  created_at: string;
  updated_at: string;
};

export default function InterviewSetupPage() {
  const router = useRouter();

  /* =========================================================
     SETUP STATE
  ========================================================= */

  const [interviewType, setInterviewType] =
    useState<InterviewType>("technical");

  const [technicalQuestionType, setTechnicalQuestionType] =
    useState("");

  const [targetRole, setTargetRole] =
    useState("Software Engineer");

  const [customTargetRole, setCustomTargetRole] =
    useState("");

  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("fresher");

  const [experienceDuration, setExperienceDuration] =
    useState("");

  const [customInterviewType, setCustomInterviewType] =
    useState("");

  /* =========================================================
     GENERAL STATE
  ========================================================= */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     INTERVIEW STATE
  ========================================================= */

  const [interviewStarted, setInterviewStarted] =
    useState(false);

  const [sessionId, setSessionId] =
    useState<number | null>(null);

  const [session, setSession] =
    useState<InterviewSession | null>(null);

  const [questions, setQuestions] =
    useState<InterviewQuestion[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [answerLoading, setAnswerLoading] =
    useState(false);

  const [questionLoading, setQuestionLoading] =
    useState(false);

  const [interviewCompleted, setInterviewCompleted] =
    useState(false);

  /* =========================================================
     RESULT STATE
  ========================================================= */

  const [result, setResult] =
    useState<InterviewResult | null>(null);

  const [resultLoading, setResultLoading] =
    useState(false);

  /* =========================================================
     FETCH FINAL RESULT
  ========================================================= */

  const loadInterviewResult = async (
    id: number
  ) => {
    try {
      setResultLoading(true);
      setError("");

      console.log(
        "FETCHING INTERVIEW RESULT:",
        id
      );

      const response =
        await getInterviewResult(id);

      console.log(
        "INTERVIEW RESULT RESPONSE:",
        response
      );

      /*
       * Supports both:
       *
       * {
       *   success: true,
       *   result: {...}
       * }
       *
       * and
       *
       * {
       *   data: {
       *      result: {...}
       *   }
       * }
       */

      const finalResult =
        (response as any)?.result ??
        (response as any)?.data?.result ??
        response;

      if (!finalResult) {
        throw new Error(
          "Interview result was not returned by the server."
        );
      }

      setResult(
        finalResult as InterviewResult
      );

    } catch (err: any) {
      console.error(
        "FAILED TO LOAD INTERVIEW RESULT:",
        err
      );

      console.error(
        "RESULT ERROR RESPONSE:",
        err?.response?.data
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to load interview result.";

      setError(message);

    } finally {
      setResultLoading(false);
    }
  };

  /* =========================================================
     START INTERVIEW
  ========================================================= */

  const handleStartInterview = async () => {
    setError("");

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (
      interviewType === "technical" &&
      !technicalQuestionType
    ) {
      setError(
        "Please select the type of technical questions you want to practice."
      );
      return;
    }

    if (
      interviewType === "custom" &&
      !customInterviewType.trim()
    ) {
      setError(
        "Please enter a custom interview type."
      );
      return;
    }

    if (
      targetRole === "Others" &&
      !customTargetRole.trim()
    ) {
      setError(
        "Please enter your target role."
      );
      return;
    }

    if (
      experienceLevel === "experienced" &&
      !experienceDuration.trim()
    ) {
      setError(
        "Please enter your experience duration."
      );
      return;
    }

    try {
      setLoading(true);

      /* -------------------------------------------------------
         FINAL TARGET ROLE
      ------------------------------------------------------- */

      const finalTargetRole =
        targetRole === "Others"
          ? customTargetRole.trim()
          : targetRole;

      /* -------------------------------------------------------
         CREATE INTERVIEW
      ------------------------------------------------------- */

      const response =
        await createInterview({
          interview_type:
            interviewType,

          custom_interview_type:
            interviewType === "custom"
              ? customInterviewType.trim()
              : "",

          target_role:
            finalTargetRole,

          experience_level:
            experienceLevel,

          experience_duration:
            experienceLevel === "experienced"
              ? experienceDuration.trim()
              : "",

          technical_topic:
            interviewType === "technical"
              ? technicalQuestionType
              : "",
        });

      console.log(
        "CREATE INTERVIEW RESPONSE:",
        response
      );

      /* -------------------------------------------------------
         SESSION ID
      ------------------------------------------------------- */

      const createdSessionId =
        (response as any)?.id ??
        (response as any)?.session_id ??
        (response as any)?.session?.id ??
        (response as any)?.session?.session_id ??
        (response as any)?.data?.id ??
        (response as any)?.data?.session_id ??
        (response as any)?.data?.session?.id ??
        (response as any)?.data?.session?.session_id;

      console.log(
        "CREATED SESSION ID:",
        createdSessionId
      );

      if (
        createdSessionId === undefined ||
        createdSessionId === null ||
        createdSessionId === ""
      ) {
        throw new Error(
          "Interview session was created, but no session ID was returned."
        );
      }

      const numericSessionId =
        Number(createdSessionId);

      if (
        Number.isNaN(
          numericSessionId
        )
      ) {
        throw new Error(
          "Invalid interview session ID returned by the server."
        );
      }

      /* -------------------------------------------------------
         SAVE SESSION ID
      ------------------------------------------------------- */

      setSessionId(
        numericSessionId
      );

      /* -------------------------------------------------------
         GET GENERATED QUESTIONS
      ------------------------------------------------------- */

      setQuestionLoading(true);

      const interviewSession =
        await getInterviewSession(
          numericSessionId
        );

      console.log(
        "INTERVIEW SESSION:",
        interviewSession
      );

      /* -------------------------------------------------------
         SAVE SESSION
      ------------------------------------------------------- */

      setSession(
        interviewSession
      );

      /* -------------------------------------------------------
         SAVE QUESTIONS
      ------------------------------------------------------- */

      const generatedQuestions =
        interviewSession?.questions || [];

      console.log(
        "GENERATED QUESTIONS:",
        generatedQuestions
      );

      if (
        generatedQuestions.length === 0
      ) {
        throw new Error(
          "The interview session was created, but no questions were returned."
        );
      }

      setQuestions(
        generatedQuestions
      );

      /* -------------------------------------------------------
         RESET INTERVIEW STATE
      ------------------------------------------------------- */

      setCurrentQuestionIndex(0);

      setAnswer("");

      setResult(null);

      setInterviewStarted(true);

      setInterviewCompleted(false);

    } catch (err: any) {
      console.error(
        "FAILED TO START INTERVIEW:",
        err
      );

      console.error(
        "ERROR RESPONSE:",
        err?.response?.data
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to start the interview. Please try again.";

      setError(message);

    } finally {
      setLoading(false);
      setQuestionLoading(false);
    }
  };

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const currentQuestion =
    questions[
      currentQuestionIndex
    ];

  /* =========================================================
     SUBMIT CURRENT ANSWER
  ========================================================= */

  const handleNextQuestion = async () => {
    if (!currentQuestion) {
      setError(
        "Current interview question is missing."
      );

      return;
    }

    if (!answer.trim()) {
      setError(
        "Please enter your answer before continuing."
      );

      return;
    }

    if (!sessionId) {
      setError(
        "Interview session is missing."
      );

      return;
    }

    /* -------------------------------------------------------
       QUESTION ID CHECK
    ------------------------------------------------------- */

    if (
      currentQuestion.id === undefined ||
      currentQuestion.id === null
    ) {
      console.error(
        "CURRENT QUESTION DOES NOT HAVE AN ID:",
        currentQuestion
      );

      setError(
        "Question ID is missing."
      );

      return;
    }

    try {
      setError("");

      setAnswerLoading(true);

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

      /* -------------------------------------------------------
         SUBMIT ANSWER
      ------------------------------------------------------- */

      const answerResult =
        await submitInterviewAnswer(
          sessionId,
          {
            question_id:
              currentQuestion.id,

            question_number:
              currentQuestion.question_number,

            answer:
              answer.trim(),
          } as any
        );

      console.log(
        "ANSWER SUBMISSION RESULT:",
        answerResult
      );

      /* -------------------------------------------------------
         UPDATE CURRENT QUESTION LOCALLY
      ------------------------------------------------------- */

      setQuestions(
        (previousQuestions) =>
          previousQuestions.map(
            (question, index) =>
              index ===
              currentQuestionIndex
                ? {
                    ...question,
                    answer:
                      answer.trim(),
                    is_attempted:
                      true,
                    score:
                      (answerResult as any)
                        ?.question
                        ?.score ??
                      question.score,
                    feedback:
                      (answerResult as any)
                        ?.question
                        ?.feedback ??
                      question.feedback,
                    strengths:
                      (answerResult as any)
                        ?.question
                        ?.strengths ??
                      question.strengths,
                    improvements:
                      (answerResult as any)
                        ?.question
                        ?.improvements ??
                      question.improvements,
                  }
                : question
          )
      );

      /* -------------------------------------------------------
         CHECK LAST QUESTION
      ------------------------------------------------------- */

      const isLastQuestion =
        currentQuestionIndex >=
        questions.length - 1;

      if (isLastQuestion) {
        /*
         * Do NOT just show "completed".
         *
         * First fetch the actual result from:
         *
         * GET
         * /session/<id>/result/
         */

        console.log(
          "LAST QUESTION SUBMITTED."
        );

        console.log(
          "LOADING FINAL INTERVIEW RESULT..."
        );

        await loadInterviewResult(
          sessionId
        );

        setInterviewCompleted(
          true
        );

        return;
      }

      /* -------------------------------------------------------
         NEXT QUESTION
      ------------------------------------------------------- */

      setCurrentQuestionIndex(
        (previousIndex) =>
          previousIndex + 1
      );

      setAnswer("");

    } catch (err: any) {
      console.error(
        "FAILED TO SUBMIT ANSWER:",
        err
      );

      console.error(
        "ANSWER ERROR RESPONSE:",
        err?.response?.data
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to submit your answer.";

      setError(message);

    } finally {
      setAnswerLoading(false);
    }
  };

  /* =========================================================
     BACK TO SETUP
  ========================================================= */

  const handleBackToSetup = () => {
    setInterviewStarted(false);

    setSessionId(null);

    setSession(null);

    setQuestions([]);

    setCurrentQuestionIndex(0);

    setAnswer("");

    setError("");

    setResult(null);

    setInterviewCompleted(false);
  };

  /* =========================================================
     RESULT PAGE
  ========================================================= */

  if (
    interviewStarted &&
    interviewCompleted
  ) {
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
              RESULT HEADER
          ====================================================== */}

          <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white">
            <div className="flex min-h-[76px] items-center justify-between px-5 sm:px-7">

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    handleBackToSetup
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
                    Review your interview performance.
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-3 py-2 sm:flex">

                <BriefcaseBusiness
                  size={14}
                  className="text-[#2563eb]"
                />

                <span className="text-[10px] font-medium text-[#475569]">
                  Interview Result
                </span>

              </div>

            </div>
          </header>

          {/* =====================================================
              RESULT CONTENT
          ====================================================== */}

          <main className="w-full px-4 pb-8 pt-5 sm:px-6">

            {resultLoading ? (
              <section className="rounded-xl border border-[#dbe4f0] bg-white px-6 py-14 text-center shadow-sm">

                <Loader2
                  size={22}
                  className="mx-auto animate-spin text-[#2563eb]"
                />

                <p className="mt-3 text-[11px] text-[#64748b]">
                  Preparing your interview result...
                </p>

              </section>
            ) : result ? (
              <>
                {/* =================================================
                    OVERALL RESULT
                ================================================== */}

                <section className="rounded-xl border border-[#dbe4f0] bg-white px-5 py-5 shadow-sm">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-[10px] font-medium text-[#64748b]">
                        Interview Completed
                      </p>

                      <h2 className="mt-1 text-[20px] font-semibold text-[#102a56]">
                        {result.target_role}
                      </h2>

                      <p className="mt-1 text-[10px] text-[#94a3b8]">
                        {result.attempted_questions}{" "}
                        of{" "}
                        {result.total_questions}{" "}
                        questions attempted
                      </p>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-[#eef4ff] bg-white">

                        <span className="text-[20px] font-bold text-[#2563eb]">
                          {Number(
                            result.overall_score || 0
                          ).toFixed(0)}
                        </span>

                        <span className="text-[8px] text-[#94a3b8]">
                          / 100
                        </span>

                      </div>

                      <div>

                        <p className="text-[10px] text-[#64748b]">
                          Overall Score
                        </p>

                        <p className="text-[13px] font-semibold text-[#102a56]">
                          {Number(
                            result.overall_score || 0
                          ).toFixed(2)}
                          %
                        </p>

                      </div>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    SUMMARY CARDS
                ================================================== */}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

                  <div className="rounded-xl border border-[#dbe4f0] bg-white px-4 py-4 shadow-sm">

                    <p className="text-[9px] font-medium text-[#94a3b8]">
                      Readiness Score
                    </p>

                    <p className="mt-1 text-[18px] font-semibold text-[#102a56]">
                      {Number(
                        result.readiness_score || 0
                      ).toFixed(2)}
                      %
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#dbe4f0] bg-white px-4 py-4 shadow-sm">

                    <p className="text-[9px] font-medium text-[#94a3b8]">
                      Questions Attempted
                    </p>

                    <p className="mt-1 text-[18px] font-semibold text-[#102a56]">
                      {
                        result.attempted_questions
                      }
                      <span className="text-[11px] font-normal text-[#94a3b8]">
                        {" "}
                        /{" "}
                        {
                          result.total_questions
                        }
                      </span>
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#dbe4f0] bg-white px-4 py-4 shadow-sm">

                    <p className="text-[9px] font-medium text-[#94a3b8]">
                      Status
                    </p>

                    <p className="mt-1 text-[13px] font-semibold capitalize text-[#102a56]">
                      {
                        result.status
                      }
                    </p>

                  </div>

                </div>

                {/* =================================================
                    STRENGTHS / IMPROVEMENTS
                ================================================== */}

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">

                  {/* STRENGTHS */}

                  <section className="rounded-xl border border-[#dbe4f0] bg-white px-5 py-5 shadow-sm">

                    <h2 className="text-[13px] font-semibold text-[#102a56]">
                      Strengths
                    </h2>

                    {result.strengths &&
                    result.strengths.length > 0 ? (
                      <ul className="mt-3 space-y-2">

                        {result.strengths.map(
                          (
                            strength,
                            index
                          ) => (
                            <li
                              key={`${strength}-${index}`}
                              className="flex items-start gap-2 text-[10px] leading-5 text-[#475569]"
                            >
                              <CheckCircle2
                                size={13}
                                className="mt-0.5 shrink-0 text-[#2563eb]"
                              />

                              <span>
                                {strength}
                              </span>
                            </li>
                          )
                        )}

                      </ul>
                    ) : (
                      <p className="mt-3 text-[10px] text-[#94a3b8]">
                        No strengths were recorded.
                      </p>
                    )}

                  </section>

                  {/* IMPROVEMENTS */}

                  <section className="rounded-xl border border-[#dbe4f0] bg-white px-5 py-5 shadow-sm">

                    <h2 className="text-[13px] font-semibold text-[#102a56]">
                      Areas for Improvement
                    </h2>

                    {result.improvements &&
                    result.improvements.length > 0 ? (
                      <ul className="mt-3 space-y-2">

                        {result.improvements.map(
                          (
                            improvement,
                            index
                          ) => (
                            <li
                              key={`${improvement}-${index}`}
                              className="flex items-start gap-2 text-[10px] leading-5 text-[#475569]"
                            >
                              <ChevronRight
                                size={13}
                                className="mt-0.5 shrink-0 text-[#2563eb]"
                              />

                              <span>
                                {improvement}
                              </span>
                            </li>
                          )
                        )}

                      </ul>
                    ) : (
                      <p className="mt-3 text-[10px] text-[#94a3b8]">
                        No improvement areas were recorded.
                      </p>
                    )}

                  </section>

                </div>

                {/* =================================================
                    QUESTION-BY-QUESTION RESULT
                ================================================== */}

                <section className="mt-4 overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">

                  <div className="border-b border-[#edf1f5] px-5 py-4">

                    <h2 className="text-[13px] font-semibold text-[#102a56]">
                      Question-wise Performance
                    </h2>

                    <p className="mt-0.5 text-[9px] text-[#94a3b8]">
                      Review your answers, scores, and feedback.
                    </p>

                  </div>

                  <div className="divide-y divide-[#eef2f7]">

                    {result.questions.map(
                      (question) => (
                        <div
                          key={
                            question.id
                          }
                          className="px-5 py-5"
                        >

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <div className="flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="rounded-md bg-[#eef4ff] px-2 py-1 text-[8px] font-medium text-[#2563eb]">
                                  Question{" "}
                                  {
                                    question.question_number
                                  }
                                </span>

                                <span className="text-[8px] text-[#94a3b8]">
                                  {
                                    question.category
                                  }
                                </span>

                              </div>

                              <h3 className="mt-2 text-[12px] font-semibold leading-5 text-[#102a56]">
                                {
                                  question.question_text
                                }
                              </h3>

                            </div>

                            <div className="shrink-0">

                              {question.is_attempted ? (
                                <div className="rounded-lg bg-[#eef4ff] px-3 py-2 text-center">

                                  <p className="text-[8px] text-[#64748b]">
                                    Score
                                  </p>

                                  <p className="text-[15px] font-semibold text-[#2563eb]">
                                    {Number(
                                      question.score || 0
                                    ).toFixed(0)}
                                    /100
                                  </p>

                                </div>
                              ) : (
                                <span className="rounded-md bg-[#f8fafc] px-2 py-1 text-[8px] text-[#94a3b8]">
                                  Not Attempted
                                </span>
                              )}

                            </div>

                          </div>

                          {question.is_attempted && (
                            <div className="mt-4">

                              <p className="text-[9px] font-semibold text-[#102a56]">
                                Your Answer
                              </p>

                              <div className="mt-1 rounded-lg bg-[#f8fafc] px-3 py-3">

                                <p className="whitespace-pre-wrap text-[10px] leading-5 text-[#475569]">
                                  {question.answer ||
                                    "No answer recorded."}
                                </p>

                              </div>

                              {question.feedback && (
                                <div className="mt-3">

                                  <p className="text-[9px] font-semibold text-[#102a56]">
                                    Feedback
                                  </p>

                                  <p className="mt-1 text-[10px] leading-5 text-[#64748b]">
                                    {
                                      question.feedback
                                    }
                                  </p>

                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>

                </section>

                {/* =================================================
                    BACK BUTTON
                ================================================== */}

                <div className="mt-5 flex justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/employee/interview-prep"
                      )
                    }
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#1d4ed8]"
                  >
                    Back to Interview Preparation

                    <ChevronRight
                      size={14}
                    />

                  </button>

                </div>

              </>
            ) : (
              <section className="rounded-xl border border-[#dbe4f0] bg-white px-6 py-10 text-center shadow-sm">

                <p className="text-[11px] text-[#64748b]">
                  Interview result is not available yet.
                </p>

              </section>
            )}

          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     QUESTION UI
  ========================================================= */

  if (interviewStarted) {
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
              QUESTION PAGE HEADER
          ====================================================== */}

          <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white">
            <div className="flex min-h-[76px] items-center justify-between px-5 sm:px-7">

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={
                    handleBackToSetup
                  }
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
                    Answer each question carefully.
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-3 py-2 sm:flex">

                <BriefcaseBusiness
                  size={14}
                  className="text-[#2563eb]"
                />

                <span className="text-[10px] font-medium text-[#475569]">
                  Full Interview
                </span>

              </div>

            </div>
          </header>

          {/* =====================================================
              QUESTION CONTENT
          ====================================================== */}

          <main className="w-full px-4 pb-8 pt-5 sm:px-6">

            {/* =================================================
                INTERVIEW PROGRESS
            ================================================== */}

            <div className="mb-4 rounded-xl border border-[#dbe4f0] bg-white px-5 py-4 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-medium text-[#64748b]">
                    Interview Progress
                  </p>

                  <h2 className="mt-1 text-[15px] font-semibold text-[#102a56]">
                    Question{" "}
                    {currentQuestionIndex +
                      1}{" "}
                    of{" "}
                    {questions.length}
                  </h2>
                </div>

                <div className="text-right">

                  <p className="text-[10px] text-[#94a3b8]">
                    Target Role
                  </p>

                  <p className="text-[11px] font-medium text-[#475569]">
                    {session?.target_role}
                  </p>

                </div>

              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">

                <div
                  className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex +
                        1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-600">
                {error}
              </div>
            )}

            {/* =================================================
                CURRENT QUESTION
            ================================================== */}

            <section className="overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">

              {/* QUESTION HEADER */}

              <div className="border-b border-[#edf1f5] px-5 py-4">

                <div className="flex items-center justify-between">

                  <span className="rounded-md bg-[#eef4ff] px-2.5 py-1 text-[9px] font-medium text-[#2563eb]">
                    {currentQuestion?.category ||
                      "Interview Question"}
                  </span>

                  <span className="text-[10px] text-[#94a3b8]">
                    Question{" "}
                    {currentQuestionIndex +
                      1}
                  </span>

                </div>

              </div>

              {/* QUESTION BODY */}

              <div className="px-5 py-6">

                {questionLoading ? (
                  <div className="flex min-h-[250px] items-center justify-center">

                    <div className="flex items-center gap-2 text-[11px] text-[#64748b]">

                      <Loader2
                        size={16}
                        className="animate-spin text-[#2563eb]"
                      />

                      Loading question...

                    </div>

                  </div>
                ) : (
                  <>
                    <h2 className="text-[17px] font-semibold leading-7 text-[#102a56]">
                      {currentQuestion?.question_text}
                    </h2>

                    <div className="mt-6">

                      <label
                        htmlFor="interviewAnswer"
                        className="mb-2 block text-[10px] font-semibold text-[#102a56]"
                      >
                        Your Answer
                      </label>

                      <textarea
                        id="interviewAnswer"
                        value={answer}
                        onChange={(e) => {

                          setAnswer(
                            e.target.value
                          );

                          if (error) {
                            setError("");
                          }

                        }}
                        placeholder="Type your answer here..."
                        rows={9}
                        disabled={
                          answerLoading
                        }
                        className="w-full resize-none rounded-lg border border-[#dbe4f0] bg-white px-4 py-3 text-[11px] leading-5 text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 disabled:bg-[#f8fafc]"
                      />

                    </div>
                  </>
                )}

              </div>

              {/* FOOTER */}

              <div className="flex items-center justify-between border-t border-[#eef2f7] px-5 py-3">

                <p className="text-[9px] text-[#94a3b8]">

                  {currentQuestionIndex +
                    1 <
                  questions.length
                    ? "Your answer will be evaluated before moving to the next question."
                    : "Submit your final answer to complete the interview."}

                </p>

                <button
                  type="button"
                  onClick={
                    handleNextQuestion
                  }
                  disabled={
                    answerLoading ||
                    !currentQuestion
                  }
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {answerLoading ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />

                      Submitting...
                    </>
                  ) : currentQuestionIndex +
                      1 >=
                    questions.length ? (
                    <>
                      Finish Interview

                      <CheckCircle2
                        size={14}
                      />
                    </>
                  ) : (
                    <>
                      Next Question

                      <ChevronRight
                        size={14}
                      />
                    </>
                  )}

                </button>

              </div>

            </section>

          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     SETUP UI
  ========================================================= */

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

          <div className="flex min-h-[76px] items-center justify-between px-5 sm:px-7">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/employee/interview-prep"
                  )
                }
                aria-label="Back to Interview Preparation"
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
                  Configure your full-length interview session.
                </p>

              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-3 py-2 sm:flex">

              <BriefcaseBusiness
                size={14}
                className="text-[#2563eb]"
              />

              <span className="text-[10px] font-medium text-[#475569]">
                Full Interview
              </span>

            </div>

          </div>

        </header>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <main className="w-full px-4 pb-6 pt-5 sm:px-6">

          <section className="w-full overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">

            {/* CARD HEADER */}

            <div className="flex items-center gap-3 border-b border-[#edf1f5] px-5 py-3.5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff]">

                <BriefcaseBusiness
                  size={19}
                  strokeWidth={1.8}
                  className="text-[#2563eb]"
                />

              </div>

              <div>

                <h2 className="text-[14px] font-semibold leading-tight text-[#102a56]">
                  Interview Details
                </h2>

                <p className="mt-0.5 text-[9px] text-[#94a3b8]">
                  Select the type, role, and experience level.
                </p>

              </div>

            </div>

            {/* FORM */}

            <div className="px-5 py-4">

              {/* INTERVIEW TYPE */}

              <div>

                <label
                  htmlFor="interviewType"
                  className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                >
                  Interview Type
                </label>

                <div className="relative">

                  <select
                    id="interviewType"
                    value={interviewType}
                    onChange={(e) => {

                      const value =
                        e.target.value as InterviewType;

                      setInterviewType(
                        value
                      );

                      if (
                        value !==
                        "custom"
                      ) {
                        setCustomInterviewType(
                          ""
                        );
                      }

                      if (
                        value !==
                        "technical"
                      ) {
                        setTechnicalQuestionType(
                          ""
                        );
                      }

                    }}
                    className="h-10 w-full appearance-none rounded-md border border-[#dbe4f0] bg-white px-3 pr-9 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
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

                    <option value="mixed">
                      Mixed
                    </option>

                    <option value="custom">
                      Custom
                    </option>

                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                  />

                </div>

              </div>

              {/* TECHNICAL QUESTION TYPE */}

              {interviewType ===
                "technical" && (
                <div className="mt-3">

                  <label
                    htmlFor="technicalQuestionType"
                    className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                  >
                    Technical Question Type
                  </label>

                  <div className="relative">

                    <select
                      id="technicalQuestionType"
                      value={
                        technicalQuestionType
                      }
                      onChange={(e) =>
                        setTechnicalQuestionType(
                          e.target.value
                        )
                      }
                      className="h-10 w-full appearance-none rounded-md border border-[#dbe4f0] bg-white px-3 pr-9 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                    >

                      <option value="">
                        Select technical focus
                      </option>

                      <option value="data-structures-algorithms">
                        Data Structures & Algorithms
                      </option>

                      <option value="programming-coding">
                        Programming & Coding
                      </option>

                      <option value="object-oriented-programming">
                        Object-Oriented Programming
                      </option>

                      <option value="database-dbms">
                        Database / DBMS
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

                      <option value="cloud-devops">
                        Cloud / DevOps
                      </option>

                      <option value="cyber-security">
                        Cyber Security
                      </option>

                      <option value="ai-machine-learning">
                        AI / Machine Learning
                      </option>

                      <option value="system-design">
                        System Design
                      </option>

                      <option value="technical-mixed">
                        Mixed Technical Questions
                      </option>

                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                    />

                  </div>

                </div>
              )}

              {/* CUSTOM INTERVIEW TYPE */}

              {interviewType ===
                "custom" && (
                <div className="mt-3">

                  <label
                    htmlFor="customInterviewType"
                    className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                  >
                    Custom Interview Type
                  </label>

                  <input
                    id="customInterviewType"
                    type="text"
                    value={
                      customInterviewType
                    }
                    onChange={(e) =>
                      setCustomInterviewType(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Python Developer"
                    className="h-10 w-full rounded-md border border-[#dbe4f0] bg-white px-3 text-[10px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                  />

                </div>
              )}

              {/* TARGET ROLE */}

              <div className="mt-3">

                <label
                  htmlFor="targetRole"
                  className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                >
                  Target Role
                </label>

                <div className="relative">

                  <select
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => {

                      const value =
                        e.target.value;

                      setTargetRole(
                        value
                      );

                      if (
                        value !==
                        "Others"
                      ) {
                        setCustomTargetRole(
                          ""
                        );
                      }

                    }}
                    className="h-10 w-full appearance-none rounded-md border border-[#dbe4f0] bg-white px-3 pr-9 text-[10px] text-[#475569] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                  >

                    <option value="Software Engineer">
                      Software Engineer
                    </option>

                    <option value="Frontend Developer">
                      Frontend Developer
                    </option>

                    <option value="Backend Developer">
                      Backend Developer
                    </option>

                    <option value="Full Stack Developer">
                      Full Stack Developer
                    </option>

                    <option value="Python Developer">
                      Python Developer
                    </option>

                    <option value="Java Developer">
                      Java Developer
                    </option>

                    <option value="Data Analyst">
                      Data Analyst
                    </option>

                    <option value="Data Scientist">
                      Data Scientist
                    </option>

                    <option value="Cybersecurity Analyst">
                      Cybersecurity Analyst
                    </option>

                    <option value="DevOps Engineer">
                      DevOps Engineer
                    </option>

                    <option value="Cloud Engineer">
                      Cloud Engineer
                    </option>

                    <option value="Others">
                      Others
                    </option>

                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                  />

                </div>

                {targetRole ===
                  "Others" && (
                  <div className="mt-3">

                    <label
                      htmlFor="customTargetRole"
                      className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                    >
                      Custom Target Role
                    </label>

                    <input
                      id="customTargetRole"
                      type="text"
                      value={
                        customTargetRole
                      }
                      onChange={(e) =>
                        setCustomTargetRole(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Security Engineer"
                      className="h-10 w-full rounded-md border border-[#dbe4f0] bg-white px-3 text-[10px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                    />

                  </div>
                )}

              </div>

              {/* EXPERIENCE */}

              <div className="mt-3">

                <label className="mb-1.5 block text-[10px] font-semibold text-[#102a56]">
                  Experience
                </label>

                <div className="flex items-center gap-5">

                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#475569]">

                    <input
                      type="radio"
                      name="experience"
                      value="fresher"
                      checked={
                        experienceLevel ===
                        "fresher"
                      }
                      onChange={() => {

                        setExperienceLevel(
                          "fresher"
                        );

                        setExperienceDuration(
                          ""
                        );

                      }}
                      className="h-3.5 w-3.5 accent-[#2563eb]"
                    />

                    Fresher

                  </label>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#475569]">

                    <input
                      type="radio"
                      name="experience"
                      value="experienced"
                      checked={
                        experienceLevel ===
                        "experienced"
                      }
                      onChange={() =>
                        setExperienceLevel(
                          "experienced"
                        )
                      }
                      className="h-3.5 w-3.5 accent-[#2563eb]"
                    />

                    Experienced

                  </label>

                </div>

              </div>

              {/* EXPERIENCE DURATION */}

              {experienceLevel ===
                "experienced" && (
                <div className="mt-3">

                  <label
                    htmlFor="experienceDuration"
                    className="mb-1.5 block text-[10px] font-semibold text-[#102a56]"
                  >
                    Experience Duration
                  </label>

                  <input
                    id="experienceDuration"
                    type="text"
                    value={
                      experienceDuration
                    }
                    onChange={(e) =>
                      setExperienceDuration(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2 years"
                    className="h-10 w-full rounded-md border border-[#dbe4f0] bg-white px-3 text-[10px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                  />

                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-600">
                  {error}
                </div>
              )}

              {/* FOOTER */}

              <div className="mt-4 flex items-center justify-end border-t border-[#eef2f7] pt-3">

                <button
                  type="button"
                  onClick={
                    handleStartInterview
                  }
                  disabled={loading}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#2563eb] px-5 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />

                      Starting...
                    </>
                  ) : (
                    <>
                      Start Interview

                      <ChevronRight
                        size={14}
                      />
                    </>
                  )}

                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    </div>
  );
}