import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

export const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   TYPES
========================================================= */

type RetryableRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

/* =========================================================
   TOKEN CLEANER
========================================================= */

const cleanToken = (token: string): string => {
  let cleaned = token.trim();

  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.substring(7).trim();
  }

  if (
    cleaned.startsWith('"') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.substring(
      1,
      cleaned.length - 1
    );
  }

  return cleaned.trim();
};

/* =========================================================
   GET STORED TOKEN
========================================================= */

const getStoredToken = (
  keys: string[]
): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of keys) {
    const localValue =
      localStorage.getItem(key);

    if (localValue) {
      return cleanToken(localValue);
    }

    const sessionValue =
      sessionStorage.getItem(key);

    if (sessionValue) {
      return cleanToken(sessionValue);
    }
  }

  return null;
};

/* =========================================================
   ACCESS TOKEN
========================================================= */

export const getAccessToken = (): string | null => {
  return getStoredToken([
    "access_token",
    "accessToken",
    "access",
    "token",
  ]);
};

/* =========================================================
   REFRESH TOKEN
========================================================= */

export const getRefreshToken = (): string | null => {
  return getStoredToken([
    "refresh_token",
    "refreshToken",
    "refresh",
  ]);
};

/* =========================================================
   SAVE AUTH TOKENS
========================================================= */

export const saveAuthTokens = (
  accessToken: string,
  refreshToken?: string
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const cleanedAccessToken =
    cleanToken(accessToken);

  localStorage.setItem(
    "access_token",
    cleanedAccessToken
  );

  localStorage.setItem(
    "accessToken",
    cleanedAccessToken
  );

  localStorage.setItem(
    "access",
    cleanedAccessToken
  );

  localStorage.setItem(
    "token",
    cleanedAccessToken
  );

  if (refreshToken) {
    const cleanedRefreshToken =
      cleanToken(refreshToken);

    localStorage.setItem(
      "refresh_token",
      cleanedRefreshToken
    );

    localStorage.setItem(
      "refreshToken",
      cleanedRefreshToken
    );

    localStorage.setItem(
      "refresh",
      cleanedRefreshToken
    );
  }
};

/* =========================================================
   CLEAR AUTH TOKENS
========================================================= */

export const clearAuthTokens = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const keys = [
    "access_token",
    "accessToken",
    "access",
    "token",
    "refresh_token",
    "refreshToken",
    "refresh",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/* =========================================================
   REFRESH STATE
========================================================= */

let isRefreshing = false;

let refreshPromise:
  Promise<string | null> | null = null;

/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

const refreshAccessToken =
  async (): Promise<string | null> => {
    const refreshToken =
      getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    if (
      isRefreshing &&
      refreshPromise
    ) {
      return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            },
            {
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        const newAccessToken =
          response.data?.access;

        const newRefreshToken =
          response.data?.refresh;

        if (!newAccessToken) {
          return null;
        }

        saveAuthTokens(
          newAccessToken,
          newRefreshToken ||
            refreshToken
        );

        return cleanToken(
          newAccessToken
        );
      } catch (error) {
        const refreshError =
          error as AxiosError<any>;

        if (
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403
        ) {
          clearAuthTokens();
        }

        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ) => {
    /* -------------------------------------------------------
       AUTHORIZATION
    ------------------------------------------------------- */

    const token =
      getAccessToken();

    if (token) {
      if (!config.headers) {
        config.headers =
          new AxiosHeaders();
      }

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /* -------------------------------------------------------
       IMPORTANT:
       HANDLE FORMDATA CORRECTLY
       
       Resume uploads use FormData.
       Do NOT send FormData as application/json.
       
       Axios/browser must automatically create:
       
       multipart/form-data;
       boundary=....
       
       So we remove the JSON Content-Type header.
    ------------------------------------------------------- */

    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      if (!config.headers) {
        config.headers =
          new AxiosHeaders();
      }

      config.headers.delete(
        "Content-Type"
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => {
    const accessToken =
      response.data?.access;

    const refreshToken =
      response.data?.refresh;

    if (accessToken) {
      saveAuthTokens(
        accessToken,
        refreshToken
      );
    }

    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken =
        await refreshAccessToken();

      if (newToken) {
        if (!originalRequest.headers) {
          originalRequest.headers =
            new AxiosHeaders();
        }

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api.request(
          originalRequest
        );
      }
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   INTERVIEW TYPES
========================================================= */

export type InterviewQuestion = {
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
};

export type InterviewSession = {
  id: number;

  interview_type: string;

  custom_interview_type: string;

  target_role: string;

  experience_level: string;

  experience_duration: string;

  status: string;

  total_questions: number;

  current_question: number;

  attempted_questions: number;

  readiness_score: number;

  questions: InterviewQuestion[];

  created_at?: string;

  updated_at?: string;
};

/* =========================================================
   QUICK PRACTICE TYPES
========================================================= */

export type QuickPracticeType =
  | "technical"
  | "hr"
  | "behavioral";

export type QuickPracticeQuestion = {
  id?: number;

  question_number: number;

  category: string;

  question_text: string;
};

export type QuickPracticeQuestionsResponse = {
  questions: QuickPracticeQuestion[];
};

export type QuickPracticeEvaluation = {
  score?: number;

  feedback?: string;

  strengths?: string[];

  improvements?: string[];

  communication_score?: number;

  problem_solving_score?: number;

  [key: string]: any;
};

/* =========================================================
   PROFESSIONAL SUMMARY
========================================================= */

export const generateProfessionalSummary =
  async (
    jobDescription: string,
    resumeData: any
  ) => {
    const response =
      await api.post(
        "/resume-builder/resumes/generate-summary/",
        {
          job_description:
            jobDescription,

          resume_data:
            resumeData,
        }
      );

    return response.data;
  };

/* =========================================================
   CREATE INTERVIEW
========================================================= */

export const createInterview =
  async (
    data: {
      interview_type:
        | "technical"
        | "hr"
        | "behavioral"
        | "mixed"
        | "custom";

      custom_interview_type?: string;

      target_role: string;

      experience_level:
        | "fresher"
        | "experienced";

      experience_duration?: string;

      technical_topic?: string;
    }
  ): Promise<InterviewSession> => {
    const response =
      await api.post(
        "/interview-prep/create/",
        {
          interview_type:
            data.interview_type,

          custom_interview_type:
            data.custom_interview_type ||
            "",

          target_role:
            data.target_role,

          experience_level:
            data.experience_level,

          experience_duration:
            data.experience_duration ||
            "",

          technical_topic:
            data.technical_topic ||
            "",
        }
      );

    const responseData =
      response.data;

    let sessionData: any = null;

    if (
      responseData?.session &&
      typeof responseData.session ===
        "object"
    ) {
      sessionData =
        responseData.session;
    } else if (
      responseData?.data &&
      typeof responseData.data ===
        "object"
    ) {
      sessionData =
        responseData.data;
    } else {
      sessionData =
        responseData;
    }

    const sessionId =
      sessionData?.id ??
      responseData?.id ??
      responseData?.session_id ??
      responseData?.sessionId;

    if (
      sessionId === undefined ||
      sessionId === null ||
      sessionId === ""
    ) {
      throw new Error(
        "Interview session was created but no session ID was returned by the backend."
      );
    }

    const questions =
      Array.isArray(
        sessionData?.questions
      )
        ? sessionData.questions
        : [];

    return {
      ...(sessionData || {}),

      id: Number(sessionId),

      interview_type:
        sessionData?.interview_type ||
        data.interview_type,

      custom_interview_type:
        sessionData?.custom_interview_type ||
        data.custom_interview_type ||
        "",

      target_role:
        sessionData?.target_role ||
        data.target_role,

      experience_level:
        sessionData?.experience_level ||
        data.experience_level,

      experience_duration:
        sessionData?.experience_duration ||
        data.experience_duration ||
        "",

      status:
        sessionData?.status ||
        "in_progress",

      total_questions:
        sessionData?.total_questions ??
        30,

      current_question:
        sessionData?.current_question ??
        1,

      attempted_questions:
        sessionData?.attempted_questions ??
        0,

      readiness_score:
        sessionData?.readiness_score ??
        0,

      questions,
    };
  };

/* =========================================================
   GET INTERVIEW SESSION
========================================================= */

export const getInterviewSession =
  async (
    sessionId: string | number
  ): Promise<InterviewSession> => {
    if (
      sessionId === undefined ||
      sessionId === null ||
      sessionId === ""
    ) {
      throw new Error(
        "Interview session ID is missing."
      );
    }

    const response =
      await api.get(
        `/interview-prep/session/${sessionId}/`
      );

    const responseData =
      response.data;

    const sessionData =
      responseData?.session ||
      responseData?.data ||
      responseData;

    if (
      !sessionData ||
      !sessionData.id
    ) {
      throw new Error(
        "Invalid interview session response."
      );
    }

    const questions =
      Array.isArray(
        sessionData.questions
      )
        ? sessionData.questions
        : [];

    return {
      ...sessionData,

      id: Number(
        sessionData.id
      ),

      interview_type:
        sessionData.interview_type ||
        "",

      custom_interview_type:
        sessionData.custom_interview_type ||
        "",

      target_role:
        sessionData.target_role ||
        "",

      experience_level:
        sessionData.experience_level ||
        "fresher",

      experience_duration:
        sessionData.experience_duration ||
        "",

      status:
        sessionData.status ||
        "in_progress",

      total_questions:
        sessionData.total_questions ??
        questions.length,

      current_question:
        sessionData.current_question ??
        1,

      attempted_questions:
        sessionData.attempted_questions ??
        0,

      readiness_score:
        sessionData.readiness_score ??
        0,

      questions,
    };
  };

/* =========================================================
   GET INTERVIEW QUESTIONS
========================================================= */

export const getInterviewQuestions =
  async (
    sessionId: string | number
  ): Promise<InterviewQuestion[]> => {
    const session =
      await getInterviewSession(
        sessionId
      );

    return session.questions;
  };

/* =========================================================
   SUBMIT INTERVIEW ANSWER
========================================================= */

export const submitInterviewAnswer =
  async (
    sessionId: string | number,
    data: {
      question_id: number;
      answer: string;
    }
  ) => {
    if (
      sessionId === undefined ||
      sessionId === null ||
      sessionId === ""
    ) {
      throw new Error(
        "Interview session ID is missing."
      );
    }

    if (
      data.question_id === undefined ||
      data.question_id === null
    ) {
      throw new Error(
        "Question ID is missing."
      );
    }

    if (!data.answer?.trim()) {
      throw new Error(
        "Answer cannot be empty."
      );
    }

    const response =
      await api.post(
        `/interview-prep/session/${sessionId}/answer/`,
        {
          question_id:
            data.question_id,

          answer:
            data.answer.trim(),
        }
      );

    return response.data;
  };

/* =========================================================
   GET INTERVIEW RESULT
========================================================= */

export const getInterviewResult =
  async (
    sessionId: string | number
  ) => {
    if (
      sessionId === undefined ||
      sessionId === null ||
      sessionId === ""
    ) {
      throw new Error(
        "Interview session ID is missing."
      );
    }

    const response =
      await api.get(
        `/interview-prep/session/${sessionId}/result/`
      );

    const responseData =
      response.data;

    const result =
      responseData?.result ||
      responseData?.data ||
      responseData;

    if (!result) {
      throw new Error(
        "Interview result was not returned by the backend."
      );
    }

    return result;
  };

/* =========================================================
   QUICK PRACTICE - GENERATE QUESTIONS
========================================================= */

export const generateQuickPracticeQuestions =
  async (
    practiceType: QuickPracticeType,
    options?: {
      topic?: string;
      difficulty?: string;
      question_count?: number;
      target_role?: string;
    }
  ): Promise<QuickPracticeQuestion[]> => {
    const response =
      await api.post(
        "/interview-prep/quick-practice/",
        {
          practice_type:
            practiceType,

          topic:
            options?.topic || "",

          difficulty:
            options?.difficulty ||
            "medium",

          question_count:
            options?.question_count ||
            5,

          target_role:
            options?.target_role ||
            "Software Engineer",
        }
      );

    const questions =
      response.data?.questions ||
      [];

    return questions.map(
      (
        question: any,
        index: number
      ) => ({
        id:
          question.id,

        question_number:
          question.question_number ||
          index + 1,

        category:
          question.category ||
          practiceType,

        question_text:
          question.question_text ||
          question.question ||
          "",
      })
    );
  };

/* =========================================================
   QUICK PRACTICE - EVALUATE ANSWER
========================================================= */

export const evaluateQuickPracticeAnswer =
  async (
    data: {
      question: string;

      answer: string;

      category?: string;

      practice_type:
        QuickPracticeType;
    }
  ): Promise<QuickPracticeEvaluation> => {
    if (!data.question?.trim()) {
      throw new Error(
        "Question is required."
      );
    }

    if (!data.answer?.trim()) {
      throw new Error(
        "Answer cannot be empty."
      );
    }

    const response =
      await api.post(
        "/interview-prep/quick-practice/evaluate/",
        {
          question:
            data.question.trim(),

          answer:
            data.answer.trim(),

          category:
            data.category ||
            "General",

          practice_type:
            data.practice_type,
        }
      );

    const responseData =
      response.data;

    return (
      responseData?.evaluation ||
      responseData?.result ||
      responseData?.data ||
      responseData
    );
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default api;