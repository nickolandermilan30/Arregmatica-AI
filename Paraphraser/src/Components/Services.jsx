// src/pages/Services.js
import React, { useState, useEffect } from "react";
import { FaSearch, FaCopy } from "react-icons/fa"; 
import { GoogleGenAI } from "@google/genai";
import { BookOpen, CheckCircle, Quote, Info } from "lucide-react";
import AIImage from "../assets/AI.jpg";
import toast, { Toaster } from "react-hot-toast";
import { useDarkMode } from "../Theme/DarkModeContext"; 
import { auth } from "../firebase";

const Services = () => {
  const { darkMode } = useDarkMode();
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiIndex, setAiIndex] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ Get logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("✅ Copied to clipboard!");
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    setResponses((prev) => [...prev, { role: "user", content: query }]);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
      });

      setResponses((prev) => [
        ...prev,
        { role: "ai", content: response.text },
      ]);
      setAiIndex(responses.filter((r) => r.role === "ai").length);
    } catch (error) {
      console.error(error);
      setResponses((prev) => [
        ...prev,
        { role: "ai", content: "❌ Sorry, I couldn't process your request." },
      ]);
    } finally {
      setQuery("");
      setLoading(false);
    }
  };

  const renderFormattedResponse = (text) =>
    text.split("\n").map((line, idx) => {
      if (!line.trim()) return null;
      if (line.toLowerCase().includes("meaning") || line.toLowerCase().includes("definition"))
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <BookOpen className="text-blue-600 mt-1" size={18} />
            <span className="font-semibold">{line}</span>
          </div>
        );
      if (line.toLowerCase().includes("example"))
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <Quote className="text-green-600 mt-1" size={18} />
            <span className="italic">{line}</span>
          </div>
        );
      if (line.startsWith("•") || line.startsWith("-"))
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <CheckCircle className="text-sky-500 mt-1" size={18} />
            <span>{line.replace(/^[-•]\s*/, "")}</span>
          </div>
        );
      return (
        <div key={idx} className="flex items-start space-x-2 mb-1">
          <Info className="text-gray-500 mt-1" size={18} />
          <span>{line}</span>
        </div>
      );
    });

  const navigateAI = (direction) => {
    const aiResponses = responses.filter((r) => r.role === "ai");
    if (!aiResponses.length) return;
    let newIndex = aiIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= aiResponses.length) newIndex = aiResponses.length - 1;
    setAiIndex(newIndex);
  };

  const currentAIResponse = () => {
    const aiResponses = responses.filter((r) => r.role === "ai");
    if (!aiResponses.length || aiIndex === null) return null;
    return aiResponses[aiIndex].content;
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-sky-50 via-white to-sky-200"} min-h-screen w-full flex flex-col items-center px-4 py-8 md:px-10 md:py-12`}>
      <Toaster position="top-right" />

      <h1 className="text-4xl md:text-5xl font-extrabold text-sky-900 dark:text-sky-900 mb-6 text-center tracking-tight">
        Ask <span className={`${darkMode ? "text-sky-400" : "text-sky-500"}`}>Arregmatica AI</span>
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Box */}
        <div className={`col-span-2 flex flex-col h-[650px] lg:h-[600px] backdrop-blur-md ${darkMode ? "bg-gray-800/70 border-gray-700" : "bg-white/90 border-gray-200"} border rounded-2xl shadow-xl overflow-hidden`}>
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {responses.map((msg, index) => (
              <div key={index} className="flex flex-col">
                {/* ✅ Username sa taas ng message */}
                {msg.role === "user" && user && (
  <span
    className={`text-xs mb-1 ${msg.role === "user" ? "text-right mr-15" : "text-left ml-2"} ${
      darkMode ? "text-gray-400" : "text-gray-500"
    }`}
  >
    {user.displayName || "Anonymous"}
  </span>
)}

                <div
                  className={`flex items-end ${msg.role === "user" ? "justify-end" : "justify-start"} space-x-2`}
                >
                  {/* AI avatar left */}
                  {msg.role === "ai" && (
                    <img
                      src={AIImage}
                      alt="AI"
                      className="w-10 h-10 rounded-full shadow-md"
                    />
                  )}

                  {/* Chat bubble */}
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm text-sm`}
                    style={{
                      whiteSpace: "pre-line",
                      backgroundColor: msg.role === "user"
                        ? "#0ea5e9"
                        : darkMode ? "#1f2937" : "#f3f4f6",
                      color: msg.role === "user" ? "#fff" : darkMode ? "#f3f4f6" : "#1f2937",
                      borderRadius: msg.role === "user"
                        ? "1rem 1rem 0.25rem 1rem"
                        : "1rem 1rem 1rem 0.25rem",
                    }}
                  >
                    {msg.role === "ai" ? renderFormattedResponse(msg.content) : msg.content}
                  </div>

                  {/* Copy button for AI */}
                  {msg.role === "ai" && (
                    <button
                      onClick={() => handleCopy(msg.content)}
                      className="bg-white/90 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sky-600 hover:text-sky-800 rounded-full p-2 shadow-md"
                    >
                      <FaCopy size={14} />
                    </button>
                  )}

                  {/* User avatar right */}
                  {msg.role === "user" && user && (
                    <img
                      src={user.photoURL || "https://via.placeholder.com/40"}
                      alt="User"
                      className="w-10 h-10 rounded-full shadow-md object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input box */}
          <div className={`p-4 border-t ${darkMode ? "bg-gray-800/70 border-gray-700" : "bg-white/80 border-gray-200"}`}>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Type a message..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className={`w-full border rounded-2xl p-3 pr-14 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-300 bg-white text-gray-900"}`}
              />

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="absolute right-3 bottom-4 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-md disabled:opacity-50"
              >
                <FaSearch size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className={`flex flex-col h-[600px] p-6 rounded-2xl shadow-xl overflow-hidden ${darkMode ? "bg-gray-800/70 border border-gray-700" : "bg-white/90 border border-gray-200"} backdrop-blur-md`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-gray-100" : "text-gray-700"}`}>📖 AI Insights</h2>

          <div className="flex-1 overflow-y-auto mb-4">
            {loading ? (
              <p className="text-gray-400 italic animate-pulse">⏳ AI is thinking…</p>
            ) : currentAIResponse() ? (
              <div className="space-y-2">{renderFormattedResponse(currentAIResponse())}</div>
            ) : (
              <p className="text-gray-400 italic">✨ AI-generated responses will appear here...</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => navigateAI(-1)}
              className={`px-4 py-2 rounded-xl shadow-sm ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Prev
            </button>
            <button
              onClick={() => navigateAI(1)}
              className={`px-4 py-2 rounded-xl shadow-sm ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
