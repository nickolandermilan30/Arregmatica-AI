// src/pages/Score.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, set } from "firebase/database";
import { useDarkMode } from "../Theme/DarkModeContext";

const Score = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  const score1 = location.state?.score1 || 0;
  const score2 = location.state?.score2 || 0;
  const score3 = location.state?.score3 || 0;
  const total = score1 + score2 + score3;

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    avatar: "",
  });

  // ✅ Get logged-in user info (with avatar)
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        fullName: user.displayName || "Anonymous",
        email: user.email || "No Email",
        avatar: user.photoURL || "", // <-- avatar
      });
    }
  }, []);

  // ✅ Save or Update score (with avatar)
  const handleSaveAndBack = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No user logged in!");
        return;
      }

      const userScoreRef = ref(database, "scores/" + user.uid);

      await set(userScoreRef, {
        fullName: userData.fullName,
        email: userData.email,
        avatar: userData.avatar, // <-- save avatar
        multipleChoice: score1,
        puzzleWords: score2,
        jumbledWords: score3,
        totalScore: total,
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Score + avatar saved/updated successfully!");
      navigate("/landingpage");
    } catch (error) {
      console.error("❌ Error saving score:", error);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col justify-center items-center transition-colors duration-300 p-6 ${
        darkMode ? "bg-gray-900" : "bg-sky-50"
      }`}
    >
      <h1
        className={`text-4xl font-extrabold mb-8 ${
          darkMode ? "text-white" : "text-sky-700"
        }`}
      >
        🏆 Your Results
      </h1>

      {/* User Info with Avatar */}
      <div
        className={`flex items-center gap-6 border rounded-2xl shadow-md p-6 mb-8 w-full max-w-2xl transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-sky-200 text-gray-800"
        }`}
      >
        {userData.avatar ? (
          <img
            src={userData.avatar}
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-sky-400"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
            👤
          </div>
        )}
        <div>
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-sky-700"
            }`}
          >
            {userData.fullName}
          </p>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {userData.email}
          </p>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[
          { label: "Multiple choice", value: score1, color: "green" },
          { label: "Puzzle Words", value: score2, color: "green" },
          { label: "Jumbled words", value: score3, color: "green" },
          { label: "Total Score", value: total, color: "sky" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`w-40 h-40 flex flex-col items-center justify-center border-2 rounded-2xl shadow-md transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-sky-300 text-gray-800"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-sky-600"
              }`}
            >
              {item.label}
            </h2>
            <p
              className={`text-3xl font-bold ${
                item.color === "green"
                  ? "text-green-600"
                  : darkMode
                  ? "text-sky-400"
                  : "text-sky-700"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSaveAndBack}
        className={`px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-colors ${
          darkMode
            ? "bg-sky-600 hover:bg-sky-500 text-white"
            : "bg-sky-500 hover:bg-sky-600 text-white"
        }`}
      >
        Save & Back to Home
      </button>
    </div>
  );
};

export default Score;
