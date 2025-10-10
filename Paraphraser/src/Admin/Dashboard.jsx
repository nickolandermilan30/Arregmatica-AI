// src/Home/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LogOut,
  Home,
  User as UserIcon,
  Shield,
  Trophy,
} from "lucide-react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { useDarkMode } from "../Theme/DarkModeContext";
import User from "./User"; // ✅ Users page
import AdminAcc from "./AdminAcc"; // ✅ Admin Account page
import Leaderboard from "./Leaderboard"; // ✅ Leaderboard page
import DashboardPage from "./DashboardPage"; // ✅ Dashboard page

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);
  const { darkMode, setDarkMode } = useDarkMode(); 
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ modal state

  // ✅ kunin admin data sa localStorage
  useEffect(() => {
    const stored = localStorage.getItem("adminData");
    if (stored) {
      setAdmin(JSON.parse(stored));
    }
  }, []);

  // ✅ logout
  const handleLogout = () => {
    localStorage.removeItem("adminData");
    navigate("/admin-login");
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Mobile Toggle Button (Hamburger to X) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 md:hidden z-50 p-2 rounded-lg bg-sky-500 text-white focus:outline-none"
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <span
            className={`absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${
              sidebarOpen ? "rotate-45" : "-translate-y-2"
            }`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${
              sidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-white rounded transition-all duration-300 ease-in-out ${
              sidebarOpen ? "-rotate-45" : "translate-y-2"
            }`}
          ></span>
        </div>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 p-6 shadow-lg flex flex-col items-center transform transition-transform duration-300 z-40
          ${darkMode ? "bg-gray-800" : "bg-white"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {admin ? (
          <>
            <img
              src={admin.avatarURL}
              alt="Admin Avatar"
              className="w-24 h-24 rounded-full border-4 border-sky-500 object-cover mb-4"
            />
            <h2 className="text-xl font-bold">{admin.username}</h2>
            <p className="text-sm opacity-75">{admin.email}</p>
            <p className="text-xs mt-1">Access Code: ARREGMATICA123</p>
          </>
        ) : (
          <p className="text-sm">Loading admin...</p>
        )}

        {/* Buttons */}
        <nav className="mt-8 flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              navigate("/admin");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200 text-gray-800"
            }`}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            onClick={() => {
              navigate("/admin/users");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200 text-gray-800"
            }`}
          >
            <UserIcon size={18} /> Users
          </button>
          <button
            onClick={() => {
              navigate("/admin/admin-account");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200 text-gray-800"
            }`}
          >
            <Shield size={18} /> Admin Account
          </button>
          <button
            onClick={() => {
              navigate("/admin/leaderboard");
              setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200 text-gray-800"
            }`}
          >
            <Trophy size={18} /> Leaderboard
          </button>
          <button
            onClick={() => setShowLogoutModal(true)} // ✅ open modal
            className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>

        {/* Dark Mode Toggle */}
        <div className="mt-auto flex items-center gap-3">
          <span className="text-sm">Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-sky-500 transition-colors duration-300"></div>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-6"></span>
          </label>
        </div>
      </aside>

      {/* Main content with nested routes */}
      <main className="flex-1 p-10 md:ml-0 ml-0">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<User />} />
          <Route path="admin-account" element={<AdminAcc />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>

   
     {/* ✅ Logout Confirmation Modal */}
{showLogoutModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div
            className={`p-6 rounded-lg shadow-lg w-80 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6 text-sm">
              Are you sure you want to log out of your admin account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
