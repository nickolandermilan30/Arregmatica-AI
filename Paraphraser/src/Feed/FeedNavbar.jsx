import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Search, FileText, Bell } from "lucide-react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase"; 
import userdp from "../assets/userdp.png";
import FriendDetail from "./Modal/FriendDetail";

const FeedNavbar = () => {
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // dropdown states
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
  const [openNotifDropdown, setOpenNotifDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const db = getDatabase();
    const accountsRef = ref(db, "accounts");

    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const accountsArray = Object.keys(data).map((uid) => ({
          uid,
          ...data[uid],
        }));
        setAccounts(accountsArray);
      } else {
        setAccounts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }

    const lower = query.toLowerCase();
    const results = accounts.filter((acc) =>
      acc.username?.toLowerCase().includes(lower)
    );
    setFiltered(results);
  }, [query, accounts]);

  // ✅ close dropdown kapag nag click sa labas
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfileDropdown(false);
        setOpenNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-4 py-3 shadow-md bg-white relative">
      {/* Left - Story Icon */}
      <div className="flex items-center space-x-2">
        <BookOpen size={28} className="text-blue-500" />
        <span className="font-bold text-lg text-gray-800">Stories</span>
      </div>

      {/* Right - Search + Notif + Profile */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Search Bar */}
        <div className="relative w-64 sm:w-80">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <Search size={20} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search learners"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-500"
            />
          </div>

          {/* Dropdown Results */}
          {filtered.length > 0 && (
            <div className="absolute mt-4 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {filtered.map((acc) => (
                <div
                  key={acc.uid}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(acc);
                    setShowModal(true);
                  }}
                >
                  <img
                    src={acc.avatar || userdp}
                    alt={acc.username}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{acc.username}</p>
                    <p className="text-xs text-gray-500 break-all">{acc.uid}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔔 Notification Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenNotifDropdown((prev) => !prev);
              setOpenProfileDropdown(false);
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Bell size={24} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {openNotifDropdown && (
            <div className="absolute right-0 mt-5 w-72 bg-white rounded-xl shadow-lg border p-4 z-50">
              <div className="flex flex-col items-center justify-center text-gray-500 py-6">
                <FileText size={36} className="mb-2 text-gray-400" />
                <p className="text-md font-medium">No notifications yet</p>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Profile Picture of Logged-in User */}
        {currentUser && (
          <div className="relative">
            <img
              src={currentUser.photoURL || userdp}
              alt="My Profile"
              className="w-11 h-11 rounded-full border object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
              onClick={() => {
                setOpenProfileDropdown((prev) => !prev);
                setOpenNotifDropdown(false);
              }}
            />

            {openProfileDropdown && (
              <div className="absolute right-0 mt-5 w-64 bg-white rounded-xl shadow-lg border p-4 z-50">
                <div className="flex flex-col items-center justify-center text-gray-500 py-6">
                  <FileText size={40} className="mb-2 text-gray-400" />
                  <p className="text-lg font-medium">No posts yet</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ FriendDetail Modal */}
      {showModal && selectedUser && (
        <FriendDetail
          user={selectedUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </nav>
  );
};

export default FeedNavbar;
