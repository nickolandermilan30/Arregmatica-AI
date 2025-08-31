import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import userImage from "../assets/AI.jpg";

const questions = [
  {
    id: 1,
    question: "She ____ to the store yesterday.",
    options: ["go", "went", "gone", "going"],
    answer: "went",
  },
  {
    id: 2,
    question: "I have ____ my homework already.",
    options: ["do", "did", "done", "doing"],
    answer: "done",
  },
  {
    id: 3,
    question: "They ____ playing football every weekend.",
    options: ["is", "are", "am", "be"],
    answer: "are",
  },
  {
    id: 4,
    question: "He ____ a new car last week.",
    options: ["buy", "buys", "bought", "buying"],
    answer: "bought",
  },
  {
    id: 5,
    question: "We ____ dinner when the phone rang.",
    options: ["have", "had", "having", "has"],
    answer: "had",
  },
];

const Multiple_choice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (timer <= 0) {
      nextQuestion();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const nextQuestion = () => {
    if (selectedOption) {
      setAnswers((prev) => ({
        ...prev,
        [questions[currentIndex].id]: selectedOption,
      }));
    }
    setSelectedOption("");
    setTimer(30);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // ✅ Compute Score
      let finalScore = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.answer) {
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

        <div className="flex flex-col gap-3 mb-4">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt)}
              className={`border rounded-xl p-3 text-left transition-colors ${
                selectedOption === opt
                  ? "bg-sky-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
  onClick={nextQuestion}
  disabled={!selectedOption} // 🚫 Disabled kung walang napiling option
  className={`w-full font-semibold py-3 rounded-lg shadow-md transition-colors ${
    selectedOption
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
            navigate("/four-question", { state: { formData } })
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

export default Multiple_choice;
