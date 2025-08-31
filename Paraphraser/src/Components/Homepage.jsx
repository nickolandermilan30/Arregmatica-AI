import React, { useState } from "react";
import { FaReact, FaRegCopy } from "react-icons/fa";
import { GoogleGenAI } from "@google/genai";

const Homepage = () => {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("Standard");
  const [showStyleButton, setShowStyleButton] = useState(false);
  const [errors, setErrors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const handleGrammarCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Correct the grammar of this sentence and return ONLY the corrected sentence:\n"${text}"`,
      });
      setOutput(response.text.trim());
      setShowStyleButton(false);

      const errorResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `From this sentence: "${text}", list ONLY the incorrect words or phrases that need grammar correction.
Return them as a simple bullet list (one word/phrase per line) without explanation.`,
      });

      const wrongWords = errorResponse.text
        .split("\n")
        .map((w) => w.replace(/^[-*]\s*/, "").trim())
        .filter((w) => w.length > 0);

      setErrors(wrongWords);

      const recResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide 3 recommended alternative full sentences for this input, each grammatically correct and slightly different in phrasing:\n"${text}"\n
Return only one sentence per line without numbering or explanation.`,
      });

      const recList = recResponse.text
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      setRecommendations(recList);
    } catch (err) {
      console.error(err);
      setOutput("Sorry, AI couldn't process your request.");
      setErrors([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleParaphraseStyle = async (selectedStyle) => {
    if (!text.trim()) return;
    setLoading(true);
    setStyle(selectedStyle);
    setShowStyleButton(true);
    setErrors([]);
    setRecommendations([]);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Rewrite this sentence in a ${selectedStyle} style. 
Return ONLY one improved version of the sentence without explanation:\n"${text}"`,
      });
      setOutput(response.text.trim());
    } catch (err) {
      console.error(err);
      setOutput("Sorry, AI couldn't process your request.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((clipText) => setText(clipText));
  };

  const handleClearLeft = () => setText("");
  const handleClearRight = () => {
    setOutput("");
    setErrors([]);
    setRecommendations([]);
    setShowStyleButton(false);
  };

  const handleCopyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      alert("✅ Copied to clipboard!");
    }
  };

  const styles = [
    "Standard",
    "Fluent",
    "Humanize",
    "Formal",
    "Academic",
    "Simple",
    "Creative",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 py-6 md:px-8">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-6 md:mb-10 text-sky-600 tracking-wide font-serif drop-shadow-lg">
        Text Enhancer
      </h1>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        
        {/* Left Box */}
        <div className="flex flex-col h-full min-h-[300px]">
          <textarea
            className="w-full flex-grow min-h-[250px] md:min-h-[300px] border-2 border-sky-200 rounded-xl p-4 shadow bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 text-gray-800 transition-all resize-none"
            placeholder="✍️ Type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Paste & Clear buttons BELOW textarea */}
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={handlePaste}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
            >
              Paste
            </button>
            <button
              onClick={handleClearLeft}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Middle Box */}
        <div className="flex flex-col h-full min-h-[300px] relative">
          {showStyleButton && (
            <div className="flex flex-wrap gap-2 mb-2 justify-start">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => handleParaphraseStyle(s)}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    style === s
                      ? "bg-sky-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Corrected / Paraphrased Output */}
          <div className="relative flex-grow min-h-[150px] md:min-h-[200px] border-2 border-gray-200 rounded-xl p-4 shadow bg-white overflow-y-auto text-base leading-relaxed">
            {/* Copy Button */}
            {output && (
              <button
                onClick={handleCopyOutput}
                className="absolute top-2 right-2 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow transition-transform hover:scale-110"
              >
                <FaRegCopy />
              </button>
            )}

            {loading ? (
              <p className="text-gray-500 italic">Loading…</p>
            ) : output ? (
              <>
                <h3 className="font-bold mb-2">{style} Style:</h3>
                <p>{output}</p>
              </>
            ) : (
              <p className="text-gray-400 italic">
                ✨ Corrected or paraphrased text will appear here...
              </p>
            )}
          </div>
{/* Wrong Words */}

<div className="flex-grow mt-3 min-h-[120px] md:min-h-[150px] border-2 border-red-300 rounded-xl p-3 shadow bg-red-50 text-red-700 overflow-y-auto text-sm relative">

  {errors.length > 0 ? (
    <>
      {/* Wrong Words heading (fixed on top) */}
      <div className="relative mb-2">
        <h3 className="font-bold">❌ Wrong Words:</h3>

        {(() => {
          const totalWords = text.trim().split(/\s+/).length;
          const errorCount = errors.length;
          const percent = totalWords > 0 ? Math.round((errorCount / totalWords) * 100) : 0;

          return (
            <div className="absolute top-0 right-0 bg-white p-2 rounded-lg shadow-sm flex flex-col items-center">
              {/* Circular Progress (smaller size) */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-red-600 relative"
                style={{
                  background: `conic-gradient(#ef4444 ${percent * 3.6}deg, #fde8e8 ${percent * 3.6}deg)`
                }}
              >
                <div className="absolute w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[9px] font-semibold">{percent}%</span>
                </div>
              </div>
              <p className="mt-1 text-[9px] text-gray-600">
                {errorCount}/{totalWords}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Wrong words list */}
      <ul className="list-disc pl-5 space-y-1">
        {errors.map((errWord, idx) => (
          <li key={idx}>{errWord}</li>
        ))}
      </ul>
    </>
  ) : (
    <p className="text-gray-400 italic">
      ⚠️ Wrong words will appear here after Grammar Check...
    </p>
  )}
</div>



          {/* Clear Output button */}
          <button
            onClick={handleClearRight}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
          >
            Clear Output
          </button>
        </div>

        {/* Right Box */}
        <div className="flex flex-col h-full min-h-[300px]">
          <div className="flex-grow min-h-[200px] md:min-h-[250px] border-2 border-green-300 rounded-xl p-3 shadow bg-green-50 text-green-800 overflow-y-auto text-sm">
            {recommendations.length > 0 ? (
              <>
                <h3 className="font-bold mb-2">✅ Recommended Sentences:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-400 italic">
                💡 Recommendations will appear here after Grammar Check...
              </p>
            )}
          </div>

          {/* Grammar & Improve buttons */}
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={handleGrammarCheck}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
            >
              <FaReact />
              Grammar
            </button>
            <button
              onClick={() => handleParaphraseStyle("Standard")}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
            >
              <FaReact />
              Improve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
