// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import userdp from "../assets/userdp.png";
import { signOut, updateProfile } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  update,
} from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useDarkMode } from "../Theme/DarkModeContext";
import { FaMedal } from "react-icons/fa";
import { FiX } from "react-icons/fi";

// ✅ Import all avatars
import cat1 from "../assets/Avatar/cat (1).jpg";
import cat2 from "../assets/Avatar/cat (2).jpg";
import cat3 from "../assets/Avatar/cat (3).jpg";
import cat4 from "../assets/Avatar/cat (4).jpg";
import cat5 from "../assets/Avatar/cat (5).jpg";
import cat6 from "../assets/Avatar/cat (6).jpg";
import cat7 from "../assets/Avatar/cat (7).jpg";
import cat8 from "../assets/Avatar/cat (8).jpg";
import cat9 from "../assets/Avatar/cat (9).jpg";
import cat10 from "../assets/Avatar/cat (10).jpg";

const avatars = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [totalScore, setTotalScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false); // ✅ avatar picker modal
  const { darkMode } = useDarkMode();

  const db = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setUser(currentUser);
    setNewName(currentUser.displayName || "");

    const userStatusRef = ref(db, `scores/${currentUser.uid}`);
    const isOnlineRef = ref(db, `.info/connected`);

    const handlePresence = onValue(isOnlineRef, (snapshot) => {
      if (snapshot.val() === false) return;

      onDisconnect(userStatusRef).update({
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });

      update(userStatusRef, {
        isOnline: true,
        lastSeen: new Date().toISOString(),
      });
    });

    const scoresRef = ref(db, "scores");
const unsubscribeScores = onValue(scoresRef, (snapshot) => {
  if (snapshot.exists()) {
    const scoresData = snapshot.val();
    let foundScore = 0;

    const usersArray = Object.keys(scoresData).map((uid) => {
      const entry = scoresData[uid];
      if (uid === currentUser.uid) {
        foundScore = entry.totalScore || 0;
      }

      return {
        fullName: entry.fullName,
        totalScore: entry.totalScore || 0,
        avatar: entry.avatar || null,
        uid,
        isOnline: entry.isOnline || false,
        lastSeen: entry.lastSeen || null,
      };
    });

    // ✅ Only keep users with score > 0
    const filteredUsers = usersArray.filter(user => user.totalScore > 0);

    filteredUsers.sort((a, b) => b.totalScore - a.totalScore);

    setLeaderboard(filteredUsers);
    setTotalScore(foundScore);
  } else {
    setLeaderboard([]);
    setTotalScore(0);
  }
});


    return () => {
      handlePresence();
      unsubscribeScores();
    };
  }, [db]);

  const handleLogout = async () => {
    try {
      const userStatusRef = ref(db, `scores/${auth.currentUser.uid}`);
      await update(userStatusRef, {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });

      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


const handleSaveName = async () => {
  try {
    await updateProfile(auth.currentUser, { displayName: newName });
    setUser({ ...auth.currentUser, displayName: newName });

    // ✅ Update in scores
    const userScoreRef = ref(db, `scores/${auth.currentUser.uid}`);
    await update(userScoreRef, { fullName: newName });

    // ✅ Update in accounts
    const userAccountRef = ref(db, `accounts/${auth.currentUser.uid}`);
    await update(userAccountRef, { username: newName });

    setEditingName(false);
    setModalMessage("Name updated successfully! 🎉");
    setShowModal(true);
  } catch (error) {
    console.error("Failed to update name:", error);
    setModalMessage("Error updating name. Please try again.");
    setShowModal(true);
  }
};


const handleAvatarChange = async (avatar) => {
  try {
    const response = await fetch(avatar);
    const blob = await response.blob();

    const fileRef = storageRef(storage, `avatars/${auth.currentUser.uid}.jpg`);
    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);

    await updateProfile(auth.currentUser, { photoURL: downloadURL });
    setUser({ ...auth.currentUser, photoURL: downloadURL });

    // ✅ Update in scores
    const userScoreRef = ref(db, `scores/${auth.currentUser.uid}`);
    await update(userScoreRef, { avatar: downloadURL });

    // ✅ Update in accounts
    const userAccountRef = ref(db, `accounts/${auth.currentUser.uid}`);
    await update(userAccountRef, { avatar: downloadURL });

    setAvatarModal(false);
    setModalMessage("Profile picture updated successfully! 🎉");
    setShowModal(true);
  } catch (error) {
    console.error("Failed to update avatar:", error);
    setModalMessage("Error updating avatar. Please try again.");
    setShowModal(true);
  }
};


  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const creation = formatDateTime(user?.metadata?.creationTime);
  const lastSignIn = formatDateTime(user?.metadata?.lastSignInTime);

  const getMedal = (index) => {
    if (index === 0) return <FaMedal className="text-yellow-400 text-2xl" />;
    if (index === 1) return <FaMedal className="text-gray-400 text-2xl" />;
    if (index === 2) return <FaMedal className="text-amber-700 text-2xl" />;
    return null;
  };

  return (
    <div
      className={`min-h-screen flex items-start justify-center p-6 gap-6 transition-colors relative ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-sky-50 to-sky-100 text-gray-900"
      }`}
    >
      {/* ✅ Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}

      {/* Leaderboard Sidebar */}
      <div
        className={`fixed md:sticky top-0 left-0 h-full md:h-fit w-72 md:w-64 transform transition-transform duration-300 z-50 md:z-auto p-4 shadow-lg rounded-r-2xl md:rounded-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-lg font-bold text-sky-500">Leaderboard</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={22} />
          </button>
        </div>

        <h2 className="hidden md:block text-xl font-bold mb-4 text-center text-sky-500">
          Leaderboard
        </h2>

        <div className="space-y-3 overflow-y-auto max-h-[80vh] md:max-h-none">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => {
              const lastSeenFormat = formatDateTime(player.lastSeen);
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-3 rounded-xl shadow relative ${
                    darkMode ? "bg-gray-700" : "bg-sky-50"
                  }`}
                >
                  {index < 3 && (
                    <div className="absolute top-2 right-2">
                      {getMedal(index)}
                    </div>
                  )}
                  <div className="relative">
                    <img
                      src={player.avatar || userdp}
                      alt="User"
                      className="w-12 h-12 rounded-full border-2 border-sky-500 object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                        player.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <p className="mt-2 font-semibold">{player.fullName}</p>
                  <p className="text-sm opacity-75">
                    Score:{" "}
                    <span className="font-bold text-sky-600">
                      {player.totalScore}
                    </span>
                  </p>
                  {!player.isOnline && player.lastSeen && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last seen: {lastSeenFormat?.date} {lastSeenFormat?.time}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-sm opacity-70">No scores yet</p>
          )}
        </div>
      </div>

      {/* ✅ Profile Content */}
      <div
        className={`shadow-2xl rounded-2xl w-full max-w-4xl p-8 md:p-12 relative transition-colors ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-4xl font-extrabold text-sky-500 mb-10 text-center tracking-wide">
          Account Details
        </h1>

        {user ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div
              className={`flex flex-col items-center rounded-2xl p-6 shadow-inner w-full md:w-1/3 ${
                darkMode ? "bg-gray-700" : "bg-sky-50"
              }`}
            >
              <div
                className="relative cursor-pointer"
                onClick={() => setAvatarModal(true)} // ✅ open avatar picker modal
              >
                <img
                  src={user.photoURL || userdp}
                  alt="Profile"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-sky-500 shadow-lg object-cover"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-md"></span>
              </div>
              <p className="mt-6 text-2xl font-bold text-center">
                {user.displayName || "No Name"}
              </p>
              <p className="text-sm mt-1 text-center opacity-75">Active User</p>
              <button
                onClick={() => setAvatarModal(true)}
                className="mt-4 bg-sky-500 text-white px-4 py-2 rounded-lg shadow hover:bg-sky-600"
              >
                Change Avatar
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Username */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition flex flex-col gap-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Username</p>
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className={`border rounded-lg px-4 py-2 w-full ${
                        darkMode
                          ? "bg-gray-800 text-white border-gray-600"
                          : "text-gray-800 border-gray-300"
                      }`}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveName}
                        className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700"
                      >
                        Save Name
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewName(user.displayName || "");
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                          darkMode
                            ? "bg-gray-600 text-white hover:bg-gray-500"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold">
                      {user.displayName || "No Username"}
                    </p>
                    <button
                      onClick={() => setEditingName(true)}
                      className="w-full bg-sky-100 text-sky-700 px-4 py-2 rounded-lg font-medium hover:bg-sky-200"
                    >
                      Edit Name
                    </button>
                  </>
                )}
              </div>

              {/* Email */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Email Address</p>
                <p className="text-lg font-semibold break-words">{user.email}</p>
              </div>

              {/* UID */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Account UID</p>
                <p className="text-lg font-semibold break-words">{user.uid}</p>
              </div>

              {/* Creation Date */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Account Created</p>
                <p className="text-lg font-semibold">{creation?.date}</p>
                <p className="text-sm opacity-75">{creation?.time}</p>
              </div>

              {/* Last Sign-in */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Last Sign-in</p>
                <p className="text-lg font-semibold">{lastSignIn?.date}</p>
                <p className="text-sm opacity-75">{lastSignIn?.time}</p>
              </div>

              {/* Total Score */}
              <div
                className={`rounded-xl p-5 shadow-md hover:shadow-lg transition ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="text-sm opacity-75">Total Score</p>
                <p className="text-2xl font-bold text-sky-600">
                  {totalScore !== null ? totalScore : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center opacity-75">No user is logged in.</p>
        )}

        {/* ✅ Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-10">
          {/* ✅ Mobile Only: View Leaderboard Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full md:hidden bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            View Leaderboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            Logout
          </button>
      
        </div>
      </div>

      {/* ✅ Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div
            className={`rounded-2xl shadow-xl p-8 max-w-sm text-center transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Notification</h2>
            <p>{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-sky-600 text-white py-2 rounded-lg font-medium hover:bg-sky-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Avatar Picker Modal */}
      {avatarModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div
            className={`rounded-2xl shadow-xl p-6 max-w-lg w-full transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Choose Your Avatar</h2>
              <button
                onClick={() => setAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {avatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`avatar-${index}`}
                  className="w-20 h-20 rounded-full border-2 border-transparent hover:border-sky-500 cursor-pointer object-cover"
                  onClick={() => handleAvatarChange(avatar)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
