// src/Home/User.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  LogIn,
  Fingerprint,
  Trash2,
  Slash,
  XCircle,
} from "lucide-react";
import { useDarkMode } from "../Theme/DarkModeContext";

const User = () => {
  const [users, setUsers] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "restrict" or "unrestrict"
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const db = getDatabase();
    const accountsRef = ref(db, "accounts");

    onValue(accountsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(data);
    });
  }, []);

  const toggleExpand = (uid) => {
    setExpanded((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const handleDeleteClick = (uid) => {
    setSelectedUser(uid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    const db = getDatabase();
    const userRef = ref(db, `accounts/${selectedUser}`);
    await set(userRef, null); // remove from database

    // Show modal instead of alert
    setInfoMessage("User deleted. To remove from Authentication, implement backend/admin SDK.");
    setShowInfoModal(true);

    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleRestrictToggle = (uid, currentlyRestricted) => {
    setSelectedUser(uid);
    setActionType(currentlyRestricted ? "unrestrict" : "restrict");
    setShowRestrictModal(true);
  };

  const confirmRestrictToggle = async () => {
    if (!selectedUser) return;
    const db = getDatabase();
    const restrictedRef = ref(db, `accounts/${selectedUser}/restricted`);
    await set(restrictedRef, actionType === "restrict"); // true if restricting, false if unrestricting

    // Show modal instead of alert
    setInfoMessage(`User ${actionType === "restrict" ? "restricted" : "unrestricted"}.`);
    setShowInfoModal(true);

    setShowRestrictModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-sky-500">
        User Accounts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {Object.entries(users).map(([uid, user]) => (
          <div
            key={uid}
            className={`relative rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg border
              ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-800 border-gray-200"}`}
          >
            {/* Online/Offline dot */}
            <span
              className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>

            {/* Restricted X */}
            {user.restricted && (
              <span className="absolute top-3 left-3 text-red-500" title="Restricted">
                <XCircle size={20} />
              </span>
            )}

            <div className="flex flex-col items-center">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-full border-2 border-sky-500 object-cover"
              />
              <h2 className="mt-3 text-lg font-semibold">{user.username}</h2>

              {/* Expand/Collapse */}
              <button
                onClick={() => toggleExpand(uid)}
                className="mt-3 flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
              >
                {expanded[uid] ? (
                  <>
                    Hide Details <ChevronUp className="ml-1 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="ml-1 w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => handleDeleteClick(uid)}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={16} /> Clear Data
              </button>
              <button
                onClick={() => handleRestrictToggle(uid, user.restricted)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                  user.restricted
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <Slash size={16} /> {user.restricted ? "Unrestrict" : "Restrict"}
              </button>
            </div>

            {/* Details */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out
                ${expanded[uid] ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
            >
              <div
                className={`border-t pt-3 text-sm rounded-lg p-3 ${
                  darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-500" /> {user.email}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-sky-500" /> Created:{" "}
                  {user.accountCreated}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <LogIn className="w-4 h-4 text-sky-500" /> Last Sign In:{" "}
                  {user.lastSignIn}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Fingerprint className="w-4 h-4 text-sky-500" />
                  <span className="truncate">
                    <strong>UID:</strong> {uid}
                  </span>
                </p>
                {user.posts && (
                  <p className="flex items-center gap-2 mt-2">
                    <strong>Posts:</strong> {Object.keys(user.posts).length}
                  </p>
                )}
                {user.groups && (
                  <p className="flex items-center gap-2 mt-1">
                    <strong>Groups:</strong> {Object.keys(user.groups).length}
                  </p>
                )}
                {user.scores && (
                  <p className="flex items-center gap-2 mt-1">
                    <strong>Scores:</strong> {JSON.stringify(user.scores)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Confirm Clear</h2>
            <p className="mb-6">Are you sure you want to Clear this user account?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  darkMode ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict/Unrestrict modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">
              {actionType === "restrict" ? "Confirm Restrict" : "Confirm Unrestrict"}
            </h2>
            <p className="mb-6">
              Are you sure you want to {actionType === "restrict" ? "restrict" : "unrestrict"} this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRestrictToggle}
                className={`${
                  actionType === "restrict" ? "bg-gray-700 hover:bg-gray-600" : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-lg transition`}
              >
                Yes, {actionType === "restrict" ? "Restrict" : "Unrestrict"}
              </button>
              <button
                onClick={() => setShowRestrictModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  darkMode ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info modal instead of alert */}
      {showInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <p className="mb-6">{infoMessage}</p>
            <button
              onClick={() => setShowInfoModal(false)}
              className={`px-4 py-2 rounded-lg transition ${
                darkMode ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
