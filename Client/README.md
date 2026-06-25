# YeInterview.AI 🚀

YeInterview.AI is an AI-powered mock interview platform that helps candidates practice interviews with personalized questions, resume-based preparation, voice interaction, instant AI feedback, detailed performance reports, interview history, PDF report download, and Razorpay-powered credit purchases.

---

## 📌 Overview

Preparing for interviews can be stressful because candidates often do not know:

- What questions to practice
- How good their answers are
- Where they need improvement
- How to improve confidence and communication

YeInterview.AI solves this by creating a realistic AI interview experience where users can upload their resume, generate personalized questions, answer through voice or text, receive AI feedback, and track their progress through detailed reports.

---

## ✨ Features

### 🧾 Resume Analysis

Users can upload a PDF resume. The system extracts resume text and uses AI to identify:

- Role
- Experience
- Skills
- Projects
- Resume content

---

### 🤖 AI Interview Question Generation

The platform generates personalized interview questions based on:

- Selected role
- Experience level
- Interview mode
- Resume text
- Skills
- Projects

---

### 🎙 Voice-Based Interview Simulation

Users can practice with an AI interviewer using:

- Text-to-speech for AI questions
- Speech recognition for user answers
- Manual typing support
- Timer-based question flow

---

### ⏱ Timer-Based Interview Practice

Each question has a specific time limit to simulate real interview pressure.

---

### 📊 AI Answer Evaluation

Each answer is evaluated on:

- Confidence
- Communication
- Correctness
- Final score
- Short feedback

---

### 📈 Detailed Interview Report

After completing an interview, users can view:

- Overall score
- Confidence score
- Communication score
- Correctness score
- Question-wise scores
- AI feedback
- User answers
- Performance chart
- PDF report download

---

### 🕘 Interview History

Users can see previous interviews and open full detailed reports anytime.

---

### 💳 Credit System and Razorpay Payment

The app includes a credit-based system. Users can purchase credits using Razorpay.

Plans include:

| Plan | Price | Credits |
|---|---:|---:|
| Free | ₹0 | 100 |
| Standard | ₹99 | 150 |
| Premium | ₹499 | 650 |

---

## 🛠 Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- Axios
- Motion
- React Icons
- React Speech Recognition
- Recharts
- React Circular Progressbar
- jsPDF
- jspdf-autotable
- Razorpay Checkout

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- pdfjs-dist
- OpenRouter AI API
- Razorpay API
- Crypto module for payment verification

---

## 🧠 How It Works

1. User logs in to the platform.
2. User selects role, experience, and interview mode.
3. User can optionally upload a resume.
4. Backend extracts resume text from PDF.
5. AI analyzes resume and extracts structured information.
6. AI generates personalized interview questions.
7. User answers questions using mic or text.
8. AI evaluates every answer.
9. Final report is generated.
10. User can download report and view history later.

---

## 📁 Project Structure

```bash
YeInterview/
├── Client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Step1Setup.jsx
│   │   │   ├── Step2Interview.jsx
│   │   │   ├── Step3Report.jsx
│   │   │   └── Timer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Pricing.jsx
│   │   │   └── InterviewHistory.jsx
│   │   ├── redux/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── Server/
│   ├── controllers/
│   │   ├── interview.controller.js
│   │   └── payment.controller.js
│   ├── middleware/
│   │   ├── isAuth.js
│   │   └── multer.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── interview.model.js
│   │   └── payment.model.js
│   ├── routes/
│   │   ├── interview.routes.js
│   │   └── payment.routes.js
│   ├── services/
│   │   ├── openRouter.services.js
│   │   └── razorpay.services.js
│   ├── index.js
│   └── package.json
│
└── README.md