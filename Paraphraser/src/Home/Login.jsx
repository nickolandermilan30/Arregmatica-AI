// src/Home/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import bgImage from "../assets/bg_picture.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [darkMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const db = getDatabase();

      const userRef = ref(db, "accounts/" + user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          username: user.displayName || "No username",
          avatar:
            user.photoURL ||
            `gs://arregmatica.firebasestorage.app/avatars/${user.uid}.png`,
          lastSignIn: user.metadata.lastSignInTime,
          accountCreated: user.metadata.creationTime,
        };
        await set(userRef, userData);
      } else {
        const userData = snapshot.val();
        if (userData.restricted) {
          setShowRestrictedModal(true);
          return;
        }
      }

      navigate("/landingpage");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Sign in to continue to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-3 pr-10 border rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login & Register side by side */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-1/2 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition font-semibold shadow-md"
            >
              Register
            </button>

            <button
              type="submit"
              className="w-1/2 bg-sky-600 text-white py-3 rounded-xl hover:bg-sky-700 transition font-semibold shadow-md"
            >
              Login
            </button>
          </div>

          {/* Admin Login button below both */}
          <button
            type="button"
            onClick={() => navigate("/admin-login")}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-md"
          >
            Admin Login / Register
          </button>

          {/* Text under admin button */}
          <p className="text-sm text-center text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-sky-600 font-medium hover:underline"
            >
              Create one here
            </Link>
          </p>
        </form>
      </div>

      {/* Restricted Modal */}
      {showRestrictedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-red-500">
              Account Restricted
            </h2>
            <p className="mb-6">
              Your account has been restricted and cannot log in. Please contact
              the administrator.
            </p>
            <button
              onClick={() => setShowRestrictedModal(false)}
              className={`px-4 py-2 rounded-lg transition ${
                darkMode
                  ? "bg-gray-600 text-white hover:bg-gray-500"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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

export default Login;
