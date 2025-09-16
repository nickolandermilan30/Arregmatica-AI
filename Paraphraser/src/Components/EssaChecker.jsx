import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { BarChart2, FileText, Loader2, AlertTriangle } from "lucide-react";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase"; 
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ Import dark mode

const EssayChecker = () => {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const { darkMode } = useDarkMode(); // ✅ Use dark mode

  const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const getNextIndex = async () => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "essays"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).length + 1;
    }
    return 1;
  };

  const saveToDatabase = async (inputText, resultData) => {
    try {
      const nextIndex = await getNextIndex();
      const newRef = ref(database, `essays/${nextIndex}`);
      await set(newRef, {
        input: inputText,
        analysis: resultData,
        timestamp: new Date().toISOString(),
      });
      console.log("✅ Essay saved to Firebase");
    } catch (err) {
      console.error("❌ Error saving essay:", err);
    }
  };

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

      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const total = parsed.correct + parsed.wrong;
      const correctPercent =
        total > 0 ? Math.round((parsed.correct / total) * 100) : 0;
      const wrongPercent =
        total > 0 ? Math.round((parsed.wrong / total) * 100) : 0;
      const overall = correctPercent;

      const finalAnalysis = {
        ...parsed,
        total,
        correctPercent,
        wrongPercent,
        overall,
      };

      setAnalysis(finalAnalysis);
      await saveToDatabase(text, finalAnalysis);
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

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-gray-900"} min-h-screen flex flex-col`}>
      {/* HEADER */}
      <header className={`${darkMode ? "bg-gray-800 text-white" : "bg-blue-600 text-white"} py-6 shadow-lg`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-3">
          <FileText size={32} className="text-white" />
          <h1 className="text-2xl md:text-3xl font-bold">Essay Checker</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input */}
          <div className={`flex flex-col rounded-2xl shadow-lg p-6 border relative ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
              ✍️ Paste your essay
            </h2>
            <textarea
              className={`flex-grow min-h-[300px] border-2 rounded-xl p-4 shadow-sm focus:outline-none focus:ring-2 resize-none transition-all ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "border-indigo-300 bg-white text-gray-800 focus:ring-indigo-400"}`}
              placeholder="Paste your essay here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="absolute bottom-28 right-10 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full shadow-md text-sm font-medium">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            <button
              onClick={handleCheck}
              disabled={loading}
              className={`mt-4 font-semibold px-6 py-3 rounded-xl shadow transition disabled:opacity-50 flex items-center justify-center gap-2 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
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
          <div className={`flex flex-col rounded-2xl shadow-lg p-6 border min-h-[350px] ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <h2 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>
              <BarChart2 className="w-5 h-5" /> Results
            </h2>

            {!analysis && !loading && (
              <p className={`italic flex-grow ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
                📊 Your essay analysis will appear here...
              </p>
            )}

            {analysis && (
              <div className="flex flex-col gap-4 flex-grow">
                <p className={`${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  ✅ Correct Sentences: <span className="font-bold">{analysis.correct}</span>
                </p>
                <p className={`${darkMode ? "text-gray-100" : "text-gray-700"}`}>
                  ❌ Wrong Sentences: <span className="font-bold">{analysis.wrong}</span>
                </p>

                {/* Correct Progress */}
                <div>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm mb-1`}>
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
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm mb-1`}>
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
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm mb-1`}>Overall Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.overall}%` }}
                    />
                  </div>
                  <p className={`${darkMode ? "text-gray-100" : "text-gray-700"} text-sm mt-1 font-medium`}>
                    {analysis.overall}% Score
                  </p>
                </div>

                {/* Feedback */}
                <div className={`rounded-xl p-3 mt-2 border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-indigo-50 border-indigo-200"}`}>
                  <p className={`${darkMode ? "text-gray-100 italic" : "text-gray-700 italic text-sm"}`}>
                    {analysis.feedback}
                  </p>
                </div>

                {/* Errors */}
                {analysis.errors && analysis.errors.length > 0 && (
                  <div className={`rounded-xl p-3 mt-2 border ${darkMode ? "bg-red-700 border-red-600" : "bg-red-50 border-red-200"}`}>
                    <h3 className={`text-sm font-semibold flex items-center gap-1 mb-2 ${darkMode ? "text-red-300" : "text-red-700"}`}>
                      <AlertTriangle className="w-4 h-4" /> Grammar Mistakes
                    </h3>
                    <ul className={`list-disc list-inside text-sm space-y-1 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
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
