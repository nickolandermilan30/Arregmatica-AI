import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const words = [
  {
    clue: "Studies remains of past human life",
    word: "ARCHAEOLOGIST",
  },
  {
    clue: "Studies stars, planets, and galaxies",
    word: "ASTRONOMER",
  },
  {
    clue: "Global outbreak of a disease",
    word: "PANDEMIC",
  },
  {
    clue: "Place where historical items are kept",
    word: "MUSEUM",
  },
  {
    clue: "Science of living organisms",
    word: "BIOLOGY",
  },
];

// ✅ Function para magdagdag ng pang-gulo letters
const addDistractors = (word) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const distractors = Array.from({ length: 5 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  );
  return [...word.split(""), ...distractors].sort(() => Math.random() - 0.5);
};

const HardPuzzle = () => {
  const location = useLocation();
  const score1 = location.state?.score1 || 0;
  const score2 = location.state?.score2 || 0;

  const [current, setCurrent] = useState(0);
  const [letters, setLetters] = useState(addDistractors(words[0].word));
  const [answer, setAnswer] = useState([]);
  const [timeLeft, setTimeLeft] = useState(40);
  const [score3, setScore3] = useState(0);
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (finished) return;
    if (timeLeft === 0) {
      handleCheck();
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const handleDrop = (letter, index) => {
    setAnswer((a) => [...a, letter]);
    setLetters((l) => l.filter((_, i) => i !== index));
  };

  // ✅ Isa-isang clear (huling letter lang)
  const handleClear = () => {
    if (answer.length === 0) return;
    const lastLetter = answer[answer.length - 1];
    setAnswer((a) => a.slice(0, a.length - 1));
    setLetters((l) => [...l, lastLetter].sort(() => Math.random() - 0.5));
  };

  const handleCheck = () => {
    if (answer.join("") === words[current].word) {
      setScore3((s) => s + 1);
    }
    if (current < words.length - 1) {
      setCurrent((c) => c + 1);
      setLetters(addDistractors(words[current + 1].word));
      setAnswer([]);
      setTimeLeft(40);
    } else {
      setFinished(true);
      navigate("/score", { state: { score1, score2, score3 } });
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-blue-50 p-6">
      <div className="text-right w-full max-w-3xl mb-4 text-lg font-semibold text-blue-700">
        ⏱ {timeLeft}s
      </div>
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="bg-blue-100 text-blue-900 p-4 rounded-lg mb-6">
          <span className="font-bold">Clue:</span> {words[current].clue}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {words[current].word.split("").map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 flex items-center justify-center border-2 border-blue-300 rounded-lg bg-gray-50 text-lg font-bold uppercase"
            >
              {answer[i] || ""}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {letters.map((letter, i) => (
            <div
              key={i}
              onClick={() => handleDrop(letter, i)}
              className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-lg cursor-pointer text-lg font-bold"
            >
              {letter}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500 transition"
          >
            Clear ✖
          </button>
          <button
            onClick={handleCheck}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition"
          >
            {current === words.length - 1 ? "Finish →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HardPuzzle;
