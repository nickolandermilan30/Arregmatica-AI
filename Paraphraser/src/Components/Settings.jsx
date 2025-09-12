import React, { useState, useEffect } from "react";
import { User, Mail, History } from "lucide-react";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, remove } from "firebase/database";
import AIImage from "../assets/AI.jpg";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account"); // ✅ default = account
  const [currentUser, setCurrentUser] = useState(null);
  const [grammarStats, setGrammarStats] = useState({ count: 0, avgPercent: 0 });
  const [improveCount, setImproveCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // ✅ Listen to user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch grammar + improve stats
  useEffect(() => {
    const grammarRef = ref(database, "grammar");
    const improveRef = ref(database, "improve");

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

    return () => {
      grammarUnsub();
      improveUnsub();
    };
  }, []);

  // ✅ Clear both histories
  const handleClearHistory = async () => {
    try {
      await remove(ref(database, "grammar"));
      await remove(ref(database, "improve"));
      setGrammarStats({ count: 0, avgPercent: 0 });
      setImproveCount(0);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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
            <User size={20} /> Accounts
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

      {/* Content Area */}
      <main className="flex-1 p-6">
        {/* Account Tab */}
        {activeTab === "account" && (
          <section className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Account Info</h3>

            {currentUser ? (
              <div className="flex items-center justify-between border rounded-lg p-4 shadow-sm space-x-4">
                {/* Left: Profile Image + Name */}
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

                {/* Center: Email */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} /> <span>{currentUser.email}</span>
                </div>

                {/* Right: Account Info */}
                <div className="text-right text-gray-500 text-sm space-y-1">
                  <p>Created: {currentUser.metadata?.creationTime}</p>
                  <p>Last Sign-in: {currentUser.metadata?.lastSignInTime}</p>
                  <p>UID: {currentUser.uid}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No user logged in.</p>
            )}

            {/* Bottom Manage Button */}
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
            <h3 className="text-xl font-semibold mb-4">History Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grammar Card */}
              <div className="p-6 border rounded-xl shadow-sm bg-sky-50">
                <h4 className="text-lg font-semibold text-sky-700 mb-2">
                  Grammar
                </h4>
                <p className="text-gray-700">
                  Total Checks:{" "}
                  <span className="font-bold">{grammarStats.count}</span>
                </p>
                <p className="text-gray-700">
                  Average Percent:{" "}
                  <span className="font-bold">{grammarStats.avgPercent}%</span>
                </p>
              </div>

              {/* Improve Card */}
              <div className="p-6 border rounded-xl shadow-sm bg-green-50">
                <h4 className="text-lg font-semibold text-green-700 mb-2">
                  Improve
                </h4>
                <p className="text-gray-700">
                  Total Improves:{" "}
                  <span className="font-bold">{improveCount}</span>
                </p>
              </div>
            </div>

            {/* Clear Button */}
            {(grammarStats.count > 0 || improveCount > 0) && (
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

      {/* 🔹 Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Clear
            </h2>
            <p className="text-gray-600 mb-6">
              You have{" "}
              <span className="font-bold">{grammarStats.count}</span> grammar
              items and{" "}
              <span className="font-bold">{improveCount}</span> improve items.
              Are you sure you want to clear all?
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
