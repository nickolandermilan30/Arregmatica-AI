// src/Home/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/admin-bg.jpg";
import { useDarkMode } from "../Theme/DarkModeContext";
import { getDatabase, ref, get, child } from "firebase/database";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const { darkMode } = useDarkMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !accessCode) {
      setError("Please fill in all fields.");
      return;
    }

    if (accessCode !== "ARREGMATICA123") {
      setError("Invalid access code.");
      return;
    }

    try {
      const db = getDatabase();
      const dbRef = ref(db);

      const snapshot = await get(child(dbRef, "admin/account1"));

      if (snapshot.exists()) {
        let found = false;
        snapshot.forEach((childSnap) => {
          const data = childSnap.val();
          if (data.email === email && data.password === password) {
            if (data.restricted) {
              setError("⚠️ Your account has been restricted.");
              found = true;
              return;
            }
            found = true;
            localStorage.setItem("adminData", JSON.stringify(data));
            navigate("/admin");
          }
        });

        if (!found) {
          setError("Invalid email or password.");
        }
      } else {
        setError("No admin accounts found.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-cover bg-center p-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-md w-full">
        <div
          className={`rounded-2xl shadow-2xl p-8 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-900/90 text-gray-100"
              : "bg-white/95 text-gray-900"
          }`}
        >
          <h1 className="text-3xl font-extrabold mb-3 text-center">
            Admin Login
          </h1>
          <p className="text-sm mb-6 text-center opacity-80">
            Sign in with your credentials and access code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter access code"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md w-full"
            >
              Login
            </button>
          </form>

       <div className="mt-6 flex items-center justify-between text-sm gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-lg shadow-md"
          >
            Back
          </button>
          <button
            onClick={() => navigate("/admin-register")}
            className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md"
          >
            Register
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
