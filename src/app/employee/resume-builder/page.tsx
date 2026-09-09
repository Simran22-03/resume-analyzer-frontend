"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";
import EmployeeSidebar from "@/components/EmployeeSidebar";
import { api } from "@/lib/api";

type Resume = {
  id: number;
  title: string;
  full_name: string;
  professional_title: string;
  created_at: string;
  updated_at: string;
  is_generated: boolean;
};

export default function ResumeBuilderPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // TOKEN
  // ==============================

  const getAccessToken = () => {
    const access =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token");

    if (!access) {
      return null;
    }

    return access.replace(/^"|"$/g, "");
  };

  // ==============================
  // FETCH RESUMES
  // ==============================

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.get(
        `/resume-builder/resumes/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResumes(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err: any) {
      console.error("Resume fetch error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      }

      setError("Unable to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ==============================
  // SEARCH
  // ==============================

  const filteredResumes = resumes.filter((resume) => {
    const title =
      resume.title?.toLowerCase() || "";

    const name =
      resume.full_name?.toLowerCase() || "";

    return (
      title.includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase())
    );
  });

  // ==============================
  // CREATE RESUME
  // ==============================

  const handleCreateResume = () => {
    router.push(
      "/employee/resume-builder/create"
    );
  };

  // ==============================
  // VIEW RESUME
  // ==============================

  const handleViewResume = (id: number) => {
    router.push(
      `/employee/resume-builder/${id}`
    );
  };

  // ==============================
  // DELETE RESUME
  // ==============================

  const handleDelete = async (id: number) => {
    const resume = resumes.find(
      (item) => item.id === id
    );

    if (!resume) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${resume.title}"?`
    );

    if (!confirmed) {
      setOpenMenu(null);
      return;
    }

    try {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      await api.delete(
        `/resume-builder/resumes/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResumes((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      setOpenMenu(null);
    } catch (err: any) {
      console.error(
        "Delete resume error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      }

      alert("Unable to delete resume.");
    }
  };

  // ==============================
  // DOWNLOAD RESUME
  // ==============================

  const handleDownload = async (id: number) => {
    try {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.get(
        `/resume-builder/resumes/${id}/download/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const resume = resumes.find(
        (item) => item.id === id
      );

      link.download =
        `${resume?.title || "resume"}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setOpenMenu(null);
    } catch (err: any) {
      console.error(
        "Download resume error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      }

      alert("Unable to download resume.");
    }
  };

  // ==============================
  // RENAME
  // ==============================

  const handleRename = async (id: number) => {
    const resume = resumes.find(
      (item) => item.id === id
    );

    if (!resume) return;

    const newTitle = window.prompt(
      "Enter new resume name:",
      resume.title
    );

    if (
      !newTitle ||
      newTitle.trim() === ""
    ) {
      setOpenMenu(null);
      return;
    }

    try {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.patch(
        `/resume-builder/resumes/${id}/`,
        {
          title: newTitle.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      setResumes((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                title:
                  response.data.title ||
                  newTitle.trim(),
              }
            : item
        )
      );

      setOpenMenu(null);
    } catch (err: any) {
      console.error(
        "Rename resume error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      }

      alert("Unable to rename resume.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <EmployeeSidebar />

      <main className="ml-[236px] min-h-screen">

        {/* HEADER */}

        <div className="flex h-[74px] items-center border-b border-[#e3eaf3] bg-white px-6">
          <div>
            <h1 className="text-[18px] font-bold leading-tight text-[#102a56]">
              Resume Builder
            </h1>

            <p className="mt-1 text-[10px] text-[#6f819d]">
              Create and manage your resumes.
            </p>
          </div>
        </div>

        {/* CONTENT */}

        <div className="px-6 py-4">

          {/* SEARCH + CREATE */}

          <div className="mb-4 flex items-center justify-between">

            <div className="relative w-[470px]">

              <Search
                size={16}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da0bb]"
              />

              <input
                type="text"
                placeholder="Search resumes..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-[40px] w-full rounded-lg border border-[#dce5f0] bg-white pl-9 pr-3 text-[12px] text-[#102a56] outline-none placeholder:text-[#91a3bd] focus:border-[#2463eb]"
              />

            </div>

            <button
              type="button"
              onClick={handleCreateResume}
              className="flex h-[40px] items-center gap-1.5 rounded-lg bg-[#2463eb] px-4 text-[12px] font-medium text-white shadow-sm transition hover:bg-[#1d56d8]"
            >
              <Plus
                size={15}
                strokeWidth={2}
              />

              Create Resume
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-[10px] text-red-500">
              {error}
            </div>
          )}

          {/* TABLE */}

          <div className="overflow-visible rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(15,35,70,0.05)]">

            {/* TABLE HEADER */}

            <div className="grid h-[38px] grid-cols-[1fr_180px_180px_55px] items-center border-b border-[#e5ebf3] px-5">

              <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-[#72849e]">
                Resume
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-[#72849e]">
                Date
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-[#72849e]">
                Status
              </span>

              <span className="text-right text-[9px] font-semibold uppercase tracking-[0.05em] text-[#72849e]">
                Action
              </span>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="flex min-h-[210px] items-center justify-center">

                <p className="text-[10px] text-[#8190a6]">
                  Loading resumes...
                </p>

              </div>

            ) : filteredResumes.length > 0 ? (

              filteredResumes.map((resume) => {

                const formattedDate =
                  resume.updated_at
                    ? new Date(
                        resume.updated_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "—";

                return (
                  <div
                    key={resume.id}
                    onClick={() =>
                      handleViewResume(
                        resume.id
                      )
                    }
                    className="grid h-[68px] cursor-pointer grid-cols-[1fr_180px_180px_55px] items-center border-b border-[#e5ebf3] px-5 transition hover:bg-[#f8faff]"
                  >

                    {/* RESUME */}

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">

                        <FileText
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div>

                        <p className="text-[11px] font-semibold text-[#102a56]">
                          {resume.title ||
                            `Resume ${resume.id}`}
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#8190a6]">
                          {resume.full_name ||
                            "Resume builder"}
                        </p>

                      </div>

                    </div>

                    {/* DATE */}

                    <span className="text-[10px] text-[#60728d]">
                      {formattedDate}
                    </span>

                    {/* STATUS */}

                    <div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold ${
                          resume.is_generated
                            ? "bg-[#e9f8f1] text-[#15945d]"
                            : "bg-[#fff7e8] text-[#c47a00]"
                        }`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            resume.is_generated
                              ? "bg-[#15945d]"
                              : "bg-[#c47a00]"
                          }`}
                        />

                        {resume.is_generated
                          ? "Generated"
                          : "Created"}

                      </span>

                    </div>

                    {/* ACTION */}

                    <div
                      className="relative flex justify-end"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu ===
                              resume.id
                              ? null
                              : resume.id
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce5f0] bg-white text-[#60728d] transition hover:border-[#2463eb] hover:text-[#2463eb]"
                      >

                        <MoreVertical
                          size={15}
                        />

                      </button>

                      {/* DROPDOWN */}

                      {openMenu ===
                        resume.id && (

                        <div className="absolute right-0 top-9 z-50 w-[135px] overflow-hidden rounded-lg border border-[#dce5f0] bg-white py-1 shadow-lg">

                          {/* DOWNLOAD */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                resume.id
                              )
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-[#52647d] hover:bg-[#f5f8fc] hover:text-[#2463eb]"
                          >

                            <Download
                              size={12}
                            />

                            Download

                          </button>

                          {/* RENAME */}

                          <button
                            type="button"
                            onClick={() =>
                              handleRename(
                                resume.id
                              )
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-[#52647d] hover:bg-[#f5f8fc] hover:text-[#2463eb]"
                          >

                            <Pencil
                              size={12}
                            />

                            Rename

                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                resume.id
                              )
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-[#52647d] hover:bg-[#fff5f5] hover:text-red-500"
                          >

                            <Trash2
                              size={12}
                            />

                            Delete

                          </button>

                        </div>

                      )}

                    </div>

                  </div>
                );
              })

            ) : (

              /* EMPTY STATE */

              <div className="flex min-h-[210px] flex-col items-center justify-center">

                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">

                  <FileText
                    size={18}
                    strokeWidth={1.8}
                  />

                </div>

                <p className="text-[11px] font-semibold text-[#102a56]">
                  {search
                    ? "No resumes found"
                    : "No resumes created yet"}
                </p>

                <p className="mt-1 text-[9px] text-[#8190a6]">
                  {search
                    ? "Try a different search."
                    : "Create your first resume to get started."}
                </p>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}