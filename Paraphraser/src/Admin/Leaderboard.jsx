// src/Home/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useDarkMode } from "../Theme/DarkModeContext";
import { Medal } from "lucide-react";

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const db = getDatabase();
    const scoresRef = ref(db, "scores");

    // Listen for realtime updates
    onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Convert object into array
        const formatted = Object.entries(data)
          .map(([id, value]) => ({
            id,
            ...value,
          }))
          // only users with avatar
          .filter((user) => user.avatar);

        // Sort by totalScore (desc)
        formatted.sort((a, b) => b.totalScore - a.totalScore);

        setScores(formatted);
      } else {
        setScores([]);
      }
    });
  }, []);

  // Function to get medal colors
  const getMedalClass = (index) => {
    if (index === 0) return "bg-yellow-400 text-white"; // Gold
    if (index === 1) return "bg-gray-400 text-white"; // Silver
    if (index === 2) return "bg-amber-700 text-white"; // Bronze
    return "bg-sky-500 text-white"; // Others
  };

  return (
    <div className="p-6">
      <h1
        className={`text-2xl font-bold mb-6 text-center ${
          darkMode ? "text-sky-400" : "text-sky-600"
        }`}
      >
        🏆 Leaderboard
      </h1>

      {scores.length === 0 ? (
        <p className="opacity-70 text-center">No scores yet.</p>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {scores.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-2xl shadow-md transition hover:shadow-lg border ${
                darkMode
                  ? "bg-gray-800 text-gray-200 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              {/* Rank Number */}
              <span
                className={`text-xl font-bold w-6 text-center ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                {index + 1}
              </span>

              {/* Avatar */}
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-12 h-12 rounded-full border object-cover"
              />

              {/* Name + Email */}
              <div className="flex-1">
                {user.fullName && (
                  <p
                    className={`font-semibold ${
                      darkMode ? "text-gray-200" : "text-blue-600"
                    }`}
                  >
                    {user.fullName}
                  </p>
                )}
                {user.email && (
                  <p className="text-sm opacity-70">{user.email}</p>
                )}
              </div>

              {/* Score inside Medal Circle */}
              <div
                className={`flex items-center justify-center w-16 h-16 rounded-full ${getMedalClass(
                  index
                )} shadow-md`}
              >
                <div className="flex flex-col items-center">
                  <Medal size={18} className="mb-1" />
                  <span className="text-sm font-bold">{user.totalScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
