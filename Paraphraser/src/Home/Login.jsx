import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database"; // ✅ import database
import bgImage from "../assets/bg_picture.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ✅ Prepare user data
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

      // ✅ Save to Realtime Database
      const db = getDatabase();
      await set(ref(db, "accounts/" + user.uid), userData);

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
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300"
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
