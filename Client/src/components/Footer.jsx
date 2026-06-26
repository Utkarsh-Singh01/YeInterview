import React from "react";
import { motion } from "framer-motion";
import { BsRobot } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  const isLoggedIn =
    token && token !== "undefined" && token !== "null" && token.length > 10;

  const handleProtectedNavigate = (path) => {
    if (!isLoggedIn) {
      navigate("/auth", {
        state: {
          redirectTo: path,
        },
      });
      return;
    }

    navigate(path);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/interview");
    } else {
      navigate("/auth");
    }
  };

  const socialLinks = [
    {
      Icon: FaLinkedinIn,
      href: "https://www.linkedin.com/in/utkarsh-singh-engineer/",
      label: "LinkedIn",
    },
    {
      Icon: FaGithub,
      href: "https://github.com/Utkarsh-Singh01",
      label: "GitHub",
    },
    {
      Icon: FaTwitter,
      href: "https://x.com/utkarsh_si75491",
      label: "Twitter",
    },
  ];

  const quickLinks = [
    { label: "Start Interview", href: "/interview" },
    { label: "View History", href: "/history" },
    { label: "AI Feedback", href: "/history" },
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "PDF Reports", href: "/reports" },
  ];

  return (
    <footer className="bg-[#f3f3f3] border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="pt-12 pb-10">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-10 md:p-14 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute top-4 right-1/3 w-16 h-16 bg-white/5 rounded-full"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Ready to ace your next interview?
                </h3>
                <p className="text-green-100 text-base max-w-md">
                  Be among the first to shape the future of interview prep with
                  AI.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGetStarted}
                className="bg-white text-green-700 font-semibold px-7 py-3.5 rounded-full text-base hover:bg-green-50 transition-colors shadow-lg cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                {isLoggedIn ? "Start Interview" : "Get Started Free"}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-green-600 text-white p-2 rounded-xl">
                <BsRobot size={20} />
              </div>

              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  YeInterview<span className="text-green-600">.AI</span>
                </h3>

                <div className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs mt-0.5 font-medium">
                  <HiSparkles size={10} />
                  AI Interview Coach
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
              Practice smarter with AI-powered mock interviews and land your
              dream job with confidence. Resume analysis, personalized feedback,
              and real-time coaching all in one place.
            </p>

            <div className="flex gap-2.5">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ y: -3 }}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:border-green-400 hover:text-green-600 flex items-center justify-center text-gray-400 transition-all duration-200 shadow-sm"
                >
                  <Icon size={13} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-5 uppercase tracking-wider">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigate(link.href)}
                    className="text-gray-500 hover:text-green-600 text-sm transition-colors duration-200 flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="w-1 h-1 bg-gray-300 group-hover:bg-green-500 rounded-full transition-colors"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-5 uppercase tracking-wider">
              What's Coming
            </h4>

            <div className="space-y-3.5">
              {[
                { label: "Multi-language Interview Support", status: "Soon" },
                { label: "Voice Tone Analysis", status: "Building" },
                { label: "Company-specific Mock Rounds", status: "Soon" },
                { label: "Interview Score Comparisons", status: "Building" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500">{item.label}</span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${
                      item.status === "Building"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {item.status === "Building" ? "🔧 Building" : "🔜 Soon"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {year} YeInterview.AI. All rights reserved.
            </p>

            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <HiSparkles size={14} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                🚀 Empowering careers through YeInterview.AI
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Made with ❤️ for job seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
