import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase";
import { BookOpen, Quote, CheckCircle } from "lucide-react"; // ✅ icons

const Dictionary = () => {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  // ✅ Kunin next index sa DB
  const getNextIndex = async (folder) => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, folder));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).length + 1;
    }
    return 1;
  };

  // ✅ Save sa DB
  const saveToDatabase = async (folder, payload) => {
    try {
      const nextIndex = await getNextIndex(folder);
      const newRef = ref(database, `${folder}/${nextIndex}`);
      await set(newRef, payload);
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  // ✅ Handle Search
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

      // Save sa DB
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

  // ✅ Highlight preview (bold the word)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-6 py-10">
      <div className="w-full h-[85vh] bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Box */}
        <div className="flex flex-col h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Dictionary Search
          </h2>

          {/* Preview */}
          <div className="mb-3 text-gray-700 italic">{highlightWord()}</div>

          {/* Dropdown Language */}
          <label className="text-sm font-semibold text-gray-600 mb-2">
            🌐 Select Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mb-4 p-3 border-2 border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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
            className="w-full flex-grow min-h-[250px] border-2 border-blue-200 rounded-xl p-4 shadow bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 transition-all resize-none"
            placeholder="✍️ Type a word or sentence here..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Dictionary"}
          </button>
        </div>

        {/* Right Box */}
        <div className="flex flex-col h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Result</h2>

          <div className="flex-grow min-h-[250px] border-2 border-green-300 rounded-xl p-6 shadow bg-green-50 text-green-900 overflow-y-auto leading-relaxed text-lg">
            {loading ? (
              <p className="text-gray-500 italic">⏳ Fetching definition…</p>
            ) : definition ? (
              <div className="space-y-6">
                {definition.split("\n").map((line, idx) => {
                  if (line.toLowerCase().startsWith("meaning")) {
                    return (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm"
                      >
                        <BookOpen className="text-green-600 mt-1" size={22} />
                        <span className="font-semibold text-gray-800">
                          {line.replace("Meaning:", "Meaning:")}
                        </span>
                      </div>
                    );
                  } else if (line.toLowerCase().startsWith("example")) {
                    return (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm"
                      >
                        <Quote className="text-blue-600 mt-1" size={22} />
                        <span className="italic text-gray-700">
                          {line.replace("Example:", "Example:")}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="text-gray-500 mt-1" size={18} />
                      <span>{line}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 italic">
                📖 The meaning and example will appear here after searching...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
