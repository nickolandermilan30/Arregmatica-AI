import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "Which sentence is grammatically correct?",
    options: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day."
    ],
    answer: 1,
  },
  {
    question: "What is the synonym of 'happy'?",
    options: ["Sad", "Joyful", "Angry", "Upset"],
    answer: 1,
  },
  {
    question: "Choose the correct past tense: 'He ____ to the market yesterday.'",
    options: ["go", "goes", "went", "gone"],
    answer: 2,
  },
  {
    question: "Which word is a noun?",
    options: ["Run", "Quickly", "Happiness", "Blue"],
    answer: 2,
  },
  {
    question: "What is the antonym of 'difficult'?",
    options: ["Easy", "Hard", "Complicated", "Tough"],
    answer: 0,
  },
  {
    question: "Identify the adjective: 'The sky is clear today.'",
    options: ["Sky", "Clear", "Today", "Is"],
    answer: 1,
  },
  {
    question: "Which sentence is in future tense?",
    options: [
      "I am eating dinner.",
      "I will eat dinner.",
      "I ate dinner.",
      "I eat dinner."
    ],
    answer: 1,
  },
  {
    question: "What is the plural of 'child'?",
    options: ["Childs", "Childes", "Children", "Childrens"],
    answer: 2,
  },
  {
    question: "Choose the correct article: 'She bought ____ apple.'",
    options: ["a", "an", "the", "no article"],
    answer: 1,
  },
  {
    question: "Which sentence uses the correct form?",
    options: [
      "They is playing football.",
      "They are playing football.",
      "They am playing football.",
      "They playing football."
    ],
    answer: 1,
  },
];

const Multiple_choice = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  // Timer
  useEffect(() => {
    if (finished) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, finished]);

  const handleNext = () => {
    if (selected === questions[currentQ].answer) {
      setScore((s) => s + 1);
    }
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setTimeLeft(15);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-white text-center p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">✅ Quiz Done!</h1>
        <p className="text-gray-600 mb-6">Now, let’s try the word scramble challenge.</p>
        <button
          onClick={() => navigate("/four-question", { state: { score1: score } })}
          className="px-6 py-3 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600"
        >
          Next Challenge
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white p-6">
      {/* Timer */}
      <div className="text-right w-full max-w-2xl mb-4 text-lg font-semibold text-gray-700">
        ⏱ Time left: {timeLeft}s
      </div>

      {/* Question */}
      <div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {currentQ + 1}. {questions[currentQ].question}
        </h2>
        <div className="space-y-3">
          {questions[currentQ].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                selected === i
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600"
          >
            {currentQ === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Multiple_choice;
