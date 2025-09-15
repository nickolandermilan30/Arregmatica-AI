import React, { useState, useEffect } from "react";
import { User, Mail, History, BookOpen, FileText, Type, Wand2, Award } from "lucide-react";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, remove } from "firebase/database";
import AIImage from "../assets/AI.jpg";
import { useNavigate } from "react-router-dom";

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
          ? Math.round(items.reduce((sum, item) => sum + (item.percent || 0), 0) / count)
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

    // ✅ Fetch quiz totalScore (sum of all users or current user only)
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
      await remove(ref(database, "scores")); // ✅ Clear quiz data too

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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar (Desktop only) */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <nav className="space-y-3">
          <button
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left transition ${
              activeTab === "account"
                ? "bg-blue-100 text-blue-600 font-semibold"
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
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History size={20} /> Data Controls
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-20 md:pb-6">
        {/* Account Tab */}
        {activeTab === "account" && (
          <section className="bg-white rounded-xl shadow-md p-6">
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
                  <p className="font-semibold text-gray-800">
                    {currentUser.displayName || "No Name"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Mail size={18} /> <span>{currentUser.email}</span>
                </div>
                <div className="text-gray-500 text-xs md:text-sm space-y-1 text-right">
                  <p>Created: {currentUser.metadata?.creationTime}</p>
                  <p>Last Sign-in: {currentUser.metadata?.lastSignInTime}</p>
                  <p>UID: {currentUser.uid}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No user logged in.</p>
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
          <section className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6">Data Controls</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Grammar */}
              <div className="p-6 border rounded-xl shadow-sm bg-sky-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-sky-700 mb-2">
                  <Type size={18} /> Grammar
                </h4>
                <p className="text-gray-700">
                  Total Checks: <span className="font-bold">{grammarStats.count}</span>
                </p>
                <p className="text-gray-700">
                  Avg Percent: <span className="font-bold">{grammarStats.avgPercent}%</span>
                </p>
              </div>

              {/* Improve */}
              <div className="p-6 border rounded-xl shadow-sm bg-green-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-2">
                  <Wand2 size={18} /> Improve
                </h4>
                <p className="text-gray-700">
                  Total Improves: <span className="font-bold">{improveCount}</span>
                </p>
              </div>

              {/* Dictionary */}
              <div className="p-6 border rounded-xl shadow-sm bg-yellow-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-700 mb-2">
                  <BookOpen size={18} /> Dictionary
                </h4>
                <p className="text-gray-700">
                  Entries: <span className="font-bold">{dictionaryCount}</span>
                </p>
              </div>

              {/* Essays */}
              <div className="p-6 border rounded-xl shadow-sm bg-indigo-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-indigo-700 mb-2">
                  <FileText size={18} /> Essays
                </h4>
                <p className="text-gray-700">
                  Saved Essays: <span className="font-bold">{essayCount}</span>
                </p>
              </div>

              {/* Humanize */}
              <div className="p-6 border rounded-xl shadow-sm bg-pink-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-pink-700 mb-2">
                  <User size={18} /> Humanize
                </h4>
                <p className="text-gray-700">
                  Converted Texts: <span className="font-bold">{humanizeCount}</span>
                </p>
              </div>

              {/* ✅ Quiz */}
              <div className="p-6 border rounded-xl shadow-sm bg-orange-50">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-orange-700 mb-2">
                  <Award size={18} /> Quiz
                </h4>
                <p className="text-gray-700">
                  Total Score: <span className="font-bold">{quizScore}</span>
                </p>
              </div>
            </div>

            {/* Clear Button */}
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
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-2 md:hidden z-50">
        <button
          className={`flex flex-col items-center text-sm ${
            activeTab === "account" ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("account")}
        >
          <User size={20} />
          Account
        </button>
        <button
          className={`flex flex-col items-center text-sm ${
            activeTab === "history" ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("history")}
        >
          <History size={20} />
          Data
        </button>
      </nav>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Clear</h2>
            <p className="text-gray-600 mb-6">
              You have <span className="font-bold">{grammarStats.count}</span> grammar items,{" "}
              <span className="font-bold">{improveCount}</span> improve items,{" "}
              <span className="font-bold">{dictionaryCount}</span> dictionary entries,{" "}
              <span className="font-bold">{essayCount}</span> essays,{" "}
              <span className="font-bold">{humanizeCount}</span> humanize items, and{" "}
              <span className="font-bold">{quizScore}</span> quiz score. Are you sure you
              want to clear all?
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
