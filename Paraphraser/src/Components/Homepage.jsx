import React, { useState } from "react";
import { Wand2, Copy, Loader2, Trash2, ClipboardPaste, RefreshCcw, CheckCircle2, Sparkles } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase";
import toast, { Toaster } from "react-hot-toast";
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ import dark mode context

const Homepage = () => {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("Standard");
  const [showStyleButton, setShowStyleButton] = useState(false);
  const [errors, setErrors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const { darkMode } = useDarkMode(); // ✅ use global dark mode

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  // ✅ Helper para makuha next index
  const getNextIndex = async (folder) => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, folder));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).length + 1;
    }
    return 1;
  };

  // ✅ Save result sa database
  const saveToDatabase = async (folder, payload) => {
    try {
      const nextIndex = await getNextIndex(folder);
      const newRef = ref(database, `${folder}/${nextIndex}`);
      await set(newRef, payload);
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  const handleGrammarCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Correct the grammar of this sentence and return ONLY the corrected sentence:\n"${text}"`,
      });
      const corrected = response.text.trim();
      setOutput(corrected);
      setShowStyleButton(false);

      const errorResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `From this sentence: "${text}", list ONLY the incorrect words or phrases that need grammar correction.\nReturn them as a simple bullet list (one word/phrase per line) without explanation.`,
      });

      const wrongWords = errorResponse.text
        .split("\n")
        .map((w) => w.replace(/^[-*]\s*/, "").trim())
        .filter((w) => w.length > 0);

      setErrors(wrongWords);

      const recResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide 3 recommended alternative full sentences for this input, each grammatically correct and slightly different in phrasing:\n"${text}"\nReturn only one sentence per line without numbering or explanation.`,
      });

      const recList = recResponse.text
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      setRecommendations(recList);

      const totalWords = text.trim().split(/\s+/).length;
      const errorCount = wrongWords.length;
      const percent = totalWords > 0 ? Math.round((errorCount / totalWords) * 100) : 0;

      await saveToDatabase("grammar", {
        input: text,
        result: corrected,
        percent: percent,
      });
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
        contents: `Rewrite this sentence in a ${selectedStyle} style. \nReturn ONLY one improved version of the sentence without explanation:\n"${text}"`,
      });
      const improved = response.text.trim();
      setOutput(improved);

      await saveToDatabase("improve", {
        input: text,
        result: improved,
        style: selectedStyle,
      });
    } catch (err) {
      console.error(err);
      setOutput("Sorry, AI couldn't process your request.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = () => navigator.clipboard.readText().then((clipText) => setText(clipText));
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
      toast.success("✅ Result copied to clipboard!");
    }
  };

  const styles = ["Standard", "Fluent", "Humanize", "Formal", "Academic", "Simple", "Creative"];

  return (
    <div className={`min-h-screen flex items-start justify-center px-4 py-8 md:px-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-sky-50 to-indigo-100 text-gray-900"}`}>
      <div className="w-full max-w-7xl mt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-10 text-indigo-700 tracking-wide  drop-shadow-lg flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-indigo-500" />
          Text Enhancer
        </h1>
        <Toaster position="top-right" reverseOrder={false} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Box */}
          <div className={`flex flex-col h-full min-h-[300px] rounded-2xl shadow-xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-sky-100"}`}>
            <textarea
              className={`w-full flex-grow min-h-[250px] md:min-h-[300px] border rounded-xl p-4 shadow-inner focus:outline-none focus:ring-2 transition-all resize-none ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "bg-sky-50 border-sky-200 text-black focus:ring-indigo-400"}`}
              placeholder="✍️ Type your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handlePaste}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
              >
                <ClipboardPaste className="w-4 h-4" /> Paste
              </button>
              <button
                onClick={handleClearLeft}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>

          {/* Middle Box */}
          <div className={`flex flex-col h-full min-h-[300px] rounded-2xl shadow-xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            {showStyleButton && (
              <div className="flex flex-wrap gap-2 mb-3 justify-start">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleParaphraseStyle(s)}
                    className={`px-3 py-1 rounded-lg border text-sm transition-all shadow-sm ${style === s ? "bg-indigo-500 text-white" : darkMode ? "bg-gray-700 text-gray-100 hover:bg-indigo-600" : "bg-gray-50 text-gray-700 hover:bg-indigo-100"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className={`relative flex-grow min-h-[150px] md:min-h-[200px] border rounded-xl p-4 shadow-inner overflow-y-auto text-base leading-relaxed ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-black"}`}>
              {output && (
                <button
                  onClick={handleCopyOutput}
                  className="absolute top-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow transition-transform hover:scale-110"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}

              {loading ? (
                <p className={`flex items-center gap-2 italic ${darkMode ? "text-gray-300" : "text-gray-500"}`}><Loader2 className="w-4 h-4 animate-spin" /> Loading…</p>
              ) : output ? (
                <>
                  <h3 className="font-bold mb-2 text-indigo-400">{style} Style:</h3>
                  <p>{output}</p>
                </>
              ) : (
                <p className={`italic ${darkMode ? "text-gray-400" : "text-gray-400"}`}>✨ Corrected or paraphrased text will appear here...</p>
              )}
            </div>

            <div className={`flex-grow mt-3 min-h-[120px] md:min-h-[150px] border rounded-xl p-3 shadow-inner overflow-y-auto text-sm relative ${darkMode ? "bg-red-900 border-red-700 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}>
              {errors.length > 0 ? (
                <>
                  <div className="relative mb-2">
                    <h3 className="font-bold">❌ Wrong Words:</h3>
                    {(() => {
                      const totalWords = text.trim().split(/\s+/).length;
                      const errorCount = errors.length;
                      const percent = totalWords > 0 ? Math.round((errorCount / totalWords) * 100) : 0;

                      return (
                        <div className="absolute top-0 right-0 bg-white p-2 rounded-lg shadow-sm flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-red-600 relative"
                            style={{
                              background: `conic-gradient(#ef4444 ${percent * 3.6}deg, #fde8e8 ${percent * 3.6}deg)`,
                            }}
                          >
                            <div className="absolute w-7 h-7 rounded-full bg-white flex items-center justify-center">
                              <span className="text-[9px] font-semibold">{percent}%</span>
                            </div>
                          </div>
                          <p className="mt-1 text-[9px] text-gray-600">{errorCount}/{totalWords}</p>
                        </div>
                      );
                    })()}
                  </div>

                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((errWord, idx) => (
                      <li key={idx}>{errWord}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="italic">⚠️ Wrong words will appear here after Grammar Check...</p>
              )}
            </div>

            <button
              onClick={handleClearRight}
              className="mt-3 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform hover:scale-105"
            >
              <RefreshCcw className="w-4 h-4" /> Clear Output
            </button>
          </div>

          {/* Right Box */}
          <div className={`flex flex-col h-full min-h-[300px] rounded-2xl shadow-xl p-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-green-100"}`}>
            <div className={`flex-grow min-h-[200px] md:min-h-[250px] border rounded-xl p-3 shadow-inner overflow-y-auto text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-green-50 border-green-200 text-green-800"}`}>
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
                <p className={`italic ${darkMode ? "text-gray-400" : "text-gray-400"}`}>💡 Recommendations will appear here after Grammar Check...</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handleGrammarCheck}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Grammar
              </button>
              <button
                onClick={() => handleParaphraseStyle("Standard")}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg shadow flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" /> Improve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
