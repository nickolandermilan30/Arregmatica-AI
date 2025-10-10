// src/Home/AdminRegister.jsx
import React, { useState } from "react";
import { Eye, EyeOff, UserCheck, Shield, Star, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, push, set } from "firebase/database";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import bgImage from "../assets/admin-bg.jpg"; 
import { useDarkMode } from "../Theme/DarkModeContext";

// ✅ import avatar images
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

const AdminRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [tempAvatar, setTempAvatar] = useState(null);
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  const avatars = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;
    const accessCode = e.target.accessCode.value;

    if (password !== confirm) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (!selectedAvatar) {
      alert("Please select an avatar before registering!");
      setLoading(false);
      return;
    }

    if (!accessCode || accessCode !== "ARREGMATICA123") {
      alert("Invalid access code!");
      setLoading(false);
      return;
    }

    try {
      // ✅ Realtime Database save
      const db = getDatabase();
      const adminRef = dbRef(db, "admin/account1"); // lahat ng admin accounts dito
      const newAdminRef = push(adminRef); // auto-generate unique id

      // ✅ Upload Avatar to Storage
      const avatarRef = ref(storage, `admin/${newAdminRef.key}.jpg`);
      const response = await fetch(selectedAvatar);
      const blob = await response.blob();
      await uploadBytes(avatarRef, blob);

      const downloadURL = await getDownloadURL(avatarRef);

      // ✅ Save data to RTDB
      await set(newAdminRef, {
        id: newAdminRef.key,
        username,
        email,
        password, // ⚠️ hindi secure i-save plain password, better hashed
        avatarURL: downloadURL,
        createdAt: new Date().toISOString(),
      });

      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center min-h-screen bg-cover bg-center px-4 sm:px-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div
        className={`relative shadow-lg rounded-2xl p-4 sm:p-8 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 transition-colors duration-300 ${
          darkMode ? "bg-gray-900/95 text-gray-100" : "bg-white/95 text-gray-900"
        }`}
      >
        {/* Left side: Avatar + Info */}
        <div className="flex flex-col justify-center items-center text-center px-2 sm:px-4 relative">
          <div className="mb-4">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-blue-500 cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  setTempAvatar(selectedAvatar);
                  setAvatarModal(true);
                }}
              />
            ) : (
              <div
                onClick={() => setAvatarModal(true)}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <Plus size={28} className="sm:w-8 sm:h-8 text-gray-600" />
              </div>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold mb-3">
            Why Register as Admin?
          </h2>
          <p className="mb-6 text-xs sm:text-sm opacity-80">
            Gain privileged access, manage users, and unlock advanced features.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <UserCheck size={24} className="text-blue-600 mb-1" />
              <span className="text-xs">Easy Access</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield size={24} className="text-green-600 mb-1" />
              <span className="text-xs">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <Star size={24} className="text-yellow-500 mb-1" />
              <span className="text-xs">Exclusive</span>
            </div>
          </div>
        </div>

        {/* Right side: Form */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-center mb-4">
            Admin Register
          </h2>
          <form className="space-y-3" onSubmit={handleRegister}>
            <div>
              <label className="block mb-1 text-sm">Username</label>
              <input
                name="username"
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-2 pr-8 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full p-2 pr-8 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-2 flex items-center"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm">Access Code</label>
              <input
                name="accessCode"
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-sm"
                placeholder="Enter admin access code"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/admin-login")}
                className="w-full sm:w-1/2 bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-100 transition border text-sm"
              >
                Go Back Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Avatar Selection Modal */}
      {avatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-3xl">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
              Choose Your Avatar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
              {avatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`avatar-${index}`}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full cursor-pointer border-4 ${
                    tempAvatar === avatar
                      ? "border-blue-500"
                      : "border-transparent"
                  } hover:scale-110 transition`}
                  onClick={() => setTempAvatar(avatar)}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => setAvatarModal(false)}
                className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!tempAvatar}
                onClick={() => {
                  setSelectedAvatar(tempAvatar);
                  setAvatarModal(false);
                }}
                className="w-full sm:w-1/2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
              >
                Set Avatar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-3">
              🎉 You are registered!
            </h3>
            <p className="text-gray-600 mb-5 text-sm">
              Your admin account has been created successfully.
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/admin-login");
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegister;
