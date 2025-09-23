// src/Feed/Modal/Notes.jsx
import React, { useState } from "react";
import { getDatabase, ref, push, remove, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import userdp from "../../assets/userdp.png";

const Notes = ({ onClose }) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getDatabase();
  const charLimit = 60;

  const handleAddNote = async () => {
    if (!note.trim() || note.length > charLimit) return;
    setLoading(true);

    try {
      const notesRef = ref(db, `accounts/${auth.currentUser.uid}/notes`);
      const newNoteRef = push(notesRef);

      const noteData = {
        text: note,
        createdAt: new Date().toISOString(),
      };

      await set(newNoteRef, noteData);

      // Auto-delete after 1 minute
      setTimeout(() => {
        remove(newNoteRef);
      }, 60 * 1000);

      setNote("");
      onClose();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <button onClick={onClose} className="text-sky-400 text-lg font-medium">
          ✕
        </button>
        <h2 className="text-white font-semibold">New note</h2>
        <button
          onClick={handleAddNote}
          disabled={loading || !note.trim()}
          className={`text-sky-400 font-medium ${
            !note.trim() ? "opacity-50" : ""
          }`}
        >
          Share
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Text bubble */}
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value.slice(0, charLimit))
            }
            rows={1}
            placeholder="Share a thought..."
            className="bg-gray-800 text-white rounded-2xl px-4 py-2 w-64 resize-none text-center focus:outline-none"
          />
          {/* small arrow bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
        </div>

        {/* Avatar + counter */}
        <div className="flex flex-col items-center">
          <img
            src={auth.currentUser?.photoURL || userdp}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <p className="text-gray-400 mt-2 text-sm">
            {note.length}/{charLimit}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notes;
