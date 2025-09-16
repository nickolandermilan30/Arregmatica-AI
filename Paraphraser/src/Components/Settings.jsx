import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  History,
  BookOpen,
  FileText,
  Type,
  Wand2,
  Award,
  SunMoon,
} from "lucide-react";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, remove } from "firebase/database";
import AIImage from "../assets/AI.jpg";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ global dark mode

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Stats state
  const [grammarStats, setGrammarStats] = useState({ count: 0, avgPercent: 0 });
  const [improveCount, setImproveCount] = useState(0);
  const [dictionaryCount, setDictionaryCount] = useState(0);
  const [essayCount, setEssayCount] = useState(0);
  const [humanizeCount, setHumanizeCount] = useState(0);
  const [quizScore, setQuizScore] = useState(0); // ✅ Quiz state

  const [showModal, setShowModal] = useState(false);
  const { darkMode, setDarkMode } = useDarkMode(); // ✅ use context
  const navigate = useNavigate();

  // ✅ Listen for auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch all stats
  useEffect(() => {
    const grammarRef = ref(database, "grammar");
    const improveRef = ref(database, "improve");
    const dictRef = ref(database, "dictionary");
    const essayRef = ref(database, "essays");
    const humanizeRef = ref(database, "humanize");
    const quizRef = ref(database, "scores");

    const grammarUnsub = onValue(grammarRef, (snapshot) => {
      const data = snapshot.val() || {};
      const items = Object.values(data);
      const count = items.length;
      const avgPercent =
        count > 0
          ? Math.round(
              items.reduce((sum, item) => sum + (item.percent || 0), 0) / count
            )
          : 0;
      setGrammarStats({ count, avgPercent });
    });

    const improveUnsub = onValue(improveRef, (snapshot) => {
      const data = snapshot.val() || {};
      setImproveCount(Object.values(data).length);
    });

    const dictUnsub = onValue(dictRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDictionaryCount(Object.values(data).length);
    });

    const essayUnsub = onValue(essayRef, (snapshot) => {
      const data = snapshot.val() || {};
      setEssayCount(Object.values(data).length);
    });

    const humanizeUnsub = onValue(humanizeRef, (snapshot) => {
      const data = snapshot.val() || {};
      setHumanizeCount(Object.values(data).length);
    });

    // ✅ Fetch quiz totalScore
    const quizUnsub = onValue(quizRef, (snapshot) => {
      const data = snapshot.val() || {};
      let total = 0;
      Object.values(data).forEach((userScores) => {
        if (typeof userScores === "object") {
          Object.values(userScores).forEach((entry) => {
            total += entry.totalScore || 0;
          });
        }
      });
      setQuizScore(total);
    });

    return () => {
      grammarUnsub();
      improveUnsub();
      dictUnsub();
      essayUnsub();
      humanizeUnsub();
      quizUnsub();
    };
  }, []);

  // ✅ Clear all histories
  const handleClearHistory = async () => {
    try {
      await remove(ref(database, "grammar"));
      await remove(ref(database, "improve"));
      await remove(ref(database, "dictionary"));
      await remove(ref(database, "essays"));
      await remove(ref(database, "humanize"));
      await remove(ref(database, "scores"));

      setGrammarStats({ count: 0, avgPercent: 0 });
      setImproveCount(0);
      setDictionaryCount(0);
      setEssayCount(0);
      setHumanizeCount(0);
      setQuizScore(0);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Sidebar (Desktop) */}
      <aside
        className={`w-64 shadow-lg p-6 hidden md:block ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <nav className="space-y-3">
          <button
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition ${
              activeTab === "account"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : darkMode
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("account")}
          >
            <User size={20} /> Account
          </button>
          <button
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition ${
              activeTab === "history"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : darkMode
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History size={20} /> Data Controls
          </button>
          <button
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition ${
              activeTab === "appearance"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : darkMode
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("appearance")}
          >
            <SunMoon size={20} /> Appearance
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-20 md:pb-6">
        {/* Account Tab */}
        {activeTab === "account" && (
          <section
            className={`rounded-xl shadow-md p-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-semibold mb-4">Account Info</h3>
            {currentUser ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-4 shadow-sm space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={AIImage}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full"></span>
                  </div>
                  <p className="font-semibold">
                    {currentUser.displayName || "No Name"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={18} /> <span>{currentUser.email}</span>
                </div>
                <div className="text-xs md:text-sm space-y-1 text-right">
                  <p>Created: {currentUser.metadata?.creationTime}</p>
                  <p>Last Sign-in: {currentUser.metadata?.lastSignInTime}</p>
                  <p>UID: {currentUser.uid}</p>
                </div>
              </div>
            ) : (
              <p>No user logged in.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-sky-500 hover:bg-blue-700 text-white rounded-lg shadow"
              >
                Manage
              </button>
            </div>
          </section>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <section
            className={`rounded-xl shadow-md p-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-semibold mb-6">Data Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grammar */}
              <div className="p-6 border rounded-xl shadow-sm bg-sky-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-sky-700 dark:text-sky-400 mb-2">
                  <Type size={18} /> Grammar
                </h4>
                <p>Total Checks: {grammarStats.count}</p>
                <p>Avg Percent: {grammarStats.avgPercent}%</p>
              </div>
              {/* Improve */}
              <div className="p-6 border rounded-xl shadow-sm bg-green-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                  <Wand2 size={18} /> Improve
                </h4>
                <p>Total Improves: {improveCount}</p>
              </div>
              {/* Dictionary */}
              <div className="p-6 border rounded-xl shadow-sm bg-yellow-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  <BookOpen size={18} /> Dictionary
                </h4>
                <p>Entries: {dictionaryCount}</p>
              </div>
              {/* Essays */}
              <div className="p-6 border rounded-xl shadow-sm bg-indigo-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                  <FileText size={18} /> Essays
                </h4>
                <p>Saved Essays: {essayCount}</p>
              </div>
              {/* Humanize */}
              <div className="p-6 border rounded-xl shadow-sm bg-pink-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-pink-700 dark:text-pink-400 mb-2">
                  <User size={18} /> Humanize
                </h4>
                <p>Converted Texts: {humanizeCount}</p>
              </div>
              {/* Quiz */}
              <div className="p-6 border rounded-xl shadow-sm bg-orange-50 dark:bg-gray-700">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">
                  <Award size={18} /> Quiz
                </h4>
                <p>Total Score: {quizScore}</p>
              </div>
            </div>
            {(grammarStats.count > 0 ||
              improveCount > 0 ||
              dictionaryCount > 0 ||
              essayCount > 0 ||
              humanizeCount > 0 ||
              quizScore > 0) && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
                >
                  Clear All Data
                </button>
              </div>
            )}
          </section>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <section
            className={`rounded-xl shadow-md p-6 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-semibold mb-6">Appearance</h3>
            <div className="flex items-center justify-between border rounded-xl p-6 shadow-sm">
              <div>
                <h4 className="text-lg font-semibold">Dark Mode</h4>
                <p className="text-sm opacity-70">
                  Switch between light and dark theme
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-6"></span>
              </label>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className={`fixed bottom-0 left-0 right-0 border-t shadow-inner flex justify-around py-2 md:hidden z-50 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white"
        }`}
      >
        <button
          className={`flex flex-col items-center text-sm ${
            activeTab === "account"
              ? "text-blue-600 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("account")}
        >
          <User size={20} />
          Account
        </button>
        <button
          className={`flex flex-col items-center text-sm ${
            activeTab === "history"
              ? "text-blue-600 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <History size={20} />
          Data
        </button>
        <button
          className={`flex flex-col items-center text-sm ${
            activeTab === "appearance"
              ? "text-blue-600 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("appearance")}
        >
          <SunMoon size={20} />
          Theme
        </button>
      </nav>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div
            className={`rounded-2xl shadow-xl p-8 max-w-sm text-center ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Confirm Clear</h2>
            <p className="mb-6">
              You have <b>{grammarStats.count}</b> grammar items,{" "}
              <b>{improveCount}</b> improve items, <b>{dictionaryCount}</b>{" "}
              dictionary entries, <b>{essayCount}</b> essays,{" "}
              <b>{humanizeCount}</b> humanize items, and <b>{quizScore}</b> quiz
              score. Are you sure you want to clear all?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
