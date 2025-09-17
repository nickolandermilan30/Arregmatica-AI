import React, { useState, useEffect } from "react";
import { CheckCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // ✅ Import your firebase auth
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ dark mode context

const Quiz = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode(); // ✅ get dark mode state
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    occupation: "",
  });

  // ✅ Auto-fill from Firebase Auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the terms before starting the quiz.");
      return;
    }
    // Navigate to Multiple_choice and pass form data
    navigate("/multiple-choice", { state: { formData } });
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 p-6 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div
        className={`rounded-xl shadow-lg flex flex-col lg:flex-row max-w-6xl w-full overflow-hidden transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Quiz Info Box */}
        <div className="w-full lg:w-1/2 p-8 order-1 lg:order-1">
          <h1
            className={`text-3xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Ready for the Quiz?
          </h1>
          <p
            className={`mb-4 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            🕒 <span className="font-semibold">Timer:</span> Each question has a
            time limit (displayed during the quiz).
          </p>
          <p
            className={`mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            This quiz is designed to test your knowledge across four different
            classes. Each class contains four multiple-choice questions.
            The goal is to challenge your understanding and reinforce key
            concepts you've learned so far. Make sure to read each question
            carefully before answering. Remember, this quiz is timed, so manage
            your time wisely. Good luck!
          </p>
          <ul className="space-y-2 mb-6">
            {[
              "Multiple-choice questions",
              "Four questions per class",
              "Timer indicated (for awareness only)",
              "Test your understanding and skills",
            ].map((item, idx) => (
              <li
                key={idx}
                className={`flex items-center ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* User Info Form */}
        <div
          className={`w-full lg:w-1/2 p-8 order-2 lg:order-2 transition-colors duration-300 ${
            darkMode ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Your Information
          </h2>
          <form className="space-y-4" onSubmit={handleStartQuiz}>
            {/* Full Name - Locked */}
            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  readOnly
                  className={`w-full border rounded-lg p-2 pr-10 cursor-not-allowed transition-colors duration-300 ${
                    darkMode
                      ? "border-gray-600 bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-gray-100 text-gray-700"
                  }`}
                />
                <Lock
                  className={`absolute right-3 top-2.5 w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Email - Locked */}
            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className={`w-full border rounded-lg p-2 pr-10 cursor-not-allowed transition-colors duration-300 ${
                    darkMode
                      ? "border-gray-600 bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-gray-100 text-gray-700"
                  }`}
                />
                <Lock
                  className={`absolute right-3 top-2.5 w-5 h-5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Occupation - Editable */}
            <div>
              <label
                className={`block mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Occupation / Student
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300 ${
                  darkMode
                    ? "border-gray-600 bg-gray-600 text-gray-200"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
                required
              >
                <option value="">Select your status</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={`mr-2 w-4 h-4 rounded transition-colors duration-300 ${
                  darkMode
                    ? "text-sky-500 border-gray-600"
                    : "text-sky-500 border-gray-300"
                }`}
              />
              <label
                htmlFor="agreement"
                className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                I agree to the terms and conditions
              </label>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg shadow-md transition-colors mt-4"
            >
              Start Quiz
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
