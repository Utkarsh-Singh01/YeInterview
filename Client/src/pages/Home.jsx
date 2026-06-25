import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModel from "../components/AuthModel";

import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsArrowRight,
  BsCheckCircle,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import evalImg from "../assets/ai-ans.png";
import creditImg from "../assets/credit.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analysisImg from "../assets/history.png";

const STEPS = [
  {
    icon: <BsRobot size={28} />,
    step: "STEP 1",
    title: "Choose Role",
    desc: "Select your role, experience level, and interview mode to get personalized questions.",
  },
  {
    icon: <BsMic size={28} />,
    step: "STEP 2",
    title: "AI Interview",
    desc: "Answer realistic interview questions using voice or text in a timed environment.",
  },
  {
    icon: <BsBarChart size={28} />,
    step: "STEP 3",
    title: "Get Feedback",
    desc: "Receive AI-based scores, feedback, and performance insights after every answer.",
  },
];

const CAPABILITIES = [
  {
    image: evalImg,
    icon: <BsBarChart size={27} />,
    title: "AI Evaluation & Feedback",
    desc: "Get scores for confidence, communication, correctness, and overall answer quality.",
  },
  {
    image: resumeImg,
    icon: <BsFileEarmarkText size={27} />,
    title: "Resume-Based Questions",
    desc: "Upload your resume and get questions based on your skills, projects, and experience.",
  },
  {
    image: pdfImg,
    icon: <BsFileEarmarkText size={27} />,
    title: "PDF Performance Reports",
    desc: "Download detailed reports with question-wise scores, answers, and improvement tips.",
  },
  {
    image: analysisImg,
    icon: <BsBarChart size={27} />,
    title: "Interview History",
    desc: "Track your previous interviews, compare performance, and improve consistently.",
  },
];

const MODES = [
  {
    image: hrImg,
    title: "HR Interview Mode",
    desc: "Practice behavioral, situational, and communication-based HR questions.",
  },
  {
    image: techImg,
    title: "Technical Interview Mode",
    desc: "Prepare for role-specific technical questions based on your skills and resume.",
  },
  {
    image: confidenceImg,
    title: "Confidence Practice",
    desc: "Improve fluency, clarity, and confidence before facing real recruiters.",
  },
  {
    image: creditImg,
    title: "Premium Coaching",
    desc: "Unlock advanced interview practice with deeper AI evaluation and insights.",
  },
];

const STATS = [
  {
    value: "5",
    label: "Smart Questions",
  },
  {
    value: "3",
    label: "Score Categories",
  },
  {
    value: "AI",
    label: "Instant Feedback",
  },
];

function Home() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleProtectedNavigate = (path) => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f5faf7] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 relative">
      
        <div className="absolute top-20 left-[-120px] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-80 right-[-140px] w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-40 left-1/2 w-72 h-72 bg-lime-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-8">
          {/* HERO */}
          <section className="relative text-center pt-8 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-green-100 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm mb-7"
            >
              <span className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <HiSparkles size={16} />
              </span>
              YeInterview.AI — Where Interviews Get Smarter
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] text-gray-900 max-w-5xl mx-auto"
            >
              Practice interviews with your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  AI Coach
                </span>
                <span className="absolute left-0 right-0 bottom-2 h-4 bg-green-100 rounded-full -z-0" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-gray-500 text-base sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your resume, answer realistic interview questions, and get instant AI feedback to improve your performance and confidence. All-in-one platform for smarter interview preparation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
            >
              <button
                type="button"
                onClick={() => handleProtectedNavigate("/interview")}
                className="group bg-gray-950 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-300 flex items-center justify-center gap-2"
              >
                Start Practicing
                <BsArrowRight className="group-hover:translate-x-1 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigate("/history")}
                className="bg-white text-gray-800 px-7 py-3.5 rounded-full text-base font-semibold hover:bg-gray-50 transition border border-gray-200 shadow-sm"
              >
                View History
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12"
            >
              {STATS.map((item) => (
                <div
                  key={item.label}
                  className="bg-white/80 backdrop-blur-md border border-green-100 rounded-2xl px-6 py-5 shadow-sm"
                >
                  <p className="text-3xl font-bold text-emerald-600">
                    {item.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </section>

          <section className="mb-24">
            <SectionTitle
              eyebrow="Simple Process"
              title="How YeInterview works"
              desc="A clean step-by-step flow to help you practice like a real interview."
            />

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              {STEPS.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                  whileHover={{ y: -8 }}
                  className="relative bg-white rounded-3xl border border-green-100 p-7 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                >
                  <div className="absolute right-[-30px] top-[-30px] w-24 h-24 bg-green-100 rounded-full group-hover:scale-125 transition-transform" />

                  <div className="relative h-14 w-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>

                  <p className="text-xs font-bold tracking-widest text-emerald-600 mb-2">
                    {item.step}
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-24">
            <SectionTitle
              eyebrow="AI Features"
              title="Advanced interview capabilities"
              desc="Everything you need to practice, evaluate, and improve your interview performance."
            />

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {CAPABILITIES.map((item, index) => (
                <FeatureCard key={item.title} item={item} index={index} icon />
              ))}
            </div>
          </section>

          {/* MODES */}
          <section className="mb-24">
            <SectionTitle
              eyebrow="Interview Modes"
              title="Practice different interview styles"
              desc="Choose the mode that fits your goal and prepare with focused questions."
            />

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {MODES.map((item, index) => (
                <FeatureCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 to-green-500 p-8 sm:p-10 text-center shadow-xl"
            >
              <div className="absolute top-[-80px] right-[-80px] w-52 h-52 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute bottom-[-80px] left-[-80px] w-52 h-52 bg-white/20 rounded-full blur-2xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to improve your interview skills?
                </h2>

                <p className="text-green-50 mt-4 max-w-2xl mx-auto">
                  Start your AI interview practice now and get instant feedback
                  that helps you perform better.
                </p>

                <button
                  type="button"
                  onClick={() => handleProtectedNavigate("/interview")}
                  className="mt-7 bg-white text-emerald-700 px-7 py-3.5 rounded-full font-bold hover:bg-green-50 transition inline-flex items-center gap-2"
                >
                  Start Interview
                  <BsArrowRight />
                </button>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 bg-green-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4"
      >
        <HiSparkles size={16} />
        {eyebrow}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="text-gray-500 mt-4 text-base md:text-lg leading-relaxed"
      >
        {desc}
      </motion.p>
    </div>
  );
}

function FeatureCard({ item, index, icon = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-3xl border border-green-100 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="relative">
          <div className="absolute inset-0 bg-green-100 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform" />
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="relative w-28 h-28 sm:w-32 sm:h-32 object-contain bg-white rounded-3xl p-3 border border-green-50"
          />
        </div>

        <div className="flex-1">
          {icon && (
            <div className="h-11 w-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              {item.icon}
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {item.title}
          </h3>

          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {item.desc}
          </p>

          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <BsCheckCircle />
            Included in platform
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Home;