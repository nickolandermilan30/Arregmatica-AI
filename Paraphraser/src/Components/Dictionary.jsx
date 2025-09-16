import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase";
import { BookOpen, Quote, CheckCircle, Languages } from "lucide-react"; 
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ Import dark mode context

const Dictionary = () => {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [wordCount, setWordCount] = useState(0);

  const { darkMode } = useDarkMode(); // ✅ Use dark mode

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  useEffect(() => {
    if (!word.trim()) setWordCount(0);
    else setWordCount(word.trim().split(/\s+/).length);
  }, [word]);

  const getNextIndex = async (folder) => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, folder));
    if (snapshot.exists()) return Object.keys(snapshot.val()).length + 1;
    return 1;
  };

  const saveToDatabase = async (folder, payload) => {
    try {
      const nextIndex = await getNextIndex(folder);
      const newRef = ref(database, `${folder}/${nextIndex}`);
      await set(newRef, payload);
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setDefinition("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Give me a short and clear dictionary meaning and one usage example of the word or sentence: "${word}".
Return in this exact format only:
Meaning: ...
Example: ...
Translate both into: ${language}`,
      });

      const result = response.text.trim();
      setDefinition(result);

      await saveToDatabase("dictionary", {
        word: word,
        definition: result,
        language: language,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      setDefinition("❌ Sorry, AI couldn't fetch the meaning.");
    } finally {
      setLoading(false);
    }
  };

  const highlightWord = () => {
    if (!word) return "Start typing a word...";
    return (
      <span>
        🔍 Searching for:{" "}
        <span className="font-bold text-blue-600 underline">{word}</span>
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-900"}`}>
      {/* HEADER */}
      <header className={`${darkMode ? "bg-gray-800" : "bg-blue-600"} text-white py-6 shadow-lg`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-3">
          <Languages size={32} className="text-white" />
          <h1 className="text-2xl md:text-3xl font-bold">Language Dictionary</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className={`w-full max-w-6xl rounded-2xl shadow-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          
          {/* Left Box */}
          <div className="relative flex flex-col h-full">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Dictionary Search</h2>

            <div className={`mb-3 italic ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{highlightWord()}</div>

            <label className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              🌐 Select Language:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`mb-4 p-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-blue-300 bg-white text-gray-900"}`}
            >
              <option>English</option>
              <option>Filipino</option>
              <option>Spanish</option>
              <option>Japanese</option>
              <option>Korean</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese</option>
            </select>

            <textarea
              className={`w-full flex-grow min-h-[250px] border-2 rounded-xl p-4 shadow focus:outline-none focus:ring-2 transition-all resize-none ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:ring-indigo-400" : "border-blue-200 bg-white text-black"}`}
              placeholder="✍️ Type a word or sentence here..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />

            <div className="absolute bottom-21 right-5 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full shadow-md text-sm font-medium">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`mt-4 font-semibold px-6 py-3 rounded-lg shadow transition-transform hover:scale-105 disabled:opacity-50 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {loading ? "Searching..." : "Search Dictionary"}
            </button>
          </div>

          {/* Right Box */}
          <div className="flex flex-col h-full">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Result</h2>

            <div className={`flex-grow min-h-[250px] border-2 rounded-xl p-6 shadow overflow-y-auto leading-relaxed text-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-green-50 border-green-300 text-green-900"}`}>
              {loading ? (
                <p className={`italic ${darkMode ? "text-gray-300" : "text-gray-500"}`}>⏳ Fetching definition…</p>
              ) : definition ? (
                <div className="space-y-6">
                  {definition.split("\n").map((line, idx) => {
                    if (line.toLowerCase().startsWith("meaning")) {
                      return (
                        <div
                          key={idx}
                          className={`flex items-start space-x-3 p-3 rounded-lg shadow-sm ${darkMode ? "bg-gray-600" : "bg-white"}`}
                        >
                          <BookOpen className={`mt-1 ${darkMode ? "text-green-400" : "text-green-600"}`} size={22} />
                          <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                            {line.replace("Meaning:", "Meaning:")}
                          </span>
                        </div>
                      );
                    } else if (line.toLowerCase().startsWith("example")) {
                      return (
                        <div
                          key={idx}
                          className={`flex items-start space-x-3 p-3 rounded-lg shadow-sm ${darkMode ? "bg-gray-600" : "bg-white"}`}
                        >
                          <Quote className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`} size={22} />
                          <span className={`italic ${darkMode ? "text-white" : "text-gray-700"}`}>
                            {line.replace("Example:", "Example:")}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircle className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`} size={18} />
                        <span className={`${darkMode ? "text-white" : ""}`}>{line}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`italic ${darkMode ? "text-gray-400" : "text-gray-400"}`}>
                  📖 The meaning and example will appear here after searching...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dictionary;
