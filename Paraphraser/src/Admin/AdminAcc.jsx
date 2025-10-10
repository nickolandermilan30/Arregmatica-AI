// src/Home/AdminAcc.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Trash2,
  Slash,
  XCircle,
  Hash,
} from "lucide-react";
import { useDarkMode } from "../Theme/DarkModeContext";

const AdminAcc = () => {
  const [admins, setAdmins] = useState({});
  const [expanded, setExpanded] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState(""); // restrict/unrestrict
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const db = getDatabase();
    const adminRef = ref(db, "admin/account1"); // ✅ tama na ito

    onValue(adminRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setAdmins(data);
    });
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteClick = (id) => {
    setSelectedAdmin(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    const db = getDatabase();
    const adminRef = ref(db, `admin/account1/${selectedAdmin}`);
    await set(adminRef, null);

    setInfoMessage("Admin account deleted.");
    setShowInfoModal(true);

    setShowDeleteModal(false);
    setSelectedAdmin(null);
  };

  const handleRestrictToggle = (id, currentlyRestricted) => {
    setSelectedAdmin(id);
    setActionType(currentlyRestricted ? "unrestrict" : "restrict");
    setShowRestrictModal(true);
  };

  const confirmRestrictToggle = async () => {
    if (!selectedAdmin) return;
    const db = getDatabase();
    const restrictedRef = ref(
      db,
      `admin/account1/${selectedAdmin}/restricted`
    );
    await set(restrictedRef, actionType === "restrict");

    setInfoMessage(
      `Admin ${actionType === "restrict" ? "restricted" : "unrestricted"}.`
    );
    setShowInfoModal(true);

    setShowRestrictModal(false);
    setSelectedAdmin(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-sky-500">
        Admin Accounts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {Object.entries(admins).map(([id, admin]) => (
          <div
            key={id}
            className={`relative rounded-2xl shadow-md p-4 flex flex-col transition hover:shadow-lg border
              ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-800 border-gray-200"}`}
          >
            {/* Restricted indicator */}
            {admin.restricted && (
              <span
                className="absolute top-3 left-3 text-red-500"
                title="Restricted"
              >
                <XCircle size={20} />
              </span>
            )}

            <div className="flex flex-col items-center">
              <img
                src={admin.avatarURL}
                alt={admin.username}
                className="w-20 h-20 rounded-full border-2 border-sky-500 object-cover"
              />
              <h2 className="mt-3 text-lg font-semibold">{admin.username}</h2>

              {/* Expand/Collapse */}
              <button
                onClick={() => toggleExpand(id)}
                className="mt-3 flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
              >
                {expanded[id] ? (
                  <>
                    Hide Details <ChevronUp className="ml-1 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="ml-1 w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => handleDeleteClick(id)}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                onClick={() =>
                  handleRestrictToggle(id, admin.restricted || false)
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                  admin.restricted
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <Slash size={16} />{" "}
                {admin.restricted ? "Unrestrict" : "Restrict"}
              </button>
            </div>

            {/* Details */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out
                ${expanded[id] ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
            >
              <div
                className={`border-t pt-3 text-sm rounded-lg p-3 ${
                  darkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-500" /> {admin.email}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-sky-500" /> Created:{" "}
                  {new Date(admin.createdAt).toLocaleString()}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Hash className="w-4 h-4 text-sky-500" /> <strong>ID:</strong>{" "}
                  {id}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this admin account?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  darkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict/Unrestrict modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">
              {actionType === "restrict"
                ? "Confirm Restrict"
                : "Confirm Unrestrict"}
            </h2>
            <p className="mb-6">
              Are you sure you want to{" "}
              {actionType === "restrict" ? "restrict" : "unrestrict"} this
              admin?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRestrictToggle}
                className={`${
                  actionType === "restrict"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-lg transition`}
              >
                Yes,{" "}
                {actionType === "restrict" ? "Restrict" : "Unrestrict"}
              </button>
              <button
                onClick={() => setShowRestrictModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  darkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info modal */}
      {showInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
          <div
            className={`rounded-2xl shadow-xl p-6 w-80 text-center transition-colors ${
              darkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-800"
            }`}
          >
            <p className="mb-6">{infoMessage}</p>
            <button
              onClick={() => setShowInfoModal(false)}
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

export default AdminAcc;
