import React, { useState } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { HiSparkles } from "react-icons/hi";
import { BsCheckCircle, BsArrowRight } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";

const plans = [
  {
    id: "free",
    name: "Free Plan",
    price: "₹0",
    credits: 100,
    description:
      "Ideal for beginners to explore the platform and practice interviews.",
    features: [
      "100 AI Interview Credits",
      "Basic interview questions",
      "Limited resume analysis",
      "Limited interview history",
    ],
    note: "Included by default",
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: "₹99",
    amount: 99,
    credits: 150,
    description:
      "Perfect for candidates who want more practice and better analysis.",
    features: [
      "150 AI Interview Credits",
      "Advanced interview questions",
      "Resume-based question generation",
      "Detailed interview history",
      "AI performance feedback",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₹499",
    amount: 499,
    credits: 650,
    description:
      "Best for serious candidates preparing for multiple interviews.",
    features: [
      "650 AI Interview Credits",
      "Access to all question types",
      "Advanced resume analysis",
      "Unlimited interview history",
      "Downloadable interview reports",
      "Priority feature access",
    ],
    badge: "Most Popular",
  },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePlanClick = (plan) => {
    if (plan.id === "free") return;

    setSelectedPlan(plan.id);
  };

  const handlePayment = async (plan) => {
    try {
      if (plan.id === "free") return;

      if (!userData) {
        alert("Please login first.");
        navigate("/");
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        alert("VITE_RAZORPAY_KEY_ID is missing in frontend .env file.");
        return;
      }

      setLoadingPlan(plan.id);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        alert("Failed to load Razorpay. Please check your internet.");
        return;
      }

      const { data } = await axios.post(
        `${ServerUrl}/api/payment/order`,
        {
          planId: plan.id,
        },
        {
          withCredentials: true,
        }
      );

      if (!data?.success || !data?.order) {
        alert(data?.message || "Failed to create payment order.");
        return;
      }

      const order = data.order;

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "YeInterview.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: order.id,

        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
          contact: userData?.phone || "",
        },

        theme: {
          color: "#16a34a",
        },

        handler: async function (response) {
          try {
            const verifyResult = await axios.post(
              `${ServerUrl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                withCredentials: true,
              }
            );

            if (verifyResult.data?.success) {
              alert("Payment successful! Credits added.");

              if (verifyResult.data.user) {
                dispatch(setUserData(verifyResult.data.user));
              }

              navigate("/");
            } else {
              alert(verifyResult.data?.message || "Payment verification failed.");
            }
          } catch (error) {
            console.log(error);
            alert(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("Payment failed:", response.error);
        alert(response.error?.description || "Payment failed.");
      });

      razorpay.open();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Payment failed. Please try again."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5faf7] relative overflow-hidden">
      <div className="absolute top-20 left-[-120px] w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-80 right-[-140px] w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-32 left-1/2 w-72 h-72 bg-lime-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-full bg-white border border-green-100 hover:bg-green-50 text-green-700 flex items-center justify-center transition shadow-sm cursor-pointer"
          >
            <FaArrowLeft />
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-green-100 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm">
            <span className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <HiSparkles size={16} />
            </span>
            YeInterview.AI Pricing
          </div>
        </div>

        <section className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex sm:hidden items-center gap-2 bg-white/80 backdrop-blur-md border border-green-100 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm mb-6"
          >
            <span className="h-7 w-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <HiSparkles size={16} />
            </span>
            YeInterview.AI Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] text-gray-900 max-w-4xl mx-auto"
          >
            Choose your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                interview practice plan
              </span>
              <span className="absolute left-0 right-0 bottom-2 h-4 bg-green-100 rounded-full -z-0" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-gray-500 text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            Start free, upgrade when you need more credits, deeper resume
            analysis, and downloadable interview reports.
          </motion.p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">

          {plans.map((plan, index) => {
            const isFree = plan.id === "free";
            const isSelected = selectedPlan === plan.id;
            const isHovered = hoveredPlan === plan.id;
            const isPremium = plan.id === "premium";
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                whileHover={!isFree ? { y: -8 } : {}}
                onClick={() => handlePlanClick(plan)}
                className={`relative bg-white rounded-[2rem] border p-6 sm:p-7 shadow-sm transition-all overflow-hidden ${
                  isPremium
                    ? "border-green-400 shadow-xl md:scale-[1.04]"
                    : isSelected && !isFree
                    ? "border-green-500 shadow-lg"
                    : "border-green-100 hover:border-green-300 hover:shadow-xl"
                } ${isFree ? "cursor-default opacity-95" : "cursor-pointer"}`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-28 ${
                    isPremium
                      ? "bg-gradient-to-b from-green-100 to-transparent"
                      : "bg-gradient-to-b from-green-50 to-transparent"
                  }`}
                />

                {plan.badge && (
                  <div className="absolute top-5 right-5 bg-gray-950 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                {isFree && (
                  <div className="absolute top-5 right-5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    Default
                  </div>
                )}

                <div className="relative">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${
                      isPremium
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    <HiSparkles size={24} />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>

                  <p className="text-gray-500 text-sm leading-relaxed min-h-[64px]">
                    {plan.description}
                  </p>

                  <div className="mt-6 mb-5">
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-gray-950">
                        {plan.price}
                      </p>

                      {!isFree && (
                        <span className="text-sm text-gray-400 mb-1">
                          one-time
                        </span>
                      )}
                    </div>

                    <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold">
                      {plan.credits} Credits
                    </div>
                  </div>

                  <div className="h-px bg-green-100 my-5" />

                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <BsCheckCircle className="text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isFree ? (
                    <div className="w-full py-3 rounded-2xl font-bold bg-green-50 text-green-700 border border-green-100 text-center">
                      {plan.note}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onMouseEnter={() => setHoveredPlan(plan.id)}
                      onMouseLeave={() => setHoveredPlan(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(plan);
                      }}
                      className={`group w-full py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                        isSelected
                          ? "bg-green-700 text-white hover:bg-gray-950"
                          : "bg-gray-950 text-white hover:bg-green-700"
                      }`}
                    >
                      {isLoading
                        ? "Processing..."
                        : isHovered
                        ? "Proceed to Pay"
                        : "Select Plan"}

                      <BsArrowRight className="group-hover:translate-x-1 transition" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45 }}
          className="mt-10 bg-white/80 backdrop-blur-md border border-green-100 rounded-3xl p-5 shadow-sm text-center"
        >
          <p className="text-sm text-gray-500">
            Each interview consumes credits. You can start with the free plan and
            upgrade anytime when you need more practice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Pricing;