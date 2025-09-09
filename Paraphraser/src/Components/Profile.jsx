import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import userdp from "../assets/userdp.png";
import { signOut } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // redirect to home/login
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
        alert("Account deleted successfully.");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Delete account failed:", error);
      alert("Error: You may need to re-login before deleting your account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Account Details
        </h1>

        {user ? (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <img
                src={user.photoURL || userdp}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-sky-500 shadow-md"
              />
            </div>

            {/* User Info */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.displayName || "No name set"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account UID</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.uid}
                </p>
              </div>
            </div>

            {/* Action Buttons (Stacked) */}
            <div className="flex flex-col space-y-4 mt-8">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md font-semibold"
              >
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg shadow-md font-semibold"
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No user is logged in.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
