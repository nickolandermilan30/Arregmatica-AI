// src/pages/Score.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, set, push } from "firebase/database";
import { useDarkMode } from "../Theme/DarkModeContext";
import { FaShareAlt } from "react-icons/fa";

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
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fixed post content layout
  const fixedPostContent = `
🎉 I got amazing results in the quiz! 

- Multiple Choice: ${score1}
- Puzzle Words: ${score2}
- Jumbled Words: ${score3}
- Total Score: ${total}

💡 Challenge yourself now in Quiz!
`;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        fullName: user.displayName || "Nicko Milan",
        email: user.email || "No Email",
        avatar: user.photoURL || "",
      });
    }
  }, [score1, score2, score3, total]);

  const handleSaveAndBack = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("No user logged in!");

      const userScoreRef = ref(database, "scores/" + user.uid);
      await set(userScoreRef, {
        fullName: userData.fullName,
        email: userData.email,
        avatar: userData.avatar,
        multipleChoice: score1,
        puzzleWords: score2,
        jumbledWords: score3,
        totalScore: total,
        createdAt: new Date().toISOString(),
      });

      navigate("/landingpage");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostInCommunity = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const postsRef = ref(database, `accounts/${user.uid}/posts`);
      await push(postsRef, {
        content: fixedPostContent,
        avatar: userData.avatar,
        username: userData.fullName, // match Feeds layout
        email: userData.email,
        timestamp: new Date().toISOString(),
        likeCount: 0,
        repostCount: 0,
        likedBy: {},
        repostedBy: {},
        comments: {},
        imageURLs: [], // no images
      });

      setShowPostModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-sky-50"
      }`}
    >
      <h1
        className={`text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center ${
          darkMode ? "text-white" : "text-sky-700"
        }`}
      >
        🏆 Your Results
      </h1>

      {/* User Info */}
      <div
        className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border rounded-2xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 w-full max-w-md sm:max-w-2xl transition-colors duration-300 ${
          darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-sky-200 text-gray-800"
        }`}
      >
        {userData.avatar ? (
          <img
            src={userData.avatar}
            alt="avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-sky-400"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
            👤
          </div>
        )}
        <div className="text-center sm:text-left">
          <p className={`text-lg sm:text-xl font-semibold ${darkMode ? "text-white" : "text-sky-700"}`}>
            {userData.fullName}
          </p>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm sm:text-base`}>
            {userData.email}
          </p>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10 w-full max-w-md sm:max-w-4xl">
        {[ 
          { label: "Multiple Choice", value: score1, color: "green" },
          { label: "Puzzle Words", value: score2, color: "green" },
          { label: "Jumbled Words", value: score3, color: "green" },
          { label: "Total Score", value: total, color: "sky" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center border-2 rounded-2xl shadow-md p-4 sm:p-6 transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-sky-300 text-gray-800"
            }`}
          >
            <h2 className={`text-sm sm:text-lg font-semibold ${darkMode ? "text-white" : "text-sky-600"}`}>
              {item.label}
            </h2>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
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

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
        <button
          onClick={handleSaveAndBack}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors text-white ${
            darkMode ? "bg-sky-600 hover:bg-sky-500" : "bg-sky-500 hover:bg-sky-600"
          }`}
        >
          Save & Back to Home
        </button>

        <button
          onClick={handlePostInCommunity}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors text-white ${
            darkMode ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          <FaShareAlt /> Post in Community
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center`}
          >
            <h2 className="text-2xl font-bold mb-4">✅ Successfully posted!</h2>
            <p className="mb-6">Your quiz results have been shared in the Community.</p>
            <button
              className="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Score;
