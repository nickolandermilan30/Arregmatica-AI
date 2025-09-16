import React from "react";
import { useNavigate } from "react-router-dom";
import {
  SpellCheck,
  BookOpen,
  Type,
  PenTool,
  FileText,
  HelpCircle,
} from "lucide-react";
import BooksImage from "../assets/Books.png";
import { useDarkMode } from "../Theme/DarkModeContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  const services = [
    {
      title: "Text Enhancer",
      desc: "Polish and refine your sentences for better clarity and structure.",
      icon: <Type className="w-8 h-8 text-white" />,
      bg: "bg-indigo-500",
    },
    {
      title: "Arregmatica AI",
      desc: "Ask questions and get instant grammar and writing help powered by AI.",
      icon: <SpellCheck className="w-8 h-8 text-white" />,
      bg: "bg-green-500",
    },
    {
      title: "Dictionary",
      desc: "Look up word meanings, synonyms, and examples with ease.",
      icon: <BookOpen className="w-8 h-8 text-white" />,
      bg: "bg-yellow-500",
    },
    {
      title: "Humanize Word",
      desc: "Convert robotic or AI-generated text into natural human-like writing.",
      icon: <PenTool className="w-8 h-8 text-white" />,
      bg: "bg-pink-500",
    },
    {
      title: "Essay Checker",
      desc: "Check essays for grammar, structure, and overall readability.",
      icon: <FileText className="w-8 h-8 text-white" />,
      bg: "bg-red-500",
    },
    {
      title: "Quiz",
      desc: "Test your English knowledge with interactive quizzes and challenges.",
      icon: <HelpCircle className="w-8 h-8 text-white" />,
      bg: "bg-purple-500",
    },
  ];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} w-full`}>
      {/* HERO SECTION */}
      <section
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center text-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1529070538774-1843cb3265df')`,
        }}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 ${
            darkMode ? "bg-black/70" : "bg-black/50"
          }`}
        ></div>

        <div className="relative z-10 max-w-2xl px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Master English with <span className="text-sky-400">Clarity</span> & Confidence
          </h1>
          <p className="text-lg mb-6 text-gray-200">
            Improve your grammar, vocabulary, and writing skills with the help
            of AI-powered tools and personalized study insights.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-lg transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className={`py-20 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className={`text-3xl font-bold mb-12 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Website Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className={`shadow-md rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition ${darkMode ? "bg-gray-700" : "bg-white"}`}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${service.bg}`}
                >
                  {service.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {service.title}
                </h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm`}>
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        className="relative w-full h-[60vh] bg-cover bg-center flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${BooksImage})`,
        }}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 ${
            darkMode ? "bg-black/70" : "bg-black/50"
          }`}
        ></div>

        <div className="relative z-10 max-w-3xl px-6 text-center">
          <h2 className={`text-3xl md:text-5xl font-bold mb-6 text-white`}>
            About Our Platform
          </h2>
          <p className={`text-lg mb-6 text-gray-200`}>
            We are dedicated to helping students and professionals improve their
            English skills through powerful AI-driven tools and innovative study
            methods.
          </p>
          <button
            onClick={() => navigate("/about")}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-lg transition"
          >
            About
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-6 text-center ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-900 text-white"}`}>
        <p className="text-sm">
          © {new Date().getFullYear()} Created by{" "}
          <span className="font-semibold">Arregmatica Team</span>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
