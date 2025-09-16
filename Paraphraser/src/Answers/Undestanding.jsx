import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const words = [
  {
    clue: "Studies remains of past human life",
    word: "ARfireaCHAEOLOGIST",
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

const scramble = (word) => word.split("").sort(() => Math.random() - 0.5);

const HardPuzzle = () => {
  const location = useLocation();
  const score1 = location.state?.score1 || 0;
  const score2 = location.state?.score2 || 0;

  const [current, setCurrent] = useState(0);
  const [letters, setLetters] = useState(scramble(words[0].word));
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

  const handleDrop = (letter) => {
    setAnswer((a) => [...a, letter]);
    setLetters((l) => l.filter((x, i) => i !== l.indexOf(letter)));
  };

  const handleCheck = () => {
    if (answer.join("") === words[current].word) {
      setScore3((s) => s + 1);
    }
    if (current < words.length - 1) {
      setCurrent((c) => c + 1);
      setLetters(scramble(words[current + 1].word));
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
              onClick={() => handleDrop(letter)}
              className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-lg cursor-pointer text-lg font-bold"
            >
              {letter}
            </div>
          ))}
        </div>
        <button
          onClick={handleCheck}
          className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition"
        >
          {current === words.length - 1 ? "Finish →" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default HardPuzzle;
