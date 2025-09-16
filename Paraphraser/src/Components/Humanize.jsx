import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { FaRegCopy } from "react-icons/fa";
import { Type } from "lucide-react"; 
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase"; // ✅ import firebase db
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ Import dark mode

const Humanize = () => {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const { darkMode } = useDarkMode(); // ✅ Use dark mode

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  // ✅ Kunin next index (1,2,3,...) sa "humanize"
  const getNextIndex = async () => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "humanize"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).length + 1;
    }
    return 1;
  };

  // ✅ Save input & output sa DB
  const saveToDatabase = async (inputText, resultText) => {
    try {
      const nextIndex = await getNextIndex();
      const newRef = ref(database, `humanize/${nextIndex}`);
      await set(newRef, {
        input: inputText,
        output: resultText,
        timestamp: new Date().toISOString(),
      });
      console.log("✅ Saved to Firebase");
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Rewrite this text so it sounds like it was written naturally by a human. 
Return only one short, natural version:\n"${text}"`,
      });

      const result = response.text.trim();
      setOutput(result);

      // ✅ Save sa Firebase
      await saveToDatabase(text, result);

      // fake progress
      setProgress(0);
      let counter = 0;
      const interval = setInterval(() => {
        counter += 25;
        if (counter >= 100) {
          counter = 100;
          clearInterval(interval);
        }
        setProgress(counter);
      }, 400);
    } catch (err) {
      console.error(err);
      setOutput("❌ Sorry, AI couldn't process your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);

      // show modal + progress
      setProgress(0);
      setShowModal(true);
      let counter = 0;
      const interval = setInterval(() => {
        counter += 20;
        if (counter >= 100) {
          counter = 100;
          clearInterval(interval);
        }
        setProgress(counter);
      }, 200);
    }
  };

  // ✅ Word Counter
  const wordCount = text.trim()
    ? text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-sky-50 via-white to-sky-100 text-gray-900"} min-h-screen flex flex-col`}>
      {/* HEADER */}
      <header className={`${darkMode ? "bg-gray-800 text-white" : "bg-blue-600 text-white"} py-6 shadow-lg`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-3">
          <Type size={32} className="text-white" />
          <h1 className="text-2xl md:text-3xl font-bold">AI Humanizer</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Input */}
          <div className={`flex flex-col rounded-2xl shadow-lg p-6 border relative ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
              ✍️ Enter your text
            </h2>
            <textarea
              className={`flex-grow min-h-[300px] border-2 rounded-xl p-4 shadow-sm focus:outline-none focus:ring-2 resize-none transition-all ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "border-sky-300 bg-white text-gray-800 focus:ring-sky-400"}`}
              placeholder="Paste or type text you want to humanize..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* 🔹 Word Counter Badge */}
            <div className="absolute bottom-28 right-10 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full shadow-md text-sm font-medium">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            <button
              onClick={handleHumanize}
              disabled={loading}
              className={`mt-4 font-semibold px-6 py-3 rounded-xl shadow transition disabled:opacity-50 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {loading ? "✨ Humanizing..." : "🤖 Humanize Text"}
            </button>
          </div>

          {/* Right - Output */}
          <div className={`relative flex flex-col rounded-2xl shadow-lg p-6 border min-h-[350px] ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
              ✅ Humanized Result
            </h2>
            {output && (
              <button
                onClick={handleCopy}
                className="absolute top-6 right-6 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow"
              >
                <FaRegCopy />
              </button>
            )}
            {loading ? (
              <p className={`italic ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Processing…</p>
            ) : output ? (
              <p className={`leading-relaxed whitespace-pre-line flex-grow ${darkMode ? "text-white" : "text-gray-800"}`}>
                {output}
              </p>
            ) : (
              <p className={`italic flex-grow ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
                📝 Your humanized text will appear here...
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}% Humanized</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center animate-fadeIn bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Copied!</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Your text has been successfully copied to the clipboard.
            </p>

            {/* Progress Display */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-6">{progress}% Complete</p>

            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium text-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Humanize;
