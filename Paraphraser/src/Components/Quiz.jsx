import React, { useState, useEffect } from "react";
import { CheckCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // ✅ Import your firebase auth

const Quiz = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg flex flex-col lg:flex-row max-w-6xl w-full overflow-hidden">
        {/* Quiz Info Box */}
        <div className="w-full lg:w-1/2 p-8 order-1 lg:order-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Ready for the Quiz?
          </h1>
          <p className="text-gray-600 mb-4">
            🕒 <span className="font-semibold">Timer:</span> Each question has a
            time limit (displayed during the quiz).
          </p>
          <p className="text-gray-700 mb-6">
            This quiz is designed to test your knowledge across four different
            classes. Each class contains four multiple-choice questions.
            The goal is to challenge your understanding and reinforce key
            concepts you've learned so far. Make sure to read each question
            carefully before answering. Remember, this quiz is timed, so manage
            your time wisely. Good luck!
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center text-gray-700">
              <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
              Multiple-choice questions
            </li>
            <li className="flex items-center text-gray-700">
              <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
              Four questions per class
            </li>
            <li className="flex items-center text-gray-700">
              <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
              Timer indicated (for awareness only)
            </li>
            <li className="flex items-center text-gray-700">
              <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
              Test your understanding and skills
            </li>
          </ul>
        </div>

        {/* User Info Form */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-8 order-2 lg:order-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Information
          </h2>
          <form className="space-y-4" onSubmit={handleStartQuiz}>
            {/* Full Name - Locked */}
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 pr-10 bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <Lock className="absolute right-3 top-2.5 text-gray-500 w-5 h-5" />
              </div>
            </div>

            {/* Email - Locked */}
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-2 pr-10 bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <Lock className="absolute right-3 top-2.5 text-gray-500 w-5 h-5" />
              </div>
            </div>

            {/* Occupation - Editable */}
            <div>
              <label className="block text-gray-700 mb-1">
                Occupation / Student
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                <option value="">Select your status</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2 w-4 h-4 text-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement" className="text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>

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
