"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
  DragEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  FileText,
  Upload,
  X,
  Search,
  FileSearch,
  FileCheck,
  AlertCircle,
  Plus,
  ArrowLeft,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import api from "../../../lib/api";
import EmployeeSidebar from "../../../components/EmployeeSidebar";


type ResumeRecord = {
  id: number;
  name: string;
  date: string;
  status: string;
};


type ApiResume = {
  id: number;
  file: string;
  uploaded_at: string;
  is_analyzed: boolean;
};


export default function ResumeAnalyzerPage() {

  const router = useRouter();


  const [pageView, setPageView] =
    useState<"history" | "analyzer">(
      "history"
    );


  const [analyzedResumes, setAnalyzedResumes] =
    useState<ResumeRecord[]>([]);


  const [searchQuery, setSearchQuery] = useState("");


  const [file, setFile] =
    useState<File | null>(null);


  const [jobDescription, setJobDescription] =
    useState("");


  const [isDragging, setIsDragging] =
    useState(false);


  const [isAnalyzing, setIsAnalyzing] =
    useState(false);


  const [showResults, setShowResults] =
    useState(false);

  const [menuOpenId, setMenuOpenId] =
    useState<number | null>(null);

  const [renameId, setRenameId] =
    useState<number | null>(null);

  const [renameValue, setRenameValue] =
    useState("");





  /*
   * =========================================================
   * GET RESUMES FROM BACKEND
   * =========================================================
   */

  useEffect(() => {

    const fetchResumes = async () => {

      try {

        const response =
          await api.get(
            "/dashboard/resumes/"
          );


        const data: ApiResume[] =
          response.data;


        const formattedResumes: ResumeRecord[] =
          data.map((resume) => ({

            id: resume.id,

            name:
              resume.file
                ?.split("/")
                .pop() ||
              "Resume",

            date:
              new Date(
                resume.uploaded_at
              ).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              ),

            status:
              resume.is_analyzed
                ? "Analyzed"
                : "Uploaded",
          }));


        setAnalyzedResumes(
          formattedResumes
        );

      } catch (error) {

        console.error(
          "Error fetching resumes:",
          error
        );

      }

    };


    fetchResumes();

  }, []);


  /*
   * =========================================================
   * FILE HANDLING
   * =========================================================
   */

  const handleFile = (
    selectedFile: File | undefined
  ) => {

    if (!selectedFile) {
      return;
    }


    if (
      selectedFile.type !==
      "application/pdf"
    ) {

      alert(
        "Please upload a PDF resume."
      );

      return;
    }


    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {

      alert(
        "File size should not exceed 10MB."
      );

      return;
    }


    setFile(selectedFile);

    setShowResults(false);

  };


  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile =
      e.target.files?.[0];

    handleFile(selectedFile);

  };


  const handleDrop = (
    e: DragEvent<HTMLDivElement>
  ) => {

    e.preventDefault();

    setIsDragging(false);

    const droppedFile =
      e.dataTransfer.files?.[0];

    handleFile(droppedFile);

  };


  const handleDragOver = (
    e: DragEvent<HTMLDivElement>
  ) => {

    e.preventDefault();

    setIsDragging(true);

  };


  const handleDragLeave = () => {

    setIsDragging(false);

  };


  const removeFile = () => {

    setFile(null);

    setShowResults(false);

  };


  /*
   * =========================================================
   * ADD RESUME
   * =========================================================
   */

  const handleAddResume = () => {

    setFile(null);

    setJobDescription("");

    setShowResults(false);

    setIsAnalyzing(false);

    setPageView("analyzer");

  };


  /*
   * =========================================================
   * BACK TO RESUMES
   * =========================================================
   */

  const handleBackToResumes = () => {

    setPageView("history");

    setFile(null);

    setJobDescription("");

    setShowResults(false);

    setIsAnalyzing(false);

  };


  /*
   * =========================================================
   * UPLOAD RESUME
   * =========================================================
   */

  const handleAnalyze = async () => {

    if (!file) {
      alert(
        "Please upload your resume first."
      );

      return;
    }


    if (!jobDescription.trim()) {
      alert(
        "Please enter the job description."
      );

      return;
    }


    setIsAnalyzing(true);
    setShowResults(false);


    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );


      /*
       * Axios automatically gets:
       *
       * - API base URL from api.ts
       * - JWT token from api.ts interceptor
       */

      const uploadResponse =
        await api.post(
          "/dashboard/resumes/upload/",
          formData
        );


      const uploadedResume =
        uploadResponse.data?.resume;


      if (!uploadedResume?.id) {
        throw new Error(
          "Resume ID was not returned by the server."
        );
      }


      /*
       * Analyze the uploaded resume on the backend.
       * Wait for the analysis to finish before redirecting.
       */

      await api.post(
        `/dashboard/resumes/${uploadedResume.id}/analyze/`,
        {
          job_description:
            jobDescription,
        }
      );


      /*
       * Open the saved analysis report for
       * the exact resume that was just analyzed.
       */

      router.push(
        `/employee/resume-analyzer/${uploadedResume.id}`
      );

    } catch (error: any) {

      console.error(
        "Resume analysis failed:",
        error
      );


      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.response?.data?.file?.[0];


      alert(
        backendMessage ||
        "Resume analysis failed. Please try again."
      );

    } finally {

      setIsAnalyzing(false);

    }
  };


  const saveRename = async () => {
    if (
      renameId === null ||
      !renameValue.trim()
    ) {
      return;
    }

    let newName =
      renameValue.trim();

    if (
      !newName.toLowerCase().endsWith(".pdf")
    ) {
      newName = `${newName}.pdf`;
    }

    try {
      const response =
        await api.patch(
          `/dashboard/resumes/${renameId}/`,
          {
            name: newName,
          }
        );

      const updatedFile =
        response.data?.resume?.file;

      const updatedName =
        updatedFile
          ?.split("/")
          .pop() || newName;

      setAnalyzedResumes(
        (previous) =>
          previous.map((item) =>
            item.id === renameId
              ? {
                  ...item,
                  name: updatedName,
                }
              : item
          )
      );

      setRenameId(null);
      setRenameValue("");
      setMenuOpenId(null);

    } catch (error: any) {
      console.error(
        "Error renaming resume:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Unable to rename the resume."
      );
    }
  };


  const handleDeleteResume = async (
    resume: ResumeRecord
  ) => {
    setMenuOpenId(null);

    if (
      !window.confirm(
        `Delete "${resume.name}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/dashboard/resumes/${resume.id}/`
      );

      setAnalyzedResumes(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== resume.id
          )
      );

    } catch (error: any) {
      console.error(
        "Error deleting resume:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Unable to delete the resume."
      );
    }
  };


  /*
   * =========================================================
   * VIEW RESUME
   * =========================================================
   */

  const handleViewResume = (
    resume: ResumeRecord
  ) => {
    window.location.assign(
      `/employee/resume-analyzer/${resume.id}`
    );
  };



  /*
   * =========================================================
   * UI
   * =========================================================
   */

  const filteredResumes =
    analyzedResumes.filter((resume) =>
      resume.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    );


  return (

    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">


        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <EmployeeSidebar />


        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <main
          className="min-h-screen flex-1 ml-[236px]"
        >


          {/* HEADER */}

          <header className="flex h-[70px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

            <div>

              <h2 className="text-[19px] font-bold text-[#102a56]">
                Resume Analyzer
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Analyze and manage your resumes.
              </p>

            </div>


          </header>


          {/* =====================================================
              PAGE CONTENT
          ===================================================== */}

          <div className="min-h-[calc(100vh-70px)] overflow-y-auto px-6 py-5">


            {/* =================================================
                RESUME LIST
            ================================================= */}

            {pageView === "history" && (

              <>


                {/* SEARCH + ADD RESUME */}

                <div className="mb-5 flex items-center gap-3">

                  <div className="relative w-full max-w-[520px]">

                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b98aa]"
                    />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      placeholder="Search resumes..."
                      className="h-[42px] w-full rounded-lg border border-[#dfe7f1] bg-white pl-9 pr-4 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#8eb3ee] focus:ring-2 focus:ring-[#edf4ff]"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={handleAddResume}
                    className="ml-auto flex shrink-0 items-center gap-2 rounded-lg bg-[#2463eb] px-4 py-2.5 text-[10px] font-semibold text-white shadow-[0_3px_8px_rgba(36,99,235,0.16)] transition hover:bg-[#1f57d0]"
                  >
                    <Plus size={14} />
                    Add Resume
                  </button>

                </div>


                {/* TABLE */}

                <section className="overflow-hidden rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">


                  {/* TABLE HEADER */}

                  <div className="grid grid-cols-[1.6fr_1fr_1fr_100px] border-b border-[#e8edf4] bg-[#fbfcfe] px-5 py-3">

                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8190a6]">
                      Resume
                    </p>

                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8190a6]">
                      Date
                    </p>

                    <p className="text-[9px] font-semibold uppercase tracking-wide text-[#8190a6]">
                      Status
                    </p>

                    <p className="text-right text-[9px] font-semibold uppercase tracking-wide text-[#8190a6]">
                      Action
                    </p>

                  </div>


                  {/* EMPTY STATE */}

                  {filteredResumes.length ===
                    0 && (

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">

                        <FileSearch
                          size={24}
                        />

                      </div>


                      <h3 className="mt-4 text-[13px] font-semibold text-[#52647d]">
                        {searchQuery.trim()
                          ? "No matching resumes"
                          : "No resumes analyzed yet"}
                      </h3>


                      <p className="mt-1 max-w-[300px] text-[9px] leading-relaxed text-[#8b98aa]">
                        {searchQuery.trim()
                          ? "Try a different resume name."
                          : "Add your resume to analyze it against a job description."}
                      </p>


                      {!searchQuery.trim() && (
                        <button
                          type="button"
                          onClick={handleAddResume}
                          className="mt-4 flex items-center gap-2 rounded-lg border border-[#d8e4f7] bg-[#f3f7ff] px-3.5 py-2 text-[10px] font-semibold text-[#2463eb] hover:bg-[#eaf1ff]"
                        >
                          <Plus size={13} />
                          Add Your First Resume
                        </button>
                      )}

                    </div>

                  )}


                  {/* RESUME ROWS */}

                  {filteredResumes.map(
                    (resume) => (

                      <div
                        key={resume.id}
                        className="relative grid cursor-pointer grid-cols-[1.6fr_1fr_1fr_100px] items-center border-b border-[#edf1f5] px-5 py-4 last:border-b-0 hover:bg-[#fbfcfe]"
                        onClick={() =>
                          handleViewResume(resume)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
                            e.preventDefault();
                            handleViewResume(resume);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                            <FileText size={16} />
                          </div>

                          <div className="min-w-0">
                            {renameId === resume.id ? (
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                <input
                                  autoFocus
                                  value={renameValue}
                                  onChange={(e) =>
                                    setRenameValue(
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter"
                                    ) {
                                      saveRename();
                                    }

                                    if (
                                      e.key === "Escape"
                                    ) {
                                      setRenameId(null);
                                      setRenameValue("");
                                    }
                                  }}
                                  className="h-8 w-[220px] rounded-md border border-[#cbd8e8] px-2 text-[10px] text-[#102a56] outline-none focus:border-[#8eb3ee] focus:ring-2 focus:ring-[#edf4ff]"
                                />

                                <button
                                  type="button"
                                  onClick={saveRename}
                                  className="rounded-md bg-[#2463eb] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#1f57d0]"
                                >
                                  Save
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenameId(null);
                                    setRenameValue("");
                                  }}
                                  className="rounded-md border border-[#dfe7f1] px-2.5 py-1.5 text-[9px] font-medium text-[#60728d] hover:text-red-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="truncate text-[10px] font-semibold text-[#102a56]">
                                  {resume.name}
                                </p>

                                <p className="mt-0.5 text-[8px] text-[#8190a6]">
                                  Resume analysis
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-[9px] text-[#60728d]">
                          {resume.date}
                        </p>

                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf7f0] px-2.5 py-1 text-[8px] font-semibold text-[#21a366]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#21a366]" />
                            {resume.status}
                          </span>
                        </div>

                        <div
                          className="relative flex justify-end"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            aria-label="Resume options"
                            aria-expanded={
                              menuOpenId === resume.id
                            }
                            onClick={() =>
                              setMenuOpenId(
                                menuOpenId === resume.id
                                  ? null
                                  : resume.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe7f1] text-[#60728d] hover:border-[#c7d7ee] hover:text-[#2463eb]"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {menuOpenId ===
                            resume.id && (
                            <div className="absolute right-0 top-10 z-30 w-[145px] rounded-lg border border-[#dfe7f1] bg-white p-1.5 shadow-[0_8px_24px_rgba(20,40,70,0.12)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setRenameId(resume.id);
                                  setRenameValue(
                                    resume.name.replace(
                                      /\.pdf$/i,
                                      ""
                                    )
                                  );
                                  setMenuOpenId(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[10px] font-medium text-[#52647d] hover:bg-[#f5f8fc] hover:text-[#2463eb]"
                              >
                                <Pencil size={13} />
                                Rename
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteResume(
                                    resume
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[10px] font-medium text-[#52647d] hover:bg-[#fff4f4] hover:text-red-500"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    )
                  )}

                </section>

              </>

            )}


            {/* =================================================
                ANALYZER
            ================================================= */}

            {pageView === "analyzer" && (

              <>


                {/* BACK */}

                <button
                  type="button"
                  onClick={
                    handleBackToResumes
                  }
                  className="mb-4 flex items-center gap-2 text-[10px] font-medium text-[#60728d] hover:text-[#2463eb]"
                >

                  <ArrowLeft
                    size={14}
                  />

                  Back

                </button>


                {/* TITLE */}


                {/* ANALYZER CARD */}

                <section className="rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">


                  {/* FORM */}

                  <div className="grid grid-cols-2 gap-5 p-5">


                    {/* UPLOAD */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label className="text-[11px] font-semibold text-[#102a56]">
                          Upload Resume
                        </label>

                        <span className="text-[9px] text-[#8190a6]">
                          PDF only
                        </span>

                      </div>


                      <div
                        onDrop={
                          handleDrop
                        }
                        onDragOver={
                          handleDragOver
                        }
                        onDragLeave={
                          handleDragLeave
                        }
                        className={`relative flex h-[245px] flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                          isDragging
                            ? "border-[#2463eb] bg-[#edf4ff]"
                            : file
                            ? "border-[#b9d0f5] bg-[#f8fbff]"
                            : "border-[#d7e1ed] bg-[#fbfcfe] hover:border-[#aac5eb] hover:bg-[#f8fbff]"
                        }`}
                      >


                        {!file ? (

                          <>

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">

                              <Upload
                                size={24}
                              />

                            </div>


                            <p className="mt-4 text-[12px] font-semibold text-[#102a56]">
                              Drag & drop your resume
                            </p>


                            <p className="mt-1 text-[10px] text-[#8190a6]">
                              or click to browse files
                            </p>


                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={
                                handleFileChange
                              }
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />

                          </>

                        ) : (

                          <>

                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7f0] text-[#21a366]">

                              <FileCheck
                                size={25}
                              />

                            </div>


                            <p className="mt-4 max-w-[300px] truncate px-4 text-[12px] font-semibold text-[#102a56]">
                              {file.name}
                            </p>


                            <p className="mt-1 text-[9px] text-[#21a366]">
                              Resume uploaded successfully
                            </p>


                            <button
                              type="button"
                              onClick={
                                removeFile
                              }
                              className="mt-4 flex items-center gap-1.5 rounded-lg border border-[#dfe7f1] bg-white px-3 py-1.5 text-[9px] font-medium text-[#60728d] hover:text-red-500"
                            >

                              <X
                                size={12}
                              />

                              Remove / Change

                            </button>

                          </>

                        )}

                      </div>

                    </div>


                    {/* JOB DESCRIPTION */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label className="text-[11px] font-semibold text-[#102a56]">
                          Job Description
                        </label>


                        <span className="text-[9px] text-[#8190a6]">
                          {jobDescription.length}/5000
                        </span>

                      </div>


                      <textarea
                        value={
                          jobDescription
                        }
                        onChange={(e) => {

                          if (
                            e.target.value.length <=
                            5000
                          ) {

                            setJobDescription(
                              e.target.value
                            );

                            setShowResults(
                              false
                            );

                          }

                        }}
                        placeholder="Paste the job description here..."
                        className="h-[245px] w-full resize-none rounded-xl border border-[#d7e1ed] bg-[#fbfcfe] p-4 text-[11px] leading-relaxed text-[#102a56] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#8eb3ee] focus:bg-white focus:ring-2 focus:ring-[#edf4ff]"
                      />

                    </div>

                  </div>


                  {/* BUTTON */}

                  <div className="px-5 pb-5">

                    <button
                      type="button"
                      onClick={
                        handleAnalyze
                      }
                      disabled={
                        isAnalyzing
                      }
                      className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#2463eb] text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(36,99,235,0.18)] transition hover:bg-[#1f57d0] disabled:cursor-not-allowed disabled:opacity-70"
                    >

                      <Search
                        size={17}
                      />


                      {isAnalyzing
                        ? "Uploading Resume..."
                        : "Analyze My Resume"}


                      {!isAnalyzing && (
                        <ArrowIcon />
                      )}

                    </button>

                  </div>

                </section>


                {/* RESULTS */}

                {showResults && (

                  <section className="mt-4 rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

                    <div className="border-b border-[#e8edf4] px-5 py-3.5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf7f0] text-[#21a366]">

                          <FileCheck
                            size={16}
                          />

                        </div>


                        <div>

                          <h2 className="text-[13px] font-bold text-[#102a56]">
                            Analysis Results
                          </h2>


                          <p className="text-[9px] text-[#8190a6]">
                            Your resume has been uploaded successfully.
                          </p>

                        </div>

                      </div>

                    </div>


                    <div className="grid grid-cols-3 gap-4 p-5">


                      <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                        <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                          Resume
                        </p>

                        <p className="mt-2 text-[20px] font-bold text-[#2463eb]">
                          Uploaded
                        </p>

                      </div>


                      <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                        <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                          Skills
                        </p>

                        <p className="mt-2 text-[12px] font-semibold text-[#102a56]">
                          AI analysis next
                        </p>

                      </div>


                      <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                        <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                          Suggestions
                        </p>

                        <p className="mt-2 text-[12px] font-semibold text-[#102a56]">
                          AI analysis next
                        </p>

                      </div>

                    </div>

                  </section>

                )}


                {!showResults && (

                  <div className="mt-3 flex items-center justify-center gap-1.5 pb-4 text-[9px] text-[#9aa8ba]">

                    <AlertCircle
                      size={12}
                    />

                    Upload a PDF and add a job description to begin analysis.

                  </div>

                )}

              </>

            )}

          </div>

        </main>


      </div>

    </div>

  );
}
/*
 * =========================================================
 * ARROW ICON
 * =========================================================
 */

function ArrowIcon() {

  return (

    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path d="M5 12h14" />

      <path d="m13 6 6 6-6 6" />

    </svg>

  );

}