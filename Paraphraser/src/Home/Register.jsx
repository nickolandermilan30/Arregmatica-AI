import React, { useState } from "react";
import { Eye, EyeOff, UserCheck, Shield, Star, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import bgImage from "../assets/bg_picture.png";

// ✅ import avatar images (predefined)
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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [tempAvatar, setTempAvatar] = useState(null);
  const navigate = useNavigate();

  const avatars = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

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

    try {
      // ✅ Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Upload avatar to Firebase Storage
      const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
      const response = await fetch(selectedAvatar);
      const blob = await response.blob();
      await uploadBytes(avatarRef, blob);

      // ✅ Get download URL
      const downloadURL = await getDownloadURL(avatarRef);

      // ✅ Update profile with displayName + avatar URL
      await updateProfile(user, {
        displayName: username,
        photoURL: downloadURL,
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
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center px-4 sm:px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white shadow-lg rounded-2xl p-6 sm:p-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left side: Avatar + Why Register */}
        <div className="flex flex-col justify-center items-center text-center px-2 sm:px-6 relative">
          <div className="mb-6">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-500 cursor-pointer hover:scale-105 transition"
                onClick={() => {
                  setTempAvatar(selectedAvatar);
                  setAvatarModal(true);
                }}
              />
            ) : (
              <div
                onClick={() => setAvatarModal(true)}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-gray-400 flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <Plus size={32} className="sm:w-10 sm:h-10 text-gray-600" />
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-4">Why Register / Login?</h2>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Creating an account gives you secure access, personalized features, 
            and exclusive content. Start your journey today!
          </p>

          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <UserCheck size={28} className="sm:w-9 sm:h-9 text-blue-600 mb-2" />
              <span className="text-xs sm:text-sm text-gray-700">Easy Access</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield size={28} className="sm:w-9 sm:h-9 text-green-600 mb-2" />
              <span className="text-xs sm:text-sm text-gray-700">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <Star size={28} className="sm:w-9 sm:h-9 text-yellow-500 mb-2" />
              <span className="text-xs sm:text-sm text-gray-700">Exclusive</span>
            </div>
          </div>
        </div>

        {/* Right side: Form */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Register</h2>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Username</label>
              <input
                name="username"
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-sm sm:text-base"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300 text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm sm:text-base">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="w-full p-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300 text-sm sm:text-base"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-1/2 bg-white text-gray-800 p-2 rounded-lg shadow hover:bg-gray-100 transition border text-sm sm:text-base"
              >
                Go Back Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
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
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-4xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-6 text-center">Choose Your Avatar</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
              {avatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`avatar-${index}`}
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full cursor-pointer border-4 ${
                    tempAvatar === avatar ? "border-blue-500" : "border-transparent"
                  } hover:scale-110 transition`}
                  onClick={() => setTempAvatar(avatar)}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => setAvatarModal(false)}
                className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                disabled={!tempAvatar}
                onClick={() => {
                  setSelectedAvatar(tempAvatar);
                  setAvatarModal(false);
                }}
                className="w-full sm:w-1/2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">🎉 You are registered!</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Your account has been created successfully.</p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/");
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
