import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FaUserTie,
  FaBriefcase,
  FaMicrophoneAlt,
  FaChartLine,
  FaFileUpload,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Step1Setup({ onStart }) {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const canStart =
    Boolean(role.trim() && experience.trim()) && !loading && !analyzing;

  const openFilePicker = () => {
    if (!analyzing) {
      document.getElementById("resumeUpload")?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setErrorMsg("");
    setWarningMsg("");
    setAnalysisDone(false);
    setProjects([]);
    setSkills([]);
    setResumeText("");

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setResumeFile(null);
      setErrorMsg("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      setErrorMsg("PDF size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);
    setErrorMsg("");
    setWarningMsg("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/interview/resume`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(data);

      setRole(data.role || "");
      setExperience(data.experience || "");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setResumeText(data.resumeText || "");
      setAnalysisDone(true);

      if (data.warning) {
        setWarningMsg(data.warning);
      }
    } catch (error) {
      console.log(error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to analyze resume. Please try again.";

      setErrorMsg(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!canStart) return;

    setLoading(true);
    setErrorMsg("");
    setWarningMsg("");

    try {

      const { data } = await axios.post(
        `${ServerUrl}/api/interview/generate-questions`,
        {
          role: role.trim(),
          experience: experience.trim(),
          mode,
          resumeText,
          projects,
          skills,
        },
        {
          withCredentials: true,
        }
      );

      console.log(data);

      if (userData) {
        dispatch(setUserData({ ...userData, credits: data.creditsLeft }));
      }

      onStart(data);
    } catch (error) {
      console.log(error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to start interview. Please try again.";

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-3 sm:px-4 lg:px-6 py-4 sm:py-8 lg:py-10"
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-b from-green-100 to-emerald-50 p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-5 sm:gap-6"
        >
          <div className="flex flex-col gap-4">
            <span className="w-fit text-[10px] sm:text-xs font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full uppercase tracking-widest">
              AI-Powered
            </span>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 leading-snug">
                Start Your Interview
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md">
                Practice real scenarios with our AI platform and boost your
                confidence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 lg:mb-10">
            {[
              {
                icon: <FaUserTie size={15} className="text-green-600" />,
                text: "Choose Role & Experience Level",
              },
              {
                icon: (
                  <FaMicrophoneAlt size={15} className="text-green-600" />
                ),
                text: "Smart Voice Interview",
              },
              {
                icon: <FaChartLine size={15} className="text-green-600" />,
                text: "Performance Report & Feedback",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center gap-3 bg-white border border-gray-100 px-3 sm:px-3.5 py-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all min-h-[64px]"
              >
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>

                <span className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-5 sm:p-7 lg:p-8 flex flex-col justify-between gap-5 sm:gap-6"
        >
          <div className="flex flex-col gap-1">
            <span className="w-fit text-[10px] sm:text-xs font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full uppercase tracking-widest">
              Setup
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 leading-snug">
              Interview Setup
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Fill in the details to personalize your experience.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          {warningMsg && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm">
              {warningMsg}
            </div>
          )}

          <div className="flex flex-col gap-2.5 sm:gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-3 sm:px-3.5 py-3 rounded-xl min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FaUserTie size={14} className="text-green-600" />
              </div>

              <input
                type="text"
                placeholder="Your role (e.g. Software Engineer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent w-full min-w-0 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-3 sm:px-3.5 py-3 rounded-xl min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FaBriefcase size={14} className="text-green-600" />
              </div>

              <input
                type="text"
                placeholder="Years of experience (e.g. 2)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="bg-transparent w-full min-w-0 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-3 sm:px-3.5 py-3 rounded-xl min-h-[52px]"
            >
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <FaMicrophoneAlt size={14} className="text-green-600" />
              </div>

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-transparent w-full min-w-0 text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
              </select>
            </motion.div>
          </div>

          {!analysisDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileHover={{ scale: analyzing ? 1 : 1.01 }}
              whileTap={{ scale: analyzing ? 1 : 0.99 }}
              onClick={openFilePicker}
              className="flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-green-50 to-emerald-50 border-2 border-dashed border-green-200 hover:border-green-400 py-4 sm:py-5 px-4 rounded-2xl cursor-pointer transition-all"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-white border border-green-100 shadow-sm flex items-center justify-center"
              >
                <FaFileUpload className="text-green-500 text-base" />
              </motion.div>

              <input
                type="file"
                accept="application/pdf"
                id="resumeUpload"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="text-center max-w-full">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[240px] sm:max-w-[320px] mx-auto">
                  {resumeFile ? resumeFile.name : "Upload your resume"}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {resumeFile ? "Click to change file" : "PDF only · Max 5MB"}
                </p>
              </div>

              {resumeFile && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: analyzing ? 1 : 1.05 }}
                  whileTap={{ scale: analyzing ? 1 : 0.96 }}
                  disabled={analyzing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadResume();
                  }}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-md flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                      />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Resume →"
                  )}
                </motion.button>
              )}
            </motion.div>
          )}

          {analysisDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="bg-green-50 border border-green-200 p-4 rounded-xl"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  Resume Analysis Results
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setAnalysisDone(false);
                    setResumeFile(null);
                    setProjects([]);
                    setSkills([]);
                    setResumeText("");
                    setWarningMsg("");
                    setErrorMsg("");
                  }}
                  className="text-xs font-semibold text-green-700 hover:text-green-900"
                >
                  Change
                </button>
              </div>

              {projects.length === 0 && skills.length === 0 && (
                <p className="text-sm text-gray-600">
                  Resume text extracted. Please verify role and experience
                  manually.
                </p>
              )}

              {projects.length > 0 && (
                <div>
                  <p className="text-md font-medium text-gray-700">Projects:</p>

                  <ul className="list-disc list-inside mb-2">
                    {projects.map((project, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <p className="text-md font-medium text-gray-700">Skills:</p>

                  <ul className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill, index) => (
                      <li
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.97 } : {}}
            disabled={!canStart}
            onClick={handleStart}
            className={`w-full py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              canStart
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-md"
                : "bg-emerald-200 text-black text-base sm:text-[20px] font-bold cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? (
              <>
                Starting Interview...
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              </>
            ) : (
              "Start Interview"
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1Setup;