"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";

import {
  api,
  evaluateQuickPracticeAnswer,
  type QuickPracticeEvaluation,
} from "@/lib/api";

type Question = {
  id: number | string;
  question: string;
  category?: string;
};

type BackendQuestion = {
  question?: string;
  question_text?: string;
  category?: string;
};

type PracticeResponse = {
  success?: boolean;
  message?: string;
  questions?: BackendQuestion[];
};

export default function TechnicalPracticePage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [evaluating, setEvaluating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<QuickPracticeEvaluation | null>(
      null
    );

  const [practiceInfo, setPracticeInfo] =
    useState({
      topic: "Technical",
      difficulty: "Medium",
    });

  /* =========================================================
     LOAD QUESTIONS
  ========================================================= */

  useEffect(() => {
    const generateQuestions =
      async () => {
        try {
          setLoading(true);
          setError("");

          const topic =
            searchParams.get("topic") ||
            "General";

          const difficulty =
            searchParams.get("difficulty") ||
            "medium";

          const questionCountParam =
            searchParams.get(
              "question_count"
            ) || "5";

          const questionCount =
            Number(
              questionCountParam
            );

          const safeQuestionCount =
            Number.isFinite(
              questionCount
            ) &&
            questionCount >= 1
              ? Math.min(
                  questionCount,
                  20
                )
              : 5;

          const response =
            await api.post<PracticeResponse>(
              "/interview-prep/quick-practice/",
              {
                practice_type:
                  "technical",

                topic:
                  topic === "General"
                    ? ""
                    : topic,

                difficulty:
                  difficulty,

                question_count:
                  safeQuestionCount,
              }
            );

          const data =
            response.data;

          if (
            !data.questions ||
            data.questions.length === 0
          ) {
            throw new Error(
              "No technical questions were generated."
            );
          }

          const normalizedQuestions =
            data.questions.map(
              (
                item,
                index
              ) => ({
                id:
                  index + 1,

                question:
                  item.question ||
                  item.question_text ||
                  "",

                category:
                  item.category ||
                  "Technical",
              })
            );

          setQuestions(
            normalizedQuestions
          );

          setPracticeInfo({
            topic:
              topic === "General"
                ? "Technical"
                : topic,

            difficulty:
              difficulty
                ? difficulty
                    .charAt(0)
                    .toUpperCase() +
                  difficulty.slice(1)
                : "Medium",
          });
        } catch (err: any) {
          console.error(
            "Failed to generate technical questions:",
            err
          );

          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to generate technical questions."
          );
        } finally {
          setLoading(false);
        }
      };

    generateQuestions();
  }, [searchParams]);

  /* =========================================================
     CURRENT QUESTION
  ========================================================= */

  const question =
    questions[currentQuestion];

  const totalQuestions =
    questions.length;

  const progress =
    useMemo(() => {
      if (!totalQuestions) {
        return 0;
      }

      return (
        ((currentQuestion + 1) /
          totalQuestions) *
        100
      );
    }, [
      currentQuestion,
      totalQuestions,
    ]);

  /* =========================================================
     ANSWER CHANGE
  ========================================================= */

  const handleAnswerChange = (
    value: string
  ) => {
    if (!question) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,

      [String(question.id)]:
        value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     CURRENT ANSWER
  ========================================================= */

  const currentAnswer =
    question
      ? answers[
          String(question.id)
        ] || ""
      : "";

  /* =========================================================
     SUBMIT / EVALUATE CURRENT ANSWER
  ========================================================= */

  const handleNext = async () => {
    if (!question) {
      return;
    }

    if (!currentAnswer.trim()) {
      setError(
        "Please enter your answer before continuing."
      );

      return;
    }

    try {
      setEvaluating(true);
      setError("");

      const result =
        await evaluateQuickPracticeAnswer({
          question:
            question.question,

          answer:
            currentAnswer.trim(),

          category:
            question.category ||
            "Technical",

          practice_type:
            "technical",
        });

      setEvaluation(result);
    } catch (err: any) {
      console.error(
        "Failed to evaluate technical answer:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to evaluate your answer."
      );
    } finally {
      setEvaluating(false);
    }
  };

  /* =========================================================
     MOVE TO NEXT QUESTION
  ========================================================= */

  const handleContinue = () => {
    setEvaluation(null);
    setError("");

    if (
      currentQuestion >=
      totalQuestions - 1
    ) {
      handleFinish();
      return;
    }

    setCurrentQuestion(
      (previous) =>
        previous + 1
    );
  };

  /* =========================================================
     PREVIOUS
  ========================================================= */

  const handlePrevious = () => {
    if (
      currentQuestion <= 0
    ) {
      return;
    }

    setEvaluation(null);
    setError("");

    setCurrentQuestion(
      (previous) =>
        previous - 1
    );
  };

  /* =========================================================
     FINISH
  ========================================================= */

  const handleFinish = () => {
    try {
      setSubmitting(true);

      sessionStorage.setItem(
        "quickPracticeAnswers",
        JSON.stringify(
          answers
        )
      );

      sessionStorage.setItem(
        "quickPracticeQuestions",
        JSON.stringify(
          questions
        )
      );

      sessionStorage.setItem(
        "quickPracticeInfo",
        JSON.stringify(
          practiceInfo
        )
      );

      router.push(
        "/employee/interview-prep"
      );
    } catch (err) {
      console.error(
        "Failed to finish technical practice:",
        err
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

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
              Generating your technical practice questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !question) {
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
            <h2 className="text-[15px] font-semibold text-[#102a56]">
              Unable to Start Practice
            </h2>

            <p className="mt-2 text-[10px] text-[#64748b]">
              {error}
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

  /* =========================================================
     PRACTICE SCREEN
  ========================================================= */

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
        {/* =====================================================
            HEADER
        ====================================================== */}

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
                  Interview Preparation
                </h1>

                <p className="mt-0.5 text-[10px] text-[#64748b]">
                  Practice smarter with focused interview questions.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#dbe4f0] bg-white px-3 py-2">
              <span className="text-[10px] font-medium text-[#475569]">
                Quick Practice
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <main className="flex min-h-0 flex-1 overflow-hidden px-5 py-5 sm:px-7">
          <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col">

            {/* TOP INFORMATION */}

            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#2563eb]">
                    Technical Practice
                  </span>

                  <span className="text-[9px] text-[#94a3b8]">
                    {practiceInfo.topic}
                  </span>

                  <span className="text-[#cbd5e1]">
                    •
                  </span>

                  <span className="text-[9px] text-[#94a3b8]">
                    {practiceInfo.difficulty}
                  </span>
                </div>

                <h2 className="text-[16px] font-semibold text-[#102a56]">
                  Practice Test
                </h2>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#102a56]">
                  Question{" "}
                  {currentQuestion + 1}{" "}
                  of{" "}
                  {totalQuestions}
                </p>

                <p className="mt-0.5 text-[9px] text-[#64748b]">
                  {Math.round(progress)}%
                  {" "}Complete
                </p>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="mb-4 h-1.5 w-full shrink-0 overflow-hidden rounded-full bg-[#e8eef7]">
              <div
                className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-600">
                {error}
              </div>
            )}

            {/* QUESTION CARD */}

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dbe4f0] bg-white shadow-sm">

              {/* QUESTION */}

              <div className="shrink-0 border-b border-[#eef2f7] px-5 py-4 sm:px-6">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-[#2563eb]">
                  Question
                </p>

                <h3 className="text-[15px] font-medium leading-6 text-[#102a56]">
                  {question?.question}
                </h3>
              </div>

              {/* ANSWER */}

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 sm:px-6">

                <label className="mb-2 shrink-0 text-[9px] font-semibold text-[#334155]">
                  Your Answer
                </label>

                <textarea
                  value={
                    currentAnswer
                  }
                  onChange={(e) =>
                    handleAnswerChange(
                      e.target.value
                    )
                  }
                  disabled={
                    evaluating
                  }
                  placeholder="Type your answer here..."
                  className="min-h-[150px] resize-none rounded-lg border border-[#dbe4f0] bg-white p-3 text-[11px] leading-5 text-[#334155] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-1 focus:ring-[#dbeafe] disabled:bg-[#f8fafc]"
                />

                {/* =================================================
                    AI EVALUATION
                ================================================== */}

                {evaluation && (
                  <div className="mt-4 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-4">

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#2563eb]">
                          AI Evaluation
                        </p>

                        <h4 className="mt-1 text-[14px] font-semibold text-[#102a56]">
                          Your Answer Feedback
                        </h4>
                      </div>

                      {evaluation.score !==
                        undefined && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff]">
                          <span className="text-[13px] font-bold text-[#2563eb]">
                            {evaluation.score}
                          </span>
                        </div>
                      )}
                    </div>

                    {evaluation.feedback && (
                      <div className="mt-3">
                        <p className="text-[9px] font-semibold text-[#334155]">
                          Feedback
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-[#64748b]">
                          {evaluation.feedback}
                        </p>
                      </div>
                    )}

                    {evaluation.strengths &&
                      evaluation.strengths.length >
                        0 && (
                        <div className="mt-3">
                          <p className="text-[9px] font-semibold text-[#334155]">
                            Strengths
                          </p>

                          <ul className="mt-1 space-y-1">
                            {evaluation.strengths.map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                  className="flex gap-2 text-[10px] leading-4 text-[#64748b]"
                                >
                                  <CheckCircle2
                                    size={11}
                                    className="mt-0.5 shrink-0 text-[#2563eb]"
                                  />

                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {evaluation.improvements &&
                      evaluation.improvements.length >
                        0 && (
                        <div className="mt-3">
                          <p className="text-[9px] font-semibold text-[#334155]">
                            Areas to Improve
                          </p>

                          <ul className="mt-1 space-y-1">
                            {evaluation.improvements.map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                  className="flex gap-2 text-[10px] leading-4 text-[#64748b]"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#94a3b8]" />

                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                  </div>
                )}

              </div>

              {/* FOOTER */}

              <div className="flex shrink-0 items-center justify-between border-t border-[#eef2f7] px-5 py-3 sm:px-6">

                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    currentQuestion ===
                      0 ||
                    evaluating
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-[#dbe4f0] bg-white px-4 py-2 text-[10px] font-medium text-[#475569] transition hover:border-[#bfdbfe] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={13} />
                  Previous
                </button>

                <div className="flex items-center gap-1.5 text-[9px] text-[#94a3b8]">
                  <CheckCircle2
                    size={12}
                    className="text-[#2563eb]"
                  />

                  {
                    Object.keys(
                      answers
                    ).filter(
                      (key) =>
                        answers[key]?.trim()
                    ).length
                  }{" "}
                  answered
                </div>

                {!evaluation ? (
                  <button
                    type="button"
                    onClick={
                      handleNext
                    }
                    disabled={
                      evaluating ||
                      !currentAnswer.trim()
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {evaluating ? (
                      <>
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />

                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleContinue
                    }
                    disabled={
                      submitting
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Finishing..."
                      : currentQuestion ===
                        totalQuestions - 1
                      ? "Finish Practice"
                      : "Next Question"}

                    {!submitting && (
                      <ArrowRight size={13} />
                    )}
                  </button>
                )}

              </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}