import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import userdp from "../assets/userdp.png";
import { signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useDarkMode } from "../Theme/DarkModeContext"; // ✅ dark mode

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [totalScore, setTotalScore] = useState(null);
  const { darkMode } = useDarkMode(); // ✅ hook

  useEffect(() => {
    setUser(auth.currentUser);
    setNewName(auth.currentUser?.displayName || "");

    const fetchScore = async () => {
      if (auth.currentUser) {
        try {
          const db = getDatabase();
          const userRef = ref(db, `scores/${auth.currentUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const scoresData = snapshot.val();
            const firstKey = Object.keys(scoresData)[0];
            const userScore = scoresData[firstKey];
            setTotalScore(userScore.totalScore || 0);
          } else {
            setTotalScore(0);
          }
        } catch (error) {
          console.error("Error fetching score:", error);
          setTotalScore(0);
        }
      }
    };

    fetchScore();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      ) {
        await auth.currentUser.delete();
        setModalMessage("Account deleted successfully.");
        setShowModal(true);
        setTimeout(() => (window.location.href = "/"), 2000);
      }
    } catch (error) {
      console.error("Delete account failed:", error);
      setModalMessage(
        "Error: You may need to re-login before deleting your account."
      );
      setShowModal(true);
    }
  };

  const handleSaveName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUser({ ...auth.currentUser, displayName: newName });
      setEditingName(false);
      setModalMessage("Name updated successfully! 🎉");
      setShowModal(true);
    } catch (error) {
      console.error("Failed to update name:", error);
      setModalMessage("Error updating name. Please try again.");
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

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-sky-50 to-sky-100 text-gray-900"
      }`}
    >
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
              <div className="relative">
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
            </div>

            {/* User Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Editable Username */}
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

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-10">
          <button
            onClick={handleLogout}
            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className={`w-full md:w-auto px-6 py-3 rounded-xl shadow-lg font-semibold transition-transform transform hover:scale-105 ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Modal */}
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
    </div>
  );
};

export default Profile;
