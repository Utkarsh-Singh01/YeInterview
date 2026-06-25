import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("File cleanup failed:", error.message);
    }
  }
};

const safeParseJSON = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid AI response");
  }

  let cleaned = text.trim();

  const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlock) {
    cleaned = jsonBlock[1].trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
};

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(10, Math.round(number)));
};

const cleanQuestionText = (question) => {
  const raw =
    typeof question === "string"
      ? question
      : question?.question || question?.text || "";

  return String(raw)
    .replace(/^\s*(?:\d+[\).:-]?|[-*•])\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const parseQuestionsFromText = (text) => {
  if (!text || typeof text !== "string") return [];

  return text
    .split(/\r?\n/)
    .map(cleanQuestionText)
    .filter((q) => q.length > 10)
    .slice(0, 5);
};

const buildFallbackQuestions = (role) => [
  `Can you briefly introduce your experience as a ${role} and the main responsibilities you handled in your recent work?`,
  "Which project from your resume are you most confident about, and what was your specific contribution to it?",
  "How do you decide the right approach when you face a technical problem you have not solved before?",
  "Can you explain one difficult bug or challenge you faced and how you found the root cause?",
  `If you had to improve one of your ${role} projects for production, what would you change first and why?`,
];

const extractResumeTextFromPdf = async (filePath) => {
  const fileBuffer = await fs.promises.readFile(filePath);
  const uint8Array = new Uint8Array(fileBuffer);

  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

  let resumeText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str || "").join(" ");

    resumeText += pageText + "\n";
  }

  return resumeText.replace(/\s+/g, " ").trim();
};

// ANALYZE RESUME 

export const analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume not uploaded" });
    }

    filePath = req.file.path;

    const resumeText = await extractResumeTextFromPdf(filePath);

    if (!resumeText) {
      return res.status(400).json({
        error: "Could not extract text from resume",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You extract structured data from resumes.

Return ONLY valid JSON. No markdown. No extra text.

Use this exact shape:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}

Rules:
- If role is not clear, use empty string.
- If experience is not clear, use empty string.
- Extract only important projects.
- Extract only relevant technical and professional skills.`,
      },
      {
        role: "user",
        content: resumeText.slice(0, 20000),
      },
    ];

    let parsed;

    try {
      const aiResponse = await askAi(messages, 700, {
        json: true,
        temperature: 0.1,
      });

      parsed = safeParseJSON(aiResponse);
    } catch (aiError) {
      console.error("AI resume analysis failed:", aiError.message);

      return res.status(200).json({
        role: "",
        experience: "",
        projects: [],
        skills: [],
        resumeText,
        warning:
          "Resume text extracted, but AI analysis is unavailable. Please fill details manually.",
      });
    }

    return res.status(200).json({
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      resumeText,
    });
  } catch (error) {

    console.error("Error reading resume file:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    cleanupFile(filePath);
  }
};

// GENERATE QUESTIONS 
export const generateQuestions = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        error: "Role, experience and mode are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.credits < 50) {
      return res.status(403).json({
        error: "Not enough credits, minimum 50 required",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length
        ? projects.join(", ")
        : "None";

    const skillText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `Role: ${role}
Experience: ${experience}
Mode: ${mode}
Projects: ${projectText}
Skills: ${skillText}
Resume: ${safeResume.slice(0, 12000)}`;

    const messages = [
      {
        role: "system",
        content: `You are a real human interviewer conducting a professional interview.

Generate exactly 5 interview questions.

Return ONLY valid JSON. No markdown. No extra text.

Use this exact shape:
{
  "questions": [
    "question one",
    "question two",
    "question three",
    "question four",
    "question five"
  ]
}

Strict Rules:
- Exactly 5 questions.
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 -> easy
Question 2 -> easy
Question 3 -> medium
Question 4 -> medium
Question 5 -> hard

Make questions based on role, experience, mode, projects, skills, and resume.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    let aiResponse = "";

    try {
      aiResponse = await askAi(messages, 900, {
        json: true,
        temperature: 0.6,
      });
    } catch (aiError) {
      console.error("AI question generation failed:", aiError.message);

      return res.status(503).json({
        error: "AI question generation is unavailable. Please try again later.",
        message: aiError.message,
      });
    }

    let questionArray = [];

    try {
      const parsed = safeParseJSON(aiResponse);

      if (Array.isArray(parsed.questions)) {
        questionArray = parsed.questions.map(cleanQuestionText);
      }
    } catch (parseError) {
      console.error("Question JSON parse failed:", parseError.message);
      console.error("Raw AI response:", aiResponse);

      questionArray = parseQuestionsFromText(aiResponse);
    }

    questionArray = questionArray.filter((q) => q.length > 10);

    if (questionArray.length < 5) {
      const fallbackQuestions = buildFallbackQuestions(role);
      questionArray = [...questionArray, ...fallbackQuestions].slice(0, 5);
    }

    user.credits -= 50;

    await user.save();

    const difficulties = ["Easy", "Easy", "Medium", "Medium", "Hard"];
    const timeLimits = [60, 60, 90, 90, 120];

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionArray.map((question, index) => ({
        question,
        difficulty: difficulties[index],
        timeLimit: timeLimits[index],
      })),
    });

    return res.status(200).json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    console.error("Error generating questions:", error);

    return res.status(500).json({
      message: `Error generating questions: ${error.message || error}`,
    });
  }
};

// SUBMIT ANSWER
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const index = Number(questionIndex);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({
        error: "Invalid question index",
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const question = interview.questions[index];

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!answer || !answer.trim()) {
      question.confidence = 0;
      question.communication = 0;
      question.correctness = 0;
      question.score = 0;

      question.feedback = "You did not provide an answer to this question.";
      question.answers = "";
      question.timeTaken = timeTaken || 0;

      await interview.save();

      return res.status(200).json({
        feedback: question.feedback,
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are a professional human interviewer evaluating a candidate's answer.

Score the answer from 0 to 10 in these areas:
1. confidence
2. communication
3. correctness

Calculate:
finalScore = average of confidence, communication, correctness rounded to whole number.

Return ONLY valid JSON. No markdown. No extra text.

Use this exact shape:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}

Feedback Rules:
- 10 to 15 words only.
- Natural, human tone.
- Professional and honest.
- Can suggest improvement.`,
      },
      {
        role: "user",
        content: `Question: ${question.question}\nAnswer: ${answer}`,
      },
    ];

    let parsed;

    try {
      const aiResponse = await askAi(messages, 500, {
        json: true,
        temperature: 0.2,
      });

      parsed = safeParseJSON(aiResponse);
    } catch (aiError) {
      console.error("submitAnswer AI/JSON failed:", aiError.message);

      question.confidence = 5;
      question.communication = 5;
      question.correctness = 5;
      question.score = 5;
      question.feedback = "Good attempt. Keep improving clarity, confidence, and technical depth.";
      question.answers = answer;
      question.timeTaken = timeTaken || 0;

      await interview.save();

      return res.status(200).json({
        feedback: question.feedback,
      });
    }

    const confidence = clampScore(parsed.confidence);
    const communication = clampScore(parsed.communication);
    const correctness = clampScore(parsed.correctness);

    const finalScore = Number.isFinite(Number(parsed.finalScore))
      ? clampScore(parsed.finalScore)
      : clampScore((confidence + communication + correctness) / 3);

    question.confidence = confidence;
    question.communication = communication;
    question.correctness = correctness;
    question.score = finalScore;
    question.feedback = parsed.feedback || "Thank you for your answer.";
    question.answers = answer;
    question.timeTaken = timeTaken || 0;

    await interview.save();

    return res.status(200).json({
      feedback: question.feedback,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);

    return res.status(500).json({
      message: `Error submitting answer: ${error.message || error}`,
    });
  }
};

// FINISH INTERVIEW
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    const answeredQuestions = interview.questions.filter(
      (q) => q.answers && q.answers.trim()
    );

    const questionsForAverage =
      answeredQuestions.length > 0 ? answeredQuestions : interview.questions;

    const countForAvg = questionsForAverage.length || 1;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    questionsForAverage.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalScore / countForAvg;
    const avgConfidence = totalConfidence / countForAvg;
    const avgCommunication = totalCommunication / countForAvg;
    const avgCorrectness = totalCorrectness / countForAvg;

    interview.finalScore = finalScore;
    interview.status = "Completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      totalQuestions,
      answeredQuestions: answeredQuestions.length,
      questionWiseScores: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        answer: q.answers || "",
        timeTaken: q.timeTaken || 0,
      })),
    });
  } catch (error) {
    console.error("Error finishing interview:", error);

    return res.status(500).json({
      message: `Error finishing interview: ${error.message || error}`,
    });
  }
};

// GET MY INTERVIEWS
export const getMyInterviews = async (req, res) => {
  try {

    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt questions")
      .lean();

    return res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error fetching interviews:", error);

    return res.status(500).json({
      message: `Error fetching interviews: ${error.message || error}`,
    });
  }
};

//  GET INTERVIEW REPORT 
export const getInterviewReport = async (req, res) => {
  try {

    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    const answeredQuestions = interview.questions.filter(
      (q) => q.answers && q.answers.trim()
    );

    const questionsForAverage =
      answeredQuestions.length > 0 ? answeredQuestions : interview.questions;

    const countForAvg = questionsForAverage.length || 1;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    questionsForAverage.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore =
      interview.finalScore || Number((totalScore / countForAvg).toFixed(1));

    const avgConfidence = totalConfidence / countForAvg;
    const avgCommunication = totalCommunication / countForAvg;
    const avgCorrectness = totalCorrectness / countForAvg;

    return res.status(200).json({
      interviewId: interview._id,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      status: interview.status,
      createdAt: interview.createdAt,

      finalScore: Number(Number(finalScore || 0).toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),

      totalQuestions,
      answeredQuestions: answeredQuestions.length,

      questionWiseScores: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        answer: q.answers || "",
        timeTaken: q.timeTaken || 0,
        difficulty: q.difficulty || "",
        timeLimit: q.timeLimit || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching interview report:", error);

    return res.status(500).json({
      message: `Error fetching interview report: ${error.message || error}`,
    });
  }
};