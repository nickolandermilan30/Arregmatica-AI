import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ correct import
import { BarChart2, FileText, Loader2, AlertTriangle } from "lucide-react";

const EssayChecker = () => {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ initialize Gemini
  const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are a grammar checker. Analyze the essay and return ONLY JSON (no extra text).
Format:
{
  "correct": number of grammatically correct sentences,
  "wrong": number of incorrect sentences,
  "feedback": "short overall feedback",
  "errors": ["list of sentences or words with grammar mistakes"]
}

Essay:
"${text}"
      `;

      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();

      // ✅ clean JSON
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const total = parsed.correct + parsed.wrong;
      const correctPercent =
        total > 0 ? Math.round((parsed.correct / total) * 100) : 0;
      const wrongPercent =
        total > 0 ? Math.round((parsed.wrong / total) * 100) : 0;
      const overall = correctPercent;

      setAnalysis({
        ...parsed,
        total,
        correctPercent,
        wrongPercent,
        overall,
      });
    } catch (err) {
      console.error("Parsing error:", err);
      setAnalysis({
        correct: 0,
        wrong: 0,
        total: 0,
        correctPercent: 0,
        wrongPercent: 0,
        overall: 0,
        feedback: "⚠️ Error: Could not analyze essay.",
        errors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Word Count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-3">
          <FileText size={32} className="text-white" />
          <h1 className="text-2xl md:text-3xl font-bold">Essay Checker</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input */}
          <div className="flex flex-col bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              ✍️ Paste your essay
            </h2>
            <textarea
              className="flex-grow min-h-[300px] border-2 border-indigo-300 rounded-xl p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 resize-none"
              placeholder="Paste your essay here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* 🔹 Word Counter Badge */}
            <div className="absolute bottom-20 right-10 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full shadow-md text-sm font-medium">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                "🔍 Check Essay"
              )}
            </button>
          </div>

          {/* Results */}
          <div className="flex flex-col bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[350px]">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Results
            </h2>

            {!analysis && !loading && (
              <p className="text-gray-400 italic flex-grow">
                📊 Your essay analysis will appear here...
              </p>
            )}

            {analysis && (
              <div className="flex flex-col gap-4 flex-grow">
                <p className="text-gray-700">
                  ✅ Correct Sentences:{" "}
                  <span className="font-bold">{analysis.correct}</span>
                </p>
                <p className="text-gray-700">
                  ❌ Wrong Sentences:{" "}
                  <span className="font-bold">{analysis.wrong}</span>
                </p>

                {/* Correct Progress */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Correct ({analysis.correctPercent}%)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.correctPercent}%` }}
                    />
                  </div>
                </div>

                {/* Wrong Progress */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Wrong ({analysis.wrongPercent}%)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.wrongPercent}%` }}
                    />
                  </div>
                </div>

                {/* Overall */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.overall}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    {analysis.overall}% Score
                  </p>
                </div>

                {/* Feedback */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mt-2">
                  <p className="text-gray-700 text-sm italic">
                    {analysis.feedback}
                  </p>
                </div>

                {/* ❌ Errors Box */}
                {analysis.errors && analysis.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                    <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Grammar Mistakes
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {analysis.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EssayChecker;
