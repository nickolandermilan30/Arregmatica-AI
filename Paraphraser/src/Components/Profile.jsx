import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import userdp from "../assets/userdp.png";
import { signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [totalScore, setTotalScore] = useState(null);

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

            // ✅ Kumuha ng latest o unang entry (depende sa structure)
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8 md:p-12 relative">
        <h1 className="text-4xl font-extrabold text-sky-700 mb-10 text-center tracking-wide">
          Account Details
        </h1>

        {user ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center bg-sky-50 rounded-2xl p-6 shadow-inner w-full md:w-1/3">
              <div className="relative">
                <img
                  src={user.photoURL || userdp}
                  alt="Profile"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-sky-500 shadow-lg object-cover"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-md"></span>
              </div>
              <p className="mt-6 text-2xl font-bold text-gray-800 text-center">
                {user.displayName || "No Name"}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-center">
                Active User
              </p>
            </div>

            {/* User Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Editable Username */}
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition flex flex-col gap-4">
                <p className="text-sm text-gray-500">Username</p>

                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border rounded-lg px-4 py-2 text-gray-800 w-full"
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
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900">
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
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-lg font-semibold text-gray-900 break-words">
                  {user.email}
                </p>
              </div>

              {/* UID */}
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition">
                <p className="text-sm text-gray-500">Account UID</p>
                <p className="text-lg font-semibold text-gray-900 break-words">
                  {user.uid}
                </p>
              </div>

              {/* Creation Date */}
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition">
                <p className="text-sm text-gray-500">Account Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {creation?.date}
                </p>
                <p className="text-sm text-gray-600">{creation?.time}</p>
              </div>

              {/* Last Sign-in */}
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition">
                <p className="text-sm text-gray-500">Last Sign-in</p>
                <p className="text-lg font-semibold text-gray-900">
                  {lastSignIn?.date}
                </p>
                <p className="text-sm text-gray-600">{lastSignIn?.time}</p>
              </div>

              {/* ✅ Total Score */}
              <div className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-lg transition">
                <p className="text-sm text-gray-500">Total Score</p>
                <p className="text-2xl font-bold text-sky-600">
                  {totalScore !== null ? totalScore : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user is logged in.</p>
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
            className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Notification
            </h2>
            <p className="text-gray-600">{modalMessage}</p>
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
