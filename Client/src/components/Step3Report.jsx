import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { FaLeftLong } from "react-icons/fa6";
import {
  BsArrowRight,
  BsBarChart,
  BsClipboardData,
  BsDownload,
  BsLightbulb,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "react-circular-progressbar/dist/styles.css";
import { ServerUrl } from "../App";

function Step3Report({ report: reportProp }) {

  const navigate = useNavigate();
  const { id } = useParams();

  const [fetchedReport, setFetchedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(!reportProp);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      if (reportProp) {
        setLoadingReport(false);
        return;
      }

      if (!id) {
        setLoadingReport(false);
        setErrorMsg("Report data not found.");
        return;
      }

      try {
        setLoadingReport(true);
        setErrorMsg("");

        const { data } = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          {
            withCredentials: true,
          }
        );

        if (isMounted) {
          setFetchedReport(data);
        }
      } catch (error) {
        console.log(error);

        if (isMounted) {
          setErrorMsg(
            error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to load report."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingReport(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [id, reportProp]);

  const report = reportProp || fetchedReport;

  const normalizeScore = (value) => {
    let number = Number(value);

    if (!Number.isFinite(number)) return 0;

    if (number > 10 && number <= 100) {
      number = number / 10;
    }

    return Math.max(0, Math.min(10, number));
  };

  const questionWiseScores = useMemo(() => {
    if (!report) return [];

    const rawQuestions =
      report.questionWiseScores ||
      report.questionWiseScore ||
      report.questions ||
      [];

    if (!Array.isArray(rawQuestions)) return [];

    return rawQuestions.map((item, index) => {
      if (typeof item === "number") {
        return {
          question: `Question ${index + 1}`,
          score: normalizeScore(item),
          confidence: 0,
          communication: 0,
          correctness: 0,
          feedback:
            report.feedbacks?.[index] || "No feedback available for this answer.",
          answer: "",
          timeTaken: 0,
          difficulty: "",
        };
      }

      return {
        question: item.question || item.text || `Question ${index + 1}`,
        score: normalizeScore(item.score ?? item.finalScore ?? 0),
        confidence: normalizeScore(item.confidence ?? 0),
        communication: normalizeScore(item.communication ?? 0),
        correctness: normalizeScore(item.correctness ?? 0),
        feedback:
          item.feedback ||
          report.feedbacks?.[index] ||
          "No feedback available for this answer.",
        answer: item.answer || item.answers || "",
        timeTaken: item.timeTaken || 0,
        difficulty: item.difficulty || "",
      };
    });
  }, [report]);

  const averageQuestionScore = (key) => {
    if (!questionWiseScores.length) return 0;

    const total = questionWiseScores.reduce(
      (sum, item) => sum + normalizeScore(item[key] || 0),
      0
    );

    return normalizeScore(total / questionWiseScores.length);
  };

  const finalScore = useMemo(() => {
    if (!report) return 0;

    if (report.finalScore !== undefined && report.finalScore !== null) {
      return normalizeScore(report.finalScore);
    }

    if (!questionWiseScores.length) return 0;

    const total = questionWiseScores.reduce(
      (sum, item) => sum + normalizeScore(item.score),
      0
    );

    return normalizeScore(total / questionWiseScores.length);
  }, [report, questionWiseScores]);

  const confidence = report?.confidence ?? averageQuestionScore("confidence");
  const communication =
    report?.communication ?? averageQuestionScore("communication");
  const correctness = report?.correctness ?? averageQuestionScore("correctness");

  const skills = [
    {
      label: "Confidence",
      value: normalizeScore(confidence),
      desc: "How confident and clear your answer sounded.",
    },
    {
      label: "Communication",
      value: normalizeScore(communication),
      desc: "How easy your answer was to understand.",
    },
    {
      label: "Correctness",
      value: normalizeScore(correctness),
      desc: "How accurate and relevant your answer was.",
    },
  ];

  const questionScoreData = questionWiseScores.map((item, index) => ({
    name: `Q${index + 1}`,
    score: normalizeScore(item.score),
    fullQuestion: item.question,
  }));

  const percentage = finalScore * 10;

  const performance = getPerformance(finalScore);

  const handleDownloadReport = () => {
    window.print();
  };

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-[#f5faf7] flex items-center justify-center px-5">
        <div className="bg-white border border-green-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="min-h-screen bg-[#f5faf7] flex items-center justify-center px-5">
        <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-sm text-center max-w-md">
          <p className="text-red-600 font-semibold">
            {errorMsg || "Report not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 bg-gray-950 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const downloadReport = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const green = [16, 185, 129];
  const dark = [17, 24, 39];
  const gray = [107, 114, 128];

  let currentY = 18;

  const finalScoreValue = normalizeScore(finalScore);
  const confidenceValue = normalizeScore(confidence);
  const communicationValue = normalizeScore(communication);
  const correctnessValue = normalizeScore(correctness);

  const cleanText = (value) => {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const checkPageSpace = (requiredHeight = 30) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 18;
    }
  };

  doc.setFillColor(245, 250, 247);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...dark);
  doc.text("YeInterview.AI", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 9;

  doc.setFontSize(16);
  doc.setTextColor(...green);
  doc.text("Interview Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 8;

  doc.setDrawColor(...green);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 12;

  // Candidate / interview info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Report Summary", margin, currentY);

  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Role", cleanText(report.role || "N/A")],
      ["Experience", cleanText(report.experience || "N/A")],
      ["Mode", cleanText(report.mode || "N/A")],
      ["Status", cleanText(report.status || "Completed")],
      ["Final Score", `${finalScoreValue.toFixed(1)}/10`],
      ["Confidence", `${confidenceValue.toFixed(1)}/10`],
      ["Communication", `${communicationValue.toFixed(1)}/10`],
      ["Correctness", `${correctnessValue.toFixed(1)}/10`],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: dark,
      lineColor: [220, 252, 231],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: green,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 55 },
    },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // Performance advice
  checkPageSpace(40);

  let advice = "";

  if (finalScoreValue >= 8) {
    advice =
      "Excellent performance! You demonstrated strong confidence, communication, and correctness. Keep practicing to maintain consistency and improve even further.";
  } else if (finalScoreValue >= 6) {
    advice =
      "Good performance! You have a solid foundation. Focus on giving more structured answers, adding examples, and improving clarity.";
  } else if (finalScoreValue >= 4) {
    advice =
      "Average performance. You should practice explaining answers more clearly, improve confidence, and revise core concepts related to your role.";
  } else {
    advice =
      "Needs improvement. Focus on fundamentals, practice speaking clearly, and answer with better structure using examples from your experience.";
  }

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 10);
  const adviceBoxHeight = Math.max(32, splitAdvice.length * 5 + 18);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(220, 252, 231);
  doc.roundedRect(margin, currentY, contentWidth, adviceBoxHeight, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Performance Advice", margin + 5, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(splitAdvice, margin + 5, currentY + 16);

  currentY += adviceBoxHeight + 12;

  // Question-wise table
  checkPageSpace(40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Question-wise Feedback", margin, currentY);

  currentY += 6;

  const tableBody =
    questionWiseScores.length > 0
      ? questionWiseScores.map((q, i) => [
          `Q${i + 1}`,
          cleanText(q.question || `Question ${i + 1}`),
          `${normalizeScore(q.score).toFixed(1)}/10`,
          cleanText(q.feedback || "No feedback available."),
        ])
      : [["-", "No question data available.", "-", "-"]];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Question", "Score", "Feedback"]],
    body: tableBody,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "top",
      textColor: dark,
      lineColor: [220, 252, 231],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: green,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 70 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: contentWidth - 104 },
    },
  });

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);

    doc.text(
      `Generated by YeInterview.AI | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const fileName = `Interview_Report_${id || report?.interviewId || "latest"}.pdf`;

  doc.save(fileName);
};

  return (
    <div className="min-h-screen bg-[#f5faf7] relative overflow-hidden">

      <div className="absolute top-20 left-[-120px] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-80 right-[-140px] w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-40 left-1/2 w-72 h-72 bg-lime-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-5 sm:px-6 py-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-3xl border border-green-100 shadow-sm p-5 sm:p-7 mb-6 print:hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <FaLeftLong />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                  <HiSparkles />
                  AI Interview Report
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Interview Analysis Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                  Here's a clean summary of your interview performance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadReport}
              className="bg-gray-950 hover:bg-green-700 text-white px-5 py-3 rounded-full font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BsDownload />
              Download Report
            </button>
          </div>
        </motion.section>

        <section className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-white rounded-3xl border border-green-100 shadow-sm p-6"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Overall Performance
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Final score based on your complete interview.
              </p>

              <div className="w-44 h-44">
                <CircularProgressbar
                  value={percentage}

                  text={`${percentage.toFixed(0)}%`}
                  styles={buildStyles({
                    textSize: "20px",
                    textColor: performance.color,
                    pathColor: performance.color,
                    trailColor: "#e5e7eb",
                    strokeLinecap: "round",
                  })}
                />
              </div>

              <p className="text-4xl font-black text-gray-900 mt-5">
                {finalScore.toFixed(1)}
                <span className="text-base text-gray-400">/10</span>
              </p>

              <div
                className={`mt-4 px-4 py-2 rounded-full text-sm font-bold ${performance.badgeClass}`}
              >
                {performance.label}
              </div>

              <p className="text-gray-600 mt-5 leading-relaxed">
                {performance.text}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {performance.tagline}
              </p>
            </div>
          </motion.div>

          {/* Skill */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="bg-white rounded-3xl border border-green-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <BsBarChart />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Skill Breakdown
                </h2>
                <p className="text-sm text-gray-500">
                  Scores are measured out of 10.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {skills.map((skill) => (
                <SkillBar key={skill.label} skill={skill} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-7">
              <MiniStat
                label="Questions"
                value={questionWiseScores.length}
              />
              <MiniStat
                label="Answered"
                value={
                  questionWiseScores.filter((q) => q.answer && q.answer.trim())
                    .length
                }
              />
            </div>
          </motion.div>
        </section>

        {/* Chart */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <BsClipboardData />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Question-wise Performance
              </h2>
              <p className="text-sm text-gray-500">
                Score breakdown for every interview question.
              </p>
            </div>
          </div>

          {questionScoreData.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-green-50 rounded-2xl border border-green-100">
              <p className="text-gray-500">No question data available.</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionScoreData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="score"
                    fill="#10b981"
                    radius={[10, 10, 0, 0]}
                    barSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>

        {/* Performance Insights */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="bg-white rounded-3xl border border-green-100 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <BsLightbulb />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Performance Insights
              </h2>
              <p className="text-sm text-gray-500">
                Quick suggestions based on your scores.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <InsightCard key={skill.label} skill={skill} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className="bg-white rounded-3xl border border-green-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <BsClipboardData />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Question Breakdown
              </h2>
              <p className="text-sm text-gray-500">
                Review each question, score, answer, and feedback.
              </p>
            </div>
          </div>

          {questionWiseScores.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center text-gray-500">
              No question-wise feedback available.
            </div>
          ) : (
            <div className="space-y-4">
              {questionWiseScores.map((item, index) => (
                <QuestionFeedbackCard
                  key={index}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function SkillBar({ skill }) {
  const value = Math.max(0, Math.min(10, Number(skill.value || 0)));
  const percentage = value * 10;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-bold text-gray-800">{skill.label}</p>
          <p className="text-xs text-gray-500">{skill.desc}</p>
        </div>

        <p className="text-lg font-black text-green-600">{value.toFixed(1)}/10</p>
      </div>

      <div className="h-3 bg-green-50 rounded-full overflow-hidden border border-green-100">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function InsightCard({ skill }) {
  const value = Number(skill.value || 0);

  let text = "Needs more practice in this area.";

  if (value >= 8) {
    text = "Strong area. Keep maintaining this performance.";
  } else if (value >= 6) {
    text = "Good level. Improve structure and clarity slightly.";
  } else if (value >= 4) {
    text = "Average level. Practice with more focused answers.";
  }

  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
      <p className="text-sm font-bold text-gray-900">{skill.label}</p>
      <p className="text-2xl font-black text-green-600 mt-1">
        {Number(skill.value || 0).toFixed(1)}/10
      </p>
      <p className="text-sm text-gray-500 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}

function QuestionFeedbackCard({ item, index }) {
  return (
    <div className="border border-green-100 rounded-2xl p-5 bg-white hover:bg-green-50/40 transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-emerald-600 mb-1">
            QUESTION {index + 1}
          </p>

          <h3 className="text-base font-bold text-gray-900 leading-relaxed">
            {item.question}
          </h3>
        </div>

        <span className="w-fit bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          {Number(item.score || 0).toFixed(1)}/10
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <SmallMetric label="Confidence" value={item.confidence} />
        <SmallMetric label="Communication" value={item.communication} />
        <SmallMetric label="Correctness" value={item.correctness} />
      </div>

      {item.answer && (
        <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 mb-1">Your Answer</p>
          <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
        </div>
      )}

      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <p className="text-xs font-bold text-green-700 mb-1">Feedback</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.feedback}</p>
      </div>
    </div>
  );
}

function SmallMetric({ label, value }) {
  const score = Math.max(0, Math.min(10, Number(value || 0)));

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-black text-gray-900 mt-1">
        {score.toFixed(1)}/10
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-green-100 shadow-lg rounded-xl p-3 max-w-xs">
      <p className="text-xs font-bold text-green-600 mb-1">{data.name}</p>
      <p className="text-sm text-gray-700 line-clamp-2">{data.fullQuestion}</p>
      <p className="text-sm font-bold text-gray-900 mt-2">
        Score: {Number(payload[0].value || 0).toFixed(1)}/10
      </p>
    </div>
  );
}

function getPerformance(finalScore) {
  if (finalScore >= 8) {
    return {
      label: "Excellent",
      color: "#16a34a",
      badgeClass: "bg-green-100 text-green-700",
      text: "Excellent performance! You demonstrated strong knowledge, clarity, and confidence.",
      tagline: "Outstanding work. Keep practicing to stay consistent.",
    };
  }

  if (finalScore >= 6) {
    return {
      label: "Good",
      color: "#10b981",
      badgeClass: "bg-emerald-100 text-emerald-700",
      text: "Good performance! You have a solid foundation with some areas to polish.",
      tagline: "Focus on deeper explanations and structured responses.",
    };
  }

  if (finalScore >= 4) {
    return {
      label: "Average",
      color: "#ca8a04",
      badgeClass: "bg-yellow-100 text-yellow-700",
      text: "Average performance. Your answers need more clarity, detail, and confidence.",
      tagline: "Practice more examples and improve your answer structure.",
    };
  }

  return {
    label: "Needs Practice",
    color: "#ef4444",
    badgeClass: "bg-red-100 text-red-700",
    text: "Needs improvement. Review fundamentals and practice answering clearly.",
    tagline: "Do not be discouraged. Consistent practice will improve your score.",
  };
}

export default Step3Report;