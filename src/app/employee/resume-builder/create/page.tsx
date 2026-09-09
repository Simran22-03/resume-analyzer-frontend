"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderKanban,
  FileText,
  Plus,
  ArrowLeft,
  Trash2,
  Sparkles,
  MessageCircle,
  X,
} from "lucide-react";

import EmployeeSidebar from "@/components/EmployeeSidebar";
import { api, generateProfessionalSummary } from "@/lib/api";

type Experience = {
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  responsibilities: string;
};

type Education = {
  degree: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Project = {
  name: string;
  description: string;
  technologies: string;
  project_url: string;
};


export default function CreateResumePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");

  const [experiences, setExperiences] =
    useState<Experience[]>([]);

  const [education, setEducation] =
    useState<Education[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [saving, setSaving] = useState(false);

  const [showAssistant, setShowAssistant] =
    useState(true);

  const [jobDescription, setJobDescription] =
    useState("");

  const [generatingSummary, setGeneratingSummary] =
    useState(false);

  // =========================================================
  // TOKEN
  // =========================================================

  const getAccessToken = () => {
    const access =
      localStorage.getItem("access") ||
      localStorage.getItem("access_token");

    if (!access) {
      return null;
    }

    return access.replace(/^"|"$/g, "");
  };

  // =========================================================
  // EXPERIENCE
  // =========================================================

  const addExperience = () => {
    setExperiences((current) => [
      ...current,
      {
        job_title: "",
        company_name: "",
        location: "",
        start_date: "",
        end_date: "",
        currently_working: false,
        responsibilities: "",
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string | boolean
  ) => {
    setExperiences((current) =>
      current.map((experience, i) =>
        i === index
          ? {
              ...experience,
              [field]: value,
            }
          : experience
      )
    );
  };

  const removeExperience = (index: number) => {
    setExperiences((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // =========================================================
  // EDUCATION
  // =========================================================

  const addEducation = () => {
    setEducation((current) => [
      ...current,
      {
        degree: "",
        institution: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
      },
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    setEducation((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeEducation = (index: number) => {
    setEducation((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // =========================================================
  // PROJECTS
  // =========================================================

  const addProject = () => {
    setProjects((current) => [
      ...current,
      {
        name: "",
        description: "",
        technologies: "",
        project_url: "",
      },
    ]);
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string
  ) => {
    setProjects((current) =>
      current.map((project, i) =>
        i === index
          ? {
              ...project,
              [field]: value,
            }
          : project
      )
    );
  };

  const removeProject = (index: number) => {
    setProjects((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // =========================================================
  // AI PROFESSIONAL SUMMARY
  // =========================================================

  const handleGenerateSummary = async () => {
    if (generatingSummary) {
      return;
    }

    if (!jobDescription.trim()) {
      alert(
        "Please describe the job role or career goal first."
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      alert(
        "Your login session has expired. Please login again."
      );

      router.push("/login");
      return;
    }

    try {
      setGeneratingSummary(true);

      const resumeData = {
        full_name: name.trim(),
        professional_title: jobTitle.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        professional_summary: summary.trim(),
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        experiences,
        education,
        projects,
      };

      console.log(
        "Generating professional summary..."
      );

      const response =
        await generateProfessionalSummary(
          jobDescription.trim(),
          resumeData,
          token
        );

      console.log(
        "Professional summary response:",
        response
      );

      const generatedSummary =
        response?.summary ||
        response?.professional_summary ||
        response?.data?.summary ||
        response?.data?.professional_summary ||
        "";

      if (!generatedSummary.trim()) {
        throw new Error(
          "The AI returned an empty professional summary."
        );
      }

      setSummary(generatedSummary.trim());

    } catch (error: any) {
      console.error(
        "Professional summary generation error:",
        error
      );

      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        alert(
          "Your login session has expired. Please login again."
        );

        router.push("/login");
        return;
      }

      const serverMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      alert(
        serverMessage ||
          "Unable to generate professional summary."
      );

    } finally {
      setGeneratingSummary(false);
    }
  };

  // =========================================================
  // SAVE
  // =========================================================

  const saveResume = async (
    generate = false
  ) => {
    if (saving) {
      return;
    }

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    try {
      setSaving(true);

      const token = getAccessToken();

      if (!token) {
        alert(
          "Your login session has expired. Please login again."
        );

        router.push("/login");
        return;
      }

      const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skillName) => ({
          name: skillName,
        }));

      const payload = {
        title: name.trim()
          ? `${name.trim()} Resume`
          : "My Resume",

        full_name: name.trim(),

        professional_title:
          jobTitle.trim(),

        email: email.trim(),

        phone: phone.trim(),

        location: location.trim(),

        professional_summary:
          summary.trim(),

        experiences,

        education,

        skills: skillList,

        projects,
      };

      console.log(
        "Sending resume payload:",
        payload
      );

      const response = await api.post(
        "/resume-builder/resumes/",
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      console.log(
        "Resume API response:",
        data
      );

      let finalResume = data;

      // =====================================================
      // GENERATE
      // =====================================================

      if (
        generate &&
        data?.id
      ) {
        const generateResponse =
          await api.post(
            `/resume-builder/resumes/${data.id}/generate/`,
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        finalResume =
          generateResponse.data?.resume ||
          data;
      }

      console.log(
        "Resume saved successfully:",
        finalResume
      );

      if (finalResume?.id) {
        router.push(
          `/employee/resume-builder/${finalResume.id}`
        );

        return;
      }

      router.push(
        "/employee/resume-builder"
      );

    } catch (error: any) {
      console.error(
        "Resume API error:",
        error
      );

      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403
      ) {
        localStorage.removeItem("access");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        alert(
          "Your login session is invalid or expired. Please login again."
        );

        router.push("/login");
        return;
      }

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        JSON.stringify(
          error?.response?.data || {}
        );

      alert(
        `Unable to save resume.\n\nServer response:\n${message}`
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <EmployeeSidebar />

      <main className="ml-[236px] min-h-screen">

        {/* HEADER */}

        <div className="flex h-[74px] items-center justify-between border-b border-[#e3eaf3] bg-white px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employee/resume-builder"
                )
              }
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-[#dce5f0] bg-white text-[#60728d] hover:bg-[#f7f9fc] hover:text-[#2463eb]"
            >
              <ArrowLeft size={15} />
            </button>

            <div>

              <h1 className="text-[18px] font-bold text-[#102a56]">
                Create Resume
              </h1>

              <p className="mt-1 text-[10px] text-[#6f819d]">
                Build a professional resume step by step.
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveResume(false)
              }
              className="h-[36px] rounded-lg border border-[#dce5f0] bg-white px-4 text-[11px] font-medium text-[#60728d] hover:bg-[#f7f9fc] disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveResume(true)
              }
              className="h-[36px] rounded-lg bg-[#2463eb] px-4 text-[11px] font-medium text-white hover:bg-[#1d56d8] disabled:opacity-50"
            >
              {saving
                ? "Generating..."
                : "Generate Resume"}
            </button>

          </div>

        </div>

        {/* PAGE */}

        <div className="grid grid-cols-[minmax(0,1fr)_430px] gap-5 p-5">

          {/* LEFT */}

          <div className="min-w-0 space-y-4">

            {/* PERSONAL */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <SectionHeader
                icon={<User size={16} />}
                title="Personal Information"
                description="Add your basic contact information."
              />

              <div className="grid grid-cols-2 gap-x-3 gap-y-3">

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={setName}
                />

                <Input
                  label="Professional Title"
                  placeholder="Software Engineer"
                  value={jobTitle}
                  onChange={setJobTitle}
                />

                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={setEmail}
                />

                <Input
                  label="Phone"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={setPhone}
                />

                <div className="col-span-2">

                  <Input
                    label="Location"
                    placeholder="Chandigarh, India"
                    value={location}
                    onChange={setLocation}
                  />

                </div>

              </div>

            </section>

            {/* SUMMARY */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <div className="flex items-center justify-between">

                <SectionHeader
                  icon={<FileText size={16} />}
                  title="Professional Summary"
                  description="Write a short introduction about yourself."
                />

                {showAssistant && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowAssistant(false)
                    }
                    className="mb-4 flex h-[32px] items-center gap-1.5 rounded-lg border border-[#dce5f0] px-3 text-[10px] font-medium text-[#2463eb] hover:bg-[#edf4ff]"
                  >
                    <Sparkles size={13} />
                    Hide AI Assistant
                  </button>
                )}

              </div>

              <textarea
                value={summary}
                onChange={(e) =>
                  setSummary(e.target.value)
                }
                placeholder="Write a concise professional summary..."
                className="min-h-[110px] w-full resize-none rounded-lg border border-[#dce5f0] px-3 py-2.5 text-[11px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
              />

              {!showAssistant && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAssistant(true)
                  }
                  className="mt-3 flex h-[34px] items-center gap-1.5 rounded-lg border border-[#dce5f0] px-3 text-[10px] font-medium text-[#2463eb] hover:bg-[#edf4ff]"
                >
                  <Sparkles size={13} />
                  Show AI Assistant
                </button>
              )}

              {/* AI ASSISTANT */}

              {showAssistant && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#dce5f0] bg-[#fbfcfe]">

                  <div className="flex items-center justify-between border-b border-[#e3eaf3] px-3 py-2.5">

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                        <MessageCircle size={14} />
                      </div>

                      <div>

                        <p className="text-[11px] font-semibold text-[#102a56]">
                          AI Summary Assistant
                        </p>

                        <p className="text-[8px] text-[#8190a6]">
                          Tell AI about the job you want.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAssistant(false)
                      }
                      className="text-[#8190a6] hover:text-[#2463eb]"
                    >
                      <X size={14} />
                    </button>

                  </div>

                  <div className="p-3">

                    <p className="mb-2 text-[9px] text-[#60728d]">
                      Paste a job description, career goal, or describe the type of role you are applying for. AI will use it together with your resume information.
                    </p>

                    <textarea
                      value={jobDescription}
                      onChange={(e) =>
                        setJobDescription(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Full Stack Developer with experience in React, Django and PostgreSQL..."
                      className="min-h-[90px] w-full resize-none rounded-lg border border-[#dce5f0] bg-white px-3 py-2.5 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
                    />

                    <div className="mt-3 flex justify-end">

                      <button
                        type="button"
                        disabled={
                          generatingSummary
                        }
                        onClick={
                          handleGenerateSummary
                        }
                        className="flex h-[34px] items-center gap-1.5 rounded-lg bg-[#2463eb] px-4 text-[10px] font-medium text-white hover:bg-[#1d56d8] disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <Sparkles size={13} />

                        {generatingSummary
                          ? "Generating..."
                          : "Generate Summary"}

                      </button>

                    </div>

                  </div>

                </div>
              )}

            </section>

            {/* EXPERIENCE */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <SectionHeader
                icon={<Briefcase size={16} />}
                title="Work Experience"
                description="Add your professional experience."
              />

              <div className="space-y-3">

                {experiences.map(
                  (experience, index) => (

                    <div
                      key={index}
                      className="rounded-lg border border-[#dce5f0] bg-[#fbfcfe] p-4"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-[10px] font-semibold text-[#102a56]">
                          Experience {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeExperience(index)
                          }
                          className="text-[#9aa8ba] hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <Input
                          label="Job Title"
                          placeholder="Software Engineer"
                          value={
                            experience.job_title
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "job_title",
                              value
                            )
                          }
                        />

                        <Input
                          label="Company Name"
                          placeholder="ABC Technologies"
                          value={
                            experience.company_name
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "company_name",
                              value
                            )
                          }
                        />

                        <Input
                          label="Location"
                          placeholder="Chandigarh"
                          value={
                            experience.location
                          }
                          onChange={(value) =>
                            updateExperience(
                              index,
                              "location",
                              value
                            )
                          }
                        />

                        {/* START + END SAME ROW */}

                        <div className="col-span-2 grid grid-cols-2 gap-3">

                          <Input
                            label="Start Date"
                            placeholder="Jan 2024"
                            value={
                              experience.start_date
                            }
                            onChange={(value) =>
                              updateExperience(
                                index,
                                "start_date",
                                value
                              )
                            }
                          />

                          <Input
                            label="End Date"
                            placeholder="Present"
                            value={
                              experience.end_date
                            }
                            onChange={(value) =>
                              updateExperience(
                                index,
                                "end_date",
                                value
                              )
                            }
                          />

                        </div>

                        <div className="col-span-2 flex items-center">

                          <label className="flex items-center gap-2 text-[9px] text-[#60728d]">

                            <input
                              type="checkbox"
                              checked={
                                experience.currently_working
                              }
                              onChange={(e) =>
                                updateExperience(
                                  index,
                                  "currently_working",
                                  e.target.checked
                                )
                              }
                            />

                            Currently working

                          </label>

                        </div>

                      </div>

                      <div className="mt-3">

                        <label className="mb-1.5 block text-[9px] font-medium text-[#60728d]">
                          Responsibilities
                        </label>

                        <textarea
                          value={
                            experience.responsibilities
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "responsibilities",
                              e.target.value
                            )
                          }
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-[80px] w-full resize-none rounded-lg border border-[#dce5f0] px-3 py-2.5 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                type="button"
                onClick={addExperience}
                className="mt-3 flex h-[34px] items-center gap-1.5 rounded-lg border border-[#dce5f0] px-3 text-[10px] font-medium text-[#2463eb] hover:bg-[#edf4ff]"
              >
                <Plus size={14} />
                Add Experience
              </button>

            </section>

            {/* EDUCATION */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <SectionHeader
                icon={<GraduationCap size={16} />}
                title="Education"
                description="Add your educational qualifications."
              />

              <div className="space-y-3">

                {education.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="rounded-lg border border-[#dce5f0] bg-[#fbfcfe] p-4"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-[10px] font-semibold text-[#102a56]">
                          Education {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeEducation(index)
                          }
                          className="text-[#9aa8ba] hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <Input
                          label="Degree"
                          placeholder="B.Tech CSE"
                          value={item.degree}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "degree",
                              value
                            )
                          }
                        />

                        <Input
                          label="Institution"
                          placeholder="GNDEC"
                          value={item.institution}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "institution",
                              value
                            )
                          }
                        />

                        <Input
                          label="Location"
                          placeholder="Ludhiana"
                          value={item.location}
                          onChange={(value) =>
                            updateEducation(
                              index,
                              "location",
                              value
                            )
                          }
                        />

                        {/* START + END SAME ROW */}

                        <div className="col-span-2 grid grid-cols-2 gap-3">

                          <Input
                            label="Start Date"
                            placeholder="2023"
                            value={
                              item.start_date
                            }
                            onChange={(value) =>
                              updateEducation(
                                index,
                                "start_date",
                                value
                              )
                            }
                          />

                          <Input
                            label="End Date"
                            placeholder="2027"
                            value={
                              item.end_date
                            }
                            onChange={(value) =>
                              updateEducation(
                                index,
                                "end_date",
                                value
                              )
                            }
                          />

                        </div>

                      </div>

                      <div className="mt-3">

                        <label className="mb-1.5 block text-[9px] font-medium text-[#60728d]">
                          Description
                        </label>

                        <textarea
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Add relevant education details..."
                          className="min-h-[65px] w-full resize-none rounded-lg border border-[#dce5f0] px-3 py-2 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
                        />

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                type="button"
                onClick={addEducation}
                className="mt-3 flex h-[34px] items-center gap-1.5 rounded-lg border border-[#dce5f0] px-3 text-[10px] font-medium text-[#2463eb] hover:bg-[#edf4ff]"
              >
                <Plus size={14} />
                Add Education
              </button>

            </section>

            {/* SKILLS */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <SectionHeader
                icon={<Code2 size={16} />}
                title="Skills"
                description="Add skills relevant to your career."
              />

              <textarea
                value={skills}
                onChange={(e) =>
                  setSkills(e.target.value)
                }
                placeholder="Python, Django, React, SQL..."
                className="min-h-[75px] w-full resize-none rounded-lg border border-[#dce5f0] px-3 py-2.5 text-[11px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
              />

              <p className="mt-1.5 text-[8px] text-[#9aa8ba]">
                Separate skills using commas.
              </p>

            </section>

            {/* PROJECTS */}

            <section className="rounded-xl border border-[#dfe7f1] bg-white p-5">

              <SectionHeader
                icon={<FolderKanban size={16} />}
                title="Projects"
                description="Showcase your important projects."
              />

              <div className="space-y-3">

                {projects.map(
                  (project, index) => (

                    <div
                      key={index}
                      className="rounded-lg border border-[#dce5f0] bg-[#fbfcfe] p-4"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-[10px] font-semibold text-[#102a56]">
                          Project {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeProject(index)
                          }
                          className="text-[#9aa8ba] hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <Input
                          label="Project Name"
                          placeholder="AI Resume Analyzer"
                          value={project.name}
                          onChange={(value) =>
                            updateProject(
                              index,
                              "name",
                              value
                            )
                          }
                        />

                        <Input
                          label="Technologies"
                          placeholder="Django, Next.js, PostgreSQL"
                          value={
                            project.technologies
                          }
                          onChange={(value) =>
                            updateProject(
                              index,
                              "technologies",
                              value
                            )
                          }
                        />

                        <div className="col-span-2">

                          <Input
                            label="Project URL"
                            placeholder="https://github.com/..."
                            value={
                              project.project_url
                            }
                            onChange={(value) =>
                              updateProject(
                                index,
                                "project_url",
                                value
                              )
                            }
                          />

                        </div>

                        <div className="col-span-2">

                          <label className="mb-1.5 block text-[9px] font-medium text-[#60728d]">
                            Description
                          </label>

                          <textarea
                            value={
                              project.description
                            }
                            onChange={(e) =>
                              updateProject(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your project..."
                            className="min-h-[70px] w-full resize-none rounded-lg border border-[#dce5f0] px-3 py-2 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
                          />

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                type="button"
                onClick={addProject}
                className="mt-3 flex h-[34px] items-center gap-1.5 rounded-lg border border-[#dce5f0] px-3 text-[10px] font-medium text-[#2463eb] hover:bg-[#edf4ff]"
              >
                <Plus size={14} />
                Add Project
              </button>

            </section>

          </div>

          {/* PREVIEW */}

          <div className="sticky top-5 h-fit">

            <div className="mb-2 flex items-center justify-between">

              <h2 className="text-[12px] font-semibold text-[#102a56]">
                Resume Preview
              </h2>

              <span className="text-[9px] text-[#8190a6]">
                Live Preview
              </span>

            </div>

            <div className="min-h-[650px] rounded-xl border border-[#dfe7f1] bg-white p-7 shadow-[0_1px_3px_rgba(15,35,70,0.05)]">

              <h1 className="text-[22px] font-bold text-[#102a56]">
                {name || "Your Name"}
              </h1>

              <p className="mt-1 text-[11px] font-medium text-[#2463eb]">
                {jobTitle ||
                  "Professional Title"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-b border-[#e5ebf3] pb-4 text-[8px] text-[#6f819d]">

                <span>
                  {email ||
                    "email@example.com"}
                </span>

                <span>
                  {phone ||
                    "+91 XXXXX XXXXX"}
                </span>

                <span>
                  {location || "Location"}
                </span>

              </div>

              <PreviewSection title="PROFESSIONAL SUMMARY">

                <p className="text-[9px] leading-[1.6] text-[#52657f]">
                  {summary ||
                    "Your professional summary will appear here. Add a concise description highlighting your experience, skills and career goals."}
                </p>

              </PreviewSection>

              <PreviewSection title="WORK EXPERIENCE">

                {experiences.length === 0 ? (

                  <p className="text-[9px] italic text-[#8190a6]">
                    Add your work experience from the form.
                  </p>

                ) : (

                  experiences.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="mb-3"
                      >

                        <p className="text-[9px] font-bold text-[#102a56]">
                          {item.job_title ||
                            "Job Title"}
                        </p>

                        <p className="text-[8px] text-[#60728d]">
                          {item.company_name ||
                            "Company Name"}
                        </p>

                        {item.responsibilities && (
                          <p className="mt-1 whitespace-pre-line text-[8px] leading-[1.5] text-[#52657f]">
                            {
                              item.responsibilities
                            }
                          </p>
                        )}

                      </div>

                    )
                  )

                )}

              </PreviewSection>

              <PreviewSection title="EDUCATION">

                {education.length === 0 ? (

                  <p className="text-[9px] italic text-[#8190a6]">
                    Add your education details.
                  </p>

                ) : (

                  education.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="mb-2"
                      >

                        <p className="text-[9px] font-bold text-[#102a56]">
                          {item.degree ||
                            "Degree"}
                        </p>

                        <p className="text-[8px] text-[#60728d]">
                          {item.institution ||
                            "Institution"}
                        </p>

                      </div>

                    )
                  )

                )}

              </PreviewSection>

              <PreviewSection title="SKILLS">

                <p className="text-[9px] leading-[1.6] text-[#52657f]">
                  {skills ||
                    "Your skills will appear here."}
                </p>

              </PreviewSection>

              <PreviewSection title="PROJECTS">

                {projects.length === 0 ? (

                  <p className="text-[9px] italic text-[#8190a6]">
                    Add your projects.
                  </p>

                ) : (

                  projects.map(
                    (project, index) => (

                      <div
                        key={index}
                        className="mb-3"
                      >

                        <p className="text-[9px] font-bold text-[#102a56]">
                          {project.name ||
                            "Project Name"}
                        </p>

                        <p className="text-[8px] text-[#60728d]">
                          {project.technologies}
                        </p>

                        {project.description && (
                          <p className="mt-1 text-[8px] leading-[1.5] text-[#52657f]">
                            {
                              project.description
                            }
                          </p>
                        )}

                      </div>

                    )
                  )

                )}

              </PreviewSection>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

// =========================================================
// INPUT
// =========================================================

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">

      <label className="mb-1.5 block text-[9px] font-medium text-[#60728d]">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="box-border h-[36px] w-full rounded-lg border border-[#dce5f0] px-3 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba] focus:border-[#2463eb]"
      />

    </div>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
        {icon}
      </div>

      <div>

        <h2 className="text-[13px] font-semibold text-[#102a56]">
          {title}
        </h2>

        <p className="text-[9px] text-[#8190a6]">
          {description}
        </p>

      </div>

    </div>
  );
}

// =========================================================
// PREVIEW SECTION
// =========================================================

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">

      <h3 className="mb-2 border-b border-[#e5ebf3] pb-1.5 text-[9px] font-bold tracking-[0.08em] text-[#2463eb]">
        {title}
      </h3>

      {children}

    </section>
  );
}