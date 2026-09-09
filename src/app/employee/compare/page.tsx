"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import {
  Users,
  Upload,
  X,
  ArrowRight,
  FileCheck,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";

type ResumeFile = File | null;

export default function CompareResumePage() {
  const [myResume, setMyResume] =
    useState<ResumeFile>(null);

  const [compareResume, setCompareResume] =
    useState<ResumeFile>(null);

  const [isDraggingMyResume, setIsDraggingMyResume] =
    useState(false);

  const [isDraggingCompareResume, setIsDraggingCompareResume] =
    useState(false);

  const [isComparing, setIsComparing] =
    useState(false);

  const [showResults, setShowResults] =
    useState(false);

  /* =====================================================
     FILE VALIDATION
  ===================================================== */

  const validateFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size should not exceed 10MB.");
      return false;
    }

    return true;
  };

  /* =====================================================
     MY RESUME
  ===================================================== */

  const handleMyResume = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!validateFile(selectedFile)) return;

    setMyResume(selectedFile);
    setShowResults(false);
  };

  const handleMyResumeChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    handleMyResume(e.target.files?.[0]);
  };

  const handleMyResumeDrop = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setIsDraggingMyResume(false);

    handleMyResume(e.dataTransfer.files?.[0]);
  };

  /* =====================================================
     COMPARE RESUME
  ===================================================== */

  const handleCompareResume = (
    selectedFile?: File
  ) => {
    if (!selectedFile) return;

    if (!validateFile(selectedFile)) return;

    setCompareResume(selectedFile);
    setShowResults(false);
  };

  const handleCompareResumeChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    handleCompareResume(e.target.files?.[0]);
  };

  const handleCompareResumeDrop = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setIsDraggingCompareResume(false);

    handleCompareResume(
      e.dataTransfer.files?.[0]
    );
  };

  /* =====================================================
     REMOVE FILES
  ===================================================== */

  const removeMyResume = () => {
    setMyResume(null);
    setShowResults(false);
  };

  const removeCompareResume = () => {
    setCompareResume(null);
    setShowResults(false);
  };

  /* =====================================================
     COMPARE
  ===================================================== */

  const handleCompare = () => {
    if (!myResume) {
      alert("Please upload your resume first.");
      return;
    }

    if (!compareResume) {
      alert("Please upload the second resume.");
      return;
    }

    setIsComparing(true);
    setShowResults(false);

    /*
      Temporary frontend behaviour.

      Later this button will call the Django
      comparison API.
    */

    setTimeout(() => {
      setIsComparing(false);
      setShowResults(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#102a56]">

      <div className="flex min-h-screen">

        {/* =================================================
            EXISTING EMPLOYEE SIDEBAR
        ================================================= */}

        <EmployeeSidebar />

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="ml-[236px] min-h-screen flex-1">

          {/* HEADER */}

          <header className="flex h-[70px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

            <div>
              <h2 className="text-[19px] font-bold">
                Compare Resume
              </h2>

              <p className="mt-0.5 text-[10px] text-[#71829c]">
                Compare your resume with another candidate&apos;s resume.
              </p>
            </div>

          </header>

          {/* =================================================
              PAGE
          ================================================= */}

          <div className="min-h-[calc(100vh-70px)] overflow-y-auto px-6 py-5">

            {/* =================================================
                COMPARISON CARD
            ================================================= */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

              {/* CARD HEADER */}

              <div className="flex items-center justify-between border-b border-[#e8edf4] px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                    <Users size={18} />
                  </div>

                  <div>

                    <h2 className="text-[14px] font-bold">
                      Resume Comparison
                    </h2>

                    <p className="text-[9px] text-[#8190a6]">
                      Upload two resumes to compare them.
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[9px] font-semibold text-[#2463eb]">
                  PDF • Max 10MB
                </span>

              </div>

              {/* =================================================
                  TWO RESUMES
              ================================================= */}

              <div className="grid grid-cols-2 gap-5 p-5">

                {/* MY RESUME */}

                <ResumeUploadBox
                  title="Your Resume"
                  file={myResume}
                  isDragging={isDraggingMyResume}
                  setIsDragging={
                    setIsDraggingMyResume
                  }
                  onFileChange={
                    handleMyResumeChange
                  }
                  onDrop={handleMyResumeDrop}
                  onRemove={removeMyResume}
                />

                {/* SECOND RESUME */}

                <ResumeUploadBox
                  title="Resume to Compare"
                  file={compareResume}
                  isDragging={
                    isDraggingCompareResume
                  }
                  setIsDragging={
                    setIsDraggingCompareResume
                  }
                  onFileChange={
                    handleCompareResumeChange
                  }
                  onDrop={
                    handleCompareResumeDrop
                  }
                  onRemove={
                    removeCompareResume
                  }
                />

              </div>

              {/* COMPARE BUTTON */}

              <div className="px-5 pb-5">

                <button
                  type="button"
                  onClick={handleCompare}
                  disabled={isComparing}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#2463eb] text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(36,99,235,0.18)] transition hover:bg-[#1f57d0] disabled:cursor-not-allowed disabled:opacity-70"
                >

                  <Target size={17} />

                  {isComparing
                    ? "Comparing Resumes..."
                    : "Compare Resumes"}

                  {!isComparing && (
                    <ArrowRight size={15} />
                  )}

                </button>

              </div>

            </section>

            {/* =================================================
                RESULTS
            ================================================= */}

            {showResults && (

              <section className="mt-4 rounded-xl border border-[#dfe7f1] bg-white shadow-[0_1px_3px_rgba(20,40,70,0.04)]">

                <div className="border-b border-[#e8edf4] px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf7f0] text-[#21a366]">
                      <FileCheck size={18} />
                    </div>

                    <div>

                      <h2 className="text-[14px] font-bold">
                        Comparison Results
                      </h2>

                      <p className="text-[9px] text-[#8190a6]">
                        Overview of the comparison.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-4 p-5">

                  {/* SCORE */}

                  <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                    <div className="flex items-center gap-2">

                      <Target
                        size={15}
                        className="text-[#2463eb]"
                      />

                      <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                        Overall Match
                      </p>

                    </div>

                    <p className="mt-2 text-[22px] font-bold text-[#2463eb]">
                      78%
                    </p>

                  </div>

                  {/* STRENGTH */}

                  <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={15}
                        className="text-[#21a366]"
                      />

                      <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                        Stronger Areas
                      </p>

                    </div>

                    <p className="mt-2 text-[12px] font-semibold">
                      Skills &amp; Experience
                    </p>

                  </div>

                  {/* IMPROVEMENT */}

                  <div className="rounded-lg border border-[#e4ebf3] bg-[#f9fbfd] p-4">

                    <div className="flex items-center gap-2">

                      <AlertCircle
                        size={15}
                        className="text-[#e5a11a]"
                      />

                      <p className="text-[9px] font-semibold uppercase text-[#8190a6]">
                        Improvement
                      </p>

                    </div>

                    <p className="mt-2 text-[12px] font-semibold">
                      Review missing skills
                    </p>

                  </div>

                </div>

              </section>

            )}

            {!showResults && (

              <div className="flex items-center justify-center gap-1.5 py-4 text-[9px] text-[#9aa8ba]">

                <AlertCircle size={12} />

                Upload both resumes to start comparison.

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}


/* =========================================================
   RESUME UPLOAD COMPONENT
========================================================= */

function ResumeUploadBox({
  title,
  file,
  isDragging,
  setIsDragging,
  onFileChange,
  onDrop,
  onRemove,
}: {
  title: string;
  file: ResumeFile;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onDrop: (
    event: DragEvent<HTMLDivElement>
  ) => void;
  onRemove: () => void;
}) {

  return (

    <div>

      {/* TITLE */}

      <div className="mb-2 flex items-center justify-between">

        <label className="text-[11px] font-semibold">
          {title}
        </label>

        <span className="text-[9px] text-[#8190a6]">
          PDF only
        </span>

      </div>

      {/* DROP AREA */}

      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() =>
          setIsDragging(false)
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
              <Upload size={24} />
            </div>

            <p className="mt-4 text-[12px] font-semibold">
              Drag &amp; drop resume
            </p>

            <p className="mt-1 text-[10px] text-[#8190a6]">
              or click to browse files
            </p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={onFileChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

          </>

        ) : (

          <>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7f0] text-[#21a366]">
              <FileCheck size={25} />
            </div>

            <p className="mt-4 max-w-[280px] truncate px-4 text-[12px] font-semibold">
              {file.name}
            </p>

            <p className="mt-1 text-[9px] text-[#21a366]">
              Resume uploaded successfully
            </p>

            <button
              type="button"
              onClick={onRemove}
              className="mt-4 flex items-center gap-1.5 rounded-lg border border-[#dfe7f1] bg-white px-3 py-1.5 text-[9px] font-medium text-[#60728d] hover:text-red-500"
            >

              <X size={12} />

              Remove / Change

            </button>

          </>

        )}

      </div>

    </div>
  );
}