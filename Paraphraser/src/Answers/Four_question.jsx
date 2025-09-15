import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const words = [
  { clue: "A person who writes books", word: "AUTHOR" },
  { clue: "Opposite of 'always'", word: "NEVER" },
  { clue: "Another word for intelligent", word: "SMART" },
  { clue: "Synonym of 'beautiful'", word: "PRETTY" },
  { clue: "A device you use to call someone", word: "PHONE" },
  { clue: "Synonym of 'fast'", word: "QUICK" },
  { clue: "A place where students learn", word: "SCHOOL" },
  { clue: "The opposite of 'sad'", word: "HAPPY" },
  { clue: "A shape with three sides", word: "TRIANGLE" },
  { clue: "The first meal of the day", word: "BREAKFAST" },
];

const scramble = (word) =>
  word.split("").sort(() => Math.random() - 0.5).join("");

const Four_question = () => {
  const location = useLocation();
  const score1 = location.state?.score1 || 0;

  const [current, setCurrent] = useState(0);
  const [scrambled, setScrambled] = useState(scramble(words[0].word));
  const [answer, setAnswer] = useState("");
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score2, setScore2] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (answer === words[current].word) {
      setScore2((s) => s + 1);
    }
    if (current < words.length - 1) {
      setCurrent((c) => c + 1);
      setScrambled(scramble(words[current + 1].word));
      setAnswer("");
      setTimeLeft(15);
    } else {
      setFinished(true);
    }
  };

  useEffect(() => {
    if (finished) return;
    if (timeLeft === 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, finished]);

  if (finished) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-sky-50 text-center p-6">
        <h1 className="text-4xl font-extrabold text-sky-700 mb-4">🎉 Well Done!</h1>
        <button
          onClick={() =>
            navigate("/timer-indicated", { state: { score1, score2 } })
          }
          className="px-8 py-4 bg-sky-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-sky-600 transition-all"
        >
          Next Challenge →
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white p-6">
      <h2 className="text-lg font-medium text-gray-600 mb-2">
        Word {current + 1} of {words.length}
      </h2>
      <div className="text-red-600 font-bold text-xl mb-4">⏳ {timeLeft}s</div>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg text-center border border-gray-100">
        <div className="bg-sky-100 text-sky-800 p-4 rounded-lg shadow-sm mb-6 text-lg font-medium">
          Clue: <span className="font-bold">{words[current].clue}</span>
        </div>
        <div className="text-4xl font-extrabold tracking-widest text-sky-600 mb-8">
          {scrambled}
        </div>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.toUpperCase())}
          placeholder="TYPE YOUR ANSWER"
          className="uppercase border-2 border-sky-300 rounded-xl p-4 w-full text-center text-lg font-bold tracking-widest"
        />
        <button
          onClick={handleNext}
          className="mt-8 w-full px-6 py-4 bg-sky-500 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-sky-600"
        >
          {current === words.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Four_question;
