import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { FaRegCopy } from "react-icons/fa";

const Humanize = () => {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Rewrite this text so it sounds like it was written naturally by a human. 
Return only one short, natural version:\n"${text}"`,
      });

      setOutput(response.text.trim());

      // fake progress para sa right box
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col">
      {/* Title Bar */}
      <header className="bg-sky-600 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">✨ Humanize AI Text</h1>
          <span className="text-sm opacity-90">Powered by Arregmatica AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Input */}
          <div className="flex flex-col bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ✍️ Enter your text
            </h2>
            <textarea
              className="flex-grow min-h-[300px] border-2 border-sky-300 rounded-xl p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-800 resize-none"
              placeholder="Paste or type text you want to humanize..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={handleHumanize}
              disabled={loading}
              className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition disabled:opacity-50"
            >
              {loading ? "✨ Humanizing..." : "🤖 Humanize Text"}
            </button>
          </div>

          {/* Right - Output */}
          <div className="relative flex flex-col bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[350px]">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
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
              <p className="text-gray-500 italic">Processing…</p>
            ) : output ? (
              <p className="text-gray-800 leading-relaxed whitespace-pre-line flex-grow">
                {output}
              </p>
            ) : (
              <p className="text-gray-400 italic flex-grow">
                📝 Your humanized text will appear here...
              </p>
            )}

            {/* Progress Bar sa ilalim ng Right Box */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all duration-500"
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
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center animate-fadeIn">
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
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg shadow font-medium text-lg"
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
