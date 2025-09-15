// src/pages/Score.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, set, push } from "firebase/database";

const Score = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const score1 = location.state?.score1 || 0;
  const score2 = location.state?.score2 || 0;
  const score3 = location.state?.score3 || 0;
  const total = score1 + score2 + score3;

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });

  // ✅ Get current user from Firebase Auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        fullName: user.displayName || "Anonymous",
        email: user.email || "No Email",
      });
    }
  }, []);

  // ✅ Save score to Realtime Database
  const handleSaveAndBack = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No user logged in!");
        return;
      }

      const scoresRef = ref(database, "scores/" + user.uid);
      const newScoreRef = push(scoresRef); // auto-generate unique ID

      await set(newScoreRef, {
        fullName: userData.fullName,
        email: userData.email,
        multipleChoice: score1,
        puzzleWords: score2,
        jumbledWords: score3,
        totalScore: total,
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Score saved successfully!");
      navigate("/landingpage"); // redirect to home
    } catch (error) {
      console.error("❌ Error saving score:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-sky-50 text-center p-6">
      <h1 className="text-4xl font-extrabold text-sky-700 mb-8">🏆 Your Results</h1>

      {/* User Info */}
      <div className="bg-white border border-sky-200 rounded-2xl shadow-md p-6 mb-8 w-full max-w-2xl">
        <p className="text-lg font-semibold text-sky-700">
          👤 {userData.fullName}
        </p>
        <p className="text-gray-600">{userData.email}</p>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="w-40 h-40 flex flex-col items-center justify-center bg-white border-2 border-sky-300 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-sky-600">Multiple choice</h2>
          <p className="text-3xl font-bold text-green-600">{score1}</p>
        </div>
        <div className="w-40 h-40 flex flex-col items-center justify-center bg-white border-2 border-sky-300 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-sky-600">Puzzle Words</h2>
          <p className="text-3xl font-bold text-green-600">{score2}</p>
        </div>
        <div className="w-40 h-40 flex flex-col items-center justify-center bg-white border-2 border-sky-300 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-sky-600">Jumbled words</h2>
          <p className="text-3xl font-bold text-green-600">{score3}</p>
        </div>
        <div className="w-40 h-40 flex flex-col items-center justify-center bg-white border-2 border-sky-300 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-sky-600">Total Score</h2>
          <p className="text-3xl font-bold text-sky-700">{total}</p>
        </div>
      </div>

      {/* Save + Back Button */}
      <button
        onClick={handleSaveAndBack}
        className="px-8 py-4 bg-sky-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-sky-600 transition"
      >
        Save & Back to Home
      </button>
    </div>
  );
};

export default Score;
