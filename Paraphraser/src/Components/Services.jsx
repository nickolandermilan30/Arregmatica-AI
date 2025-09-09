import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; 
import { GoogleGenAI } from "@google/genai";
import { BookOpen, CheckCircle, Quote, Info } from "lucide-react"; // ✅ icons
import AIImage from "../assets/AI.jpg";
import UserImage from "../assets/userdp.png";

const Services = () => {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponses((prev) => [
      ...prev,
      { role: "user", content: query },
    ]);
    setQuery("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
      });

      setResponses((prev) => [
        ...prev,
        { role: "ai", content: response.text },
      ]);
    } catch (error) {
      console.error(error);
      setResponses((prev) => [
        ...prev,
        { role: "ai", content: "❌ Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format AI Response with icons + bullets
  const renderFormattedResponse = (text) => {
    return text.split("\n").map((line, idx) => {
      if (line.toLowerCase().includes("meaning") || line.toLowerCase().includes("definition")) {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <BookOpen className="text-blue-600 mt-1" size={18} />
            <span className="font-semibold">{line}</span>
          </div>
        );
      } else if (line.toLowerCase().includes("example")) {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <Quote className="text-green-600 mt-1" size={18} />
            <span className="italic">{line}</span>
          </div>
        );
      } else if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <CheckCircle className="text-sky-500 mt-1" size={18} />
            <span>{line.replace(/^[-•]\s*/, "")}</span>
          </div>
        );
      } else if (line.trim() !== "") {
        return (
          <div key={idx} className="flex items-start space-x-2 mb-1">
            <Info className="text-gray-500 mt-1" size={18} />
            <span>{line}</span>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8 md:px-10 md:py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-sky-600 mb-8 text-center drop-shadow-lg">
        Ask Arregmatica AI
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Box: Chat / History */}
        <div className="col-span-2 flex flex-col h-[650px] md:h-[550px]">
          <div className="flex-1 border-2 border-gray-300 rounded-2xl bg-white p-6 shadow-lg overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Chat Arregmatica AI</h2>
            <div className="space-y-4">
              {responses.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI avatar */}
                  {msg.role === "ai" && (
                    <img
                      src={AIImage}
                      alt="AI"
                      className="w-10 h-10 rounded-full mr-2 object-cover"
                    />
                  )}

                  {/* Chat bubble */}
                  <div
                    className={`max-w-full md:max-w-xs p-4 rounded-xl shadow-md ${
                      msg.role === "user"
                        ? "bg-blue-100 text-right"
                        : "bg-gray-100 text-left"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.role === "ai"
                      ? renderFormattedResponse(msg.content) // ✅ AI bubble with icons
                      : msg.content}
                  </div>

                  {/* User avatar */}
                  {msg.role === "user" && (
                    <img
                      src={UserImage}
                      alt="User"
                      className="w-10 h-10 rounded-full ml-2 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Input / Search */}
          <div className="flex gap-4 mt-4">
            <input
              type="text"
              placeholder="Ask about our Arregmatica AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-2 border-gray-300 rounded-2xl p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              <FaSearch /> Search
            </button>
          </div>
        </div>

        {/* Right Box: AI Response / Result */}
        <div className="hidden md:flex flex-col h-[550px]">
          <div className="flex-1 border-2 border-gray-300 rounded-2xl bg-white p-6 shadow-lg overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">AI Response</h2>
            {loading ? (
              <p className="text-gray-500 italic">⏳ AI is thinking…</p>
            ) : responses.filter((r) => r.role === "ai").length > 0 ? (
              responses
                .filter((r) => r.role === "ai")
                .map((msg, index) => (
                  <div key={index} className="mb-4">
                    {renderFormattedResponse(msg.content)}
                  </div>
                ))
            ) : (
              <p className="text-gray-400 italic">
                ✨ AI-generated responses will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
