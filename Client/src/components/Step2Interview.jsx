import React, { useState, useRef, useEffect, useCallback } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions = [], userName } = interviewData || {};

  const videoRef = useRef(null);
  const isAIPlayingRef = useRef(false);
  const isMicOnRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const introPlayedRef = useRef(false);
  const spokenQuestionIndexRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(false);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const currentQuestion = questions[currentIndex];
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  useEffect(() => {
    if (transcript && !isAIPlayingRef.current) {
      setAnswers(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;

      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;


      const femaleVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes("female") ||
          name.includes("zira") ||
          name.includes("samantha") ||
          name.includes("google uk english female")
        );
      });

      const maleVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes("david") ||
          name.includes("mark") ||
          name.includes("male") ||
          name.includes("google uk english male")
        );
      });

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]);
        setVoiceGender("female");
      }
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stopMic = useCallback(() => {
    SpeechRecognition.stopListening();
    isMicOnRef.current = false;
  }, []);

  const startMic = useCallback(() => {
    if (isAIPlayingRef.current) return;

    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      return;
    }

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });

    isMicOnRef.current = true;
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  const speakText = useCallback(
    (text, isQuestion = false) => {
      return new Promise((resolve) => {
        if (!text) {
          resolve();
          return;
        }

        if (!window.speechSynthesis || !selectedVoice) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        utterance.onstart = () => {
          isAIPlayingRef.current = true;
          setIsAIPlaying(true);

          SpeechRecognition.stopListening();

          const playPromise = videoRef.current?.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {});
          }
        };

        utterance.onend = () => {
          isAIPlayingRef.current = false;
          setIsAIPlaying(false);

          videoRef.current?.pause();
          if (videoRef.current) videoRef.current.currentTime = 0;

          if (isQuestion) {
            setTimerActive(true);
          }

          if (
            isMicOnRef.current &&
            browserSupportsSpeechRecognition &&
            isMicrophoneAvailable
          ) {
            SpeechRecognition.startListening({
              continuous: true,
              language: "en-US",
            });
          }

          setTimeout(() => {
            setSubtitle("");
            resolve();
          }, 200);
        };

        utterance.onerror = () => {
          isAIPlayingRef.current = false;
          setIsAIPlaying(false);
          videoRef.current?.pause();
          setSubtitle("");
          resolve();
        };

        setSubtitle(text);
        window.speechSynthesis.speak(utterance);
      });
    },
    [selectedVoice, browserSupportsSpeechRecognition, isMicrophoneAvailable]
  );

  useEffect(() => {
    if (!selectedVoice) return;
    if (!questions.length) return;

    let cancelled = false;

    const runFlow = async () => {
      if (cancelled) return;

      if (isIntroPhase) {
        if (introPlayedRef.current) return;
        introPlayedRef.current = true;

        await speakText(
          `Hello ${
            userName || "Candidate"
          }, welcome to your AI interview. I will ask you some questions. Please answer them clearly. Let us get started.`
        );

        if (cancelled) return;

        await speakText(
          "I will now read your first question. Your timer will start after I finish reading."
        );

        if (cancelled) return;

        setIsIntroPhase(false);
        return;
      }

      if (!currentQuestion) return;

      if (spokenQuestionIndexRef.current === currentIndex) return;
      spokenQuestionIndexRef.current = currentIndex;

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (cancelled) return;

      if (currentIndex === questions.length - 1) {
        await speakText("This is your final question.");
      }

      if (cancelled) return;

      await speakText(currentQuestion.question, true);
    };

    runFlow();

    return () => {
      cancelled = true;
    };
  }, [
    selectedVoice,
    isIntroPhase,
    currentIndex,
    currentQuestion,
    questions.length,
    userName,
    speakText,
  ]);

  // TIMER 
  useEffect(() => {
    if (!timerActive || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, isSubmitting]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setTimerActive(false);
    }
  }, [currentIndex, currentQuestion, isIntroPhase]);

  const toggleMic = () => {
    setErrorMsg("");

    if (isMicOn) {
      stopMic();
      setIsMicOn(false);
      return;
    }

    resetTranscript();
    startMic();
    setIsMicOn(true);
  };

  // SUBMIT ANSWER 
  const submitAnswer = async () => {
    if (isSubmittingRef.current) return;
    if (!currentQuestion) return;

    isSubmittingRef.current = true;

    stopMic();
    setIsMicOn(false);
    setTimerActive(false);
    setIsSubmitting(true);
    setErrorMsg("");

    const finalAnswer = (answers || transcript || "").trim();

    try {
     
      const { data } = await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer: finalAnswer,
          timeTaken: (currentQuestion.timeLimit || 60) - timeLeft,
        },
        {
          withCredentials: true,
        }
      );

      const fb = data?.feedback || "Thank you for your answer.";

      setFeedback(fb);

      speakText(fb);
    } catch (error) {
      console.error("Error submitting answer:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit answer. Please try again.";

      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const finishInterview = async () => {
    stopMic();
    isMicOnRef.current = false;
    setIsMicOn(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {

      const { data } = await axios.post(
        `${ServerUrl}/api/interview/finish`,
        {
          interviewId,
        },
        {
          withCredentials: true,
        }
      );

      console.log("✅ Interview finished:", data);
      onFinish(data || {});
    } catch (error) {
      console.error("❌ Error finishing interview:", error);
      onFinish({});
    }
  };

  const handleNext = async () => {
    setFeedback("");
    setAnswers("");
    setErrorMsg("");
    resetTranscript();

    setIsMicOn(false);
    stopMic();

    if (currentIndex + 1 >= questions.length) {
      await finishInterview();
      return;
    }

    await speakText("Alright, moving on to the next question.");

    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;

    if (timeLeft === 0 && !isSubmittingRef.current && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getStatusText = () => {
    if (isAIPlaying) return "AI Speaking";
    if (!browserSupportsSpeechRecognition) return "Browser unsupported";
    if (!isMicrophoneAvailable) return "Mic access denied";
    if (listening) return "Listening...";
    if (isMicOn) return "Mic on";
    return "Waiting";
  };

  const getStatusColor = () => {
    if (isAIPlaying) {
      return { dot: "bg-green-500", text: "text-green-500" };
    }

    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      return { dot: "bg-red-500", text: "text-red-500" };
    }

    if (listening) {
      return { dot: "bg-blue-500", text: "text-blue-500" };
    }

    return { dot: "bg-gray-300", text: "text-gray-400" };
  };

  const statusColor = getStatusColor();

  if (!questions.length || !interviewId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Interview data missing
          </h2>
          <p className="text-sm text-gray-600">
            Please go back and generate interview questions again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-6xl min-h-[80vh] bg-white rounded-2xl shadow-lg p-4 border border-gray-200 flex flex-col lg:flex-row gap-5 overflow-hidden"
      >
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="w-full lg:w-[38%] bg-white flex flex-col gap-5 lg:pr-5 lg:border-r border-gray-200"
        >
          <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              loop
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

          <AnimatePresence>
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full bg-gray-100 rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full bg-white rounded-xl border border-gray-200 shadow-md px-5 py-5">
            <h3 className="text-sm font-medium text-gray-600">
              Interview Status
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`h-2.5 w-2.5 rounded-full animate-pulse ${statusColor.dot}`}
              />

              <h3 className={`text-base font-semibold ${statusColor.text}`}>
                {getStatusText()}
              </h3>
            </div>

            {!browserSupportsSpeechRecognition && (
              <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg">
                Speech recognition is not supported. You can type your answer.
              </p>
            )}

            {!isMicrophoneAvailable && (
              <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg">
                🎤 Mic access denied. Allow microphone in browser settings.
              </p>
            )}

            <div className="h-px bg-gray-200 my-4" />

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            {!timerActive && !isIntroPhase && !feedback && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Timer starts after AI reads the question
              </p>
            )}

            <div className="h-px bg-gray-200 my-4" />

            <div className="grid grid-cols-2 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </p>
                <p className="text-xs text-gray-400 mt-1">Current Question</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1} / {questions.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Total Questions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="w-full lg:w-[62%] flex flex-col"
        >
          <h1 className="text-2xl font-bold text-emerald-600 mb-5">
            AI Smart Interview
          </h1>

          {!isIntroPhase && currentQuestion && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
              <p className="text-xs text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <h2 className="text-base font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </h2>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <textarea
            className="w-full flex-1 min-h-[280px] border-2 border-emerald-400 rounded-xl p-5 text-sm text-gray-700 outline-none resize-none focus:ring-2 focus:ring-emerald-200 transition-all"
            placeholder={
              isIntroPhase
                ? "Interview is starting, please wait..."
                : isAIPlaying
                ? "AI is reading the question, please wait..."
                : "Speak using mic or type your answer here..."
            }

            onChange={(e) => setAnswers(e.target.value)}
            value={answers}
            disabled={isIntroPhase || isAIPlaying}
          />

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
              >
                <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">
                  AI Feedback
                </p>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {feedback}
                </p>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isAIPlaying}
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {currentIndex + 1 >= questions.length
                    ? "Finish Interview"
                    : "Next Question"}

                  <BsArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!feedback && (
            <div className="mt-4 flex items-center gap-4">
              <motion.button
                type="button"
                onClick={toggleMic}
                disabled={
                  isIntroPhase ||
                  isAIPlaying ||
                  !browserSupportsSpeechRecognition ||
                  !isMicrophoneAvailable
                }
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                animate={
                  listening
                    ? {
                        boxShadow: [
                          "0 0 0 0 rgba(16,185,129,0.45)",
                          "0 0 0 12px rgba(16,185,129,0)",
                        ],
                      }
                    : {
                        boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                      }
                }
                transition={
                  listening
                    ? { duration: 1.2, repeat: Infinity, ease: "easeOut" }
                    : { duration: 0.2 }
                }
                className={`relative h-12 w-12 rounded-full text-white flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${
                  listening
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-black hover:bg-gray-800"
                }`}
                aria-label={listening ? "Turn mic off" : "Turn mic on"}
              >
                {listening ? (
                  <FaMicrophone className="text-lg" />
                ) : (
                  <FaMicrophoneSlash className="text-lg" />
                )}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={submitAnswer}
                disabled={isSubmitting || isIntroPhase || isAIPlaying}
                className="flex-1 h-12 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition shadow-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Submitting...
                  </span>
                ) : (
                  "Submit Answer"
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Step2Interview;