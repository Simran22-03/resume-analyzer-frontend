import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// PROFESSIONAL SUMMARY
// =========================================================

export const generateProfessionalSummary = async (
  jobDescription: string,
  resumeData: any,
  token: string
) => {
  const response = await api.post(
    "/resume-builder/resumes/generate-summary/",
    {
      job_description: jobDescription,
      resume_data: resumeData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export default api;