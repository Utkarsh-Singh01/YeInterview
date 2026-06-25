import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLeftLong } from "react-icons/fa6";
import {
  BsArrowRight,
  BsBarChart,
  BsBriefcase,
  BsCalendar2Check,
  BsClockHistory,
  BsClipboardData,
} from "react-icons/bs";
import { ServerUrl } from "../App";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const getMyInterviews = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const { data } = await axios.get(
          `${ServerUrl}/api/interview/get-interview`,
          {
            withCredentials: true,
          }
        );

        console.log("Interview history response:", data);

        const interviewList = Array.isArray(data?.interviews)
          ? data.interviews
          : Array.isArray(data)
          ? data
          : [];

        if (isMounted) {
          setInterviews(interviewList);
        }
      } catch (error) {
        console.log(error);

        if (isMounted) {
          setErrorMsg(
            error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to load interview history."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getMyInterviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = interviews.length;

    const completed = interviews.filter(
      (item) => String(item.status || "").toLowerCase() === "completed"
    ).length;

    const avgScore =
      total > 0
        ? interviews.reduce(
            (sum, item) => sum + Number(item.finalScore || 0),
            0
          ) / total
        : 0;

    const bestScore =
      total > 0
        ? Math.max(...interviews.map((item) => Number(item.finalScore || 0)))
        : 0;

    return {
      total,
      completed,
      avgScore: Number(avgScore.toFixed(1)),
      bestScore: Number(bestScore.toFixed(1)),
    };
  }, [interviews]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadge = (item) => {
    const status = String(item.status || "").toLowerCase();
    const score = Number(item.finalScore || 0);

    if (status === "completed") {
      return score >= 6
        ? {
            label: "Passed",
            className: "bg-green-100 text-green-700",
          }
        : {
            label: "Needs Practice",
            className: "bg-yellow-100 text-yellow-700",
          };
    }

    if (status === "passed") {
      return {
        label: "Passed",
        className: "bg-green-100 text-green-700",
      };
    }

    if (status === "failed") {
      return {
        label: "Failed",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: item.status || "Pending",
      className: "bg-gray-100 text-gray-600",
    };
  };

  const getScoreColor = (score) => {
    const value = Number(score || 0);

    if (value >= 8) return "text-green-600";
    if (value >= 6) return "text-emerald-600";
    if (value >= 4) return "text-yellow-600";
    return "text-red-500";
  };

  const getProgressColor = (score) => {
    const value = Number(score || 0);

    if (value >= 8) return "bg-green-600";
    if (value >= 6) return "bg-emerald-500";
    if (value >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const goToReport = (id) => {

    navigate(`/report/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f5faf7]">
      {/* Header */}
      <div className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center transition cursor-pointer"
            >
              <FaLeftLong />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Interview History
              </h1>
              <p className="text-sm text-gray-500">
                View your past interviews and reports
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/interview")}
            className="hidden sm:inline-flex bg-gray-950 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition items-center gap-2 cursor-pointer"
          >
            New Interview
            <BsArrowRight />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 py-8">
        {/* Stats */}
        {!loading && !errorMsg && interviews.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              icon={<BsClockHistory />}
              label="Total"
              value={stats.total}
            />

            <SummaryCard
              icon={<BsCalendar2Check />}
              label="Completed"
              value={stats.completed}
            />

            <SummaryCard
              icon={<BsBarChart />}
              label="Average"
              value={`${stats.avgScore}/10`}
            />

            <SummaryCard
              icon={<BsClipboardData />}
              label="Best"
              value={`${stats.bestScore}/10`}
            />
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 shadow-sm">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && interviews.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 mt-16 bg-white border border-green-100 rounded-3xl p-10 shadow-sm text-center max-w-xl mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-3xl">
              <BsBriefcase />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                No interviews yet
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Start your first AI interview and your history will appear here.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/interview")}
              className="bg-gray-950 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition inline-flex items-center gap-2"
            >
              Start Interview
              <BsArrowRight />
            </button>
          </div>
        )}

        {!loading && !errorMsg && interviews.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold tracking-widest text-emerald-600 mb-1">
                  SAVED REPORTS
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Attempts
                </h2>
              </div>

              <p className="text-sm text-gray-500">
                {interviews.length} records
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((item) => {
                const badge = getBadge(item);
                const score = Number(item.finalScore || 0);
                const progress = Math.min(Math.max(score * 10, 0), 100);

                return (
                  <div
                    key={item._id}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 hover:shadow-lg hover:border-green-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-9 w-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <BsBriefcase />
                          </span>

                          <h2 className="text-lg font-bold text-gray-900 truncate">
                            {item.role || "Untitled Role"}
                          </h2>
                        </div>

                        <p className="text-sm text-gray-500">
                          Experience:{" "}
                          <span className="font-medium text-gray-700">
                            {item.experience || "N/A"}
                          </span>
                        </p>

                        <p className="text-sm text-gray-500">
                          Mode:{" "}
                          <span className="font-medium text-gray-700">
                            {item.mode || "N/A"}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100 mb-4">
                      <div className="flex items-end justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            Overall Score
                          </p>

                          <p
                            className={`text-3xl font-black ${getScoreColor(
                              score
                            )}`}
                          >
                            {score.toFixed(1)}
                            <span className="text-sm text-gray-400">/10</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            {item.questions?.length || 0}
                          </p>
                          <p className="text-xs text-gray-400">Questions</p>
                        </div>
                      </div>

                      <div className="h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            score
                          )}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-4">
                      Date:{" "}
                      <span className="text-gray-500 font-medium">
                        {formatDate(item.createdAt)}
                      </span>
                    </p>

                    <button
                      type="button"
                      onClick={() => goToReport(item._id)}
                      className="w-full bg-gray-950 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      View Full Report
                      <BsArrowRight />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-green-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        </div>

        <div className="h-11 w-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="bg-white rounded-3xl border border-green-100 p-5 shadow-sm animate-pulse"
        >
          <div className="h-5 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-6" />
          <div className="h-24 bg-green-50 rounded-2xl mb-4" />
          <div className="h-11 bg-gray-100 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export default InterviewHistory;