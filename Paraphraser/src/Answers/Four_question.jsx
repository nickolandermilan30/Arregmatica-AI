import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import userImage from "../assets/AI.jpg";

const questions = [
  { id: 1, question: "What is the synonym of 'difficult'?", answer: "hard" },
  { id: 2, question: "Fill in the blank: She has been working here ____ 2015.", answer: "since" },
  { id: 3, question: "What is the comparative form of 'good'?", answer: "better" },
  { id: 4, question: "Fill in the blank: If I ____ more time, I would travel abroad.", answer: "had" },
  { id: 5, question: "What is the past participle of 'write'?", answer: "written" },
];


const Four_question = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timer <= 0) {
      handleNext();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const handleNext = () => {
    const updatedAnswers = {
      ...answers,
      [questions[currentIndex].id]: userAnswer.trim().toLowerCase(),
    };

    setAnswers(updatedAnswers);
    setUserAnswer("");
    setTimer(30);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // ✅ Compute score with final answer included
      let finalScore = 0;
      questions.forEach((q) => {
        if (updatedAnswers[q.id] === q.answer.toLowerCase()) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setShowModal(true);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center relative">
      {/* User Info */}
      <div className="bg-white rounded-xl shadow-lg flex items-center p-6 mb-6 w-full max-w-3xl">
        <img
          src={userImage}
          alt="User"
          className="w-20 h-20 rounded-full object-cover mr-6"
        />
        <div className="flex-1">
          <p className="text-lg font-semibold">{formData?.fullName || "Full Name"}</p>
          <p className="text-gray-600">{formData?.email || "Email"}</p>
          <p className="text-gray-600">{formData?.occupation || "Occupation / Student"}</p>
        </div>
        <div className="text-right text-gray-700 font-semibold">🕒 {timer}s</div>
      </div>

      {/* Question Box */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
        <p className="font-semibold mb-4">
          Question {currentIndex + 1} / {questions.length}
        </p>
        <p className="mb-4 text-lg">{currentQuestion.question}</p>

        <input
          type="text"
          value={userAnswer}
          onChange={handleInputChange}
          placeholder="Type your exact answer..."
          className="border rounded-xl p-3 w-full mb-4 focus:ring-2 focus:ring-sky-400 outline-none"
        />

        <button
          onClick={handleNext}
          disabled={!userAnswer.trim()}
          className={`w-full font-semibold py-3 rounded-lg shadow-md transition-colors ${
            userAnswer.trim()
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentIndex === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>


      {/* ✅ Modal with Score */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-transparent z-50">
    <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-10 text-center w-full max-w-4xl flex flex-col md:flex-row gap-8">
      
      {/* Left Side: User Info */}
      <div className="flex flex-col items-center md:w-1/2 bg-gray-100 rounded-xl p-6 shadow-inner">
        <img
          src={userImage}
          alt="User"
          className="w-28 h-28 rounded-full object-cover mb-4 shadow-md"
        />
        <p className="mb-2 text-lg font-semibold">👤 {formData?.fullName || "N/A"}</p>
        <p className="mb-2">📧 {formData?.email || "N/A"}</p>
        <p className="mb-2">💼 {formData?.occupation || "N/A"}</p>
      </div>

      {/* Right Side: Score + Message */}
      <div className="flex flex-col justify-center md:w-1/2">
        <h2 className="text-3xl font-bold mb-4">Good Job 🎉</h2>
        <p className="mb-2 text-xl font-semibold">
          Your Score: <span className="text-sky-600">{score}</span> / {questions.length}
        </p>
        <p className="mb-6 text-gray-600">
          You have completed this quiz! Take a break and start the next one.
        </p>

<button
  onClick={() =>
    navigate("/timer-indicated", { state: { formData } })
  }
  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors"
>
  Start Next Quiz
</button>


      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Four_question;
