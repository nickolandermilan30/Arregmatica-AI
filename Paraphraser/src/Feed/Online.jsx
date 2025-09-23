// src/pages/Online.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import userdp from "../assets/userdp.png";
import Notes from "../Feed/Modal/Notes";
import { useDarkMode } from "../Theme/DarkModeContext";

// ✅ Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Online = () => {
  const [accounts, setAccounts] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const auth = getAuth();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const db = getDatabase();
    const accountsRef = ref(db, "accounts");
    const scoresRef = ref(db, "scores");

    let accountsData = {};
    let scoresData = {};

    const updateCombinedData = () => {
      let merged = Object.keys(accountsData).map((uid) => ({
        uid,
        ...accountsData[uid],
        ...(scoresData[uid] || {}),
      }));

      // ✅ Current user always first
      if (auth.currentUser) {
        merged = merged.sort((a, b) =>
          a.uid === auth.currentUser.uid ? -1 : b.uid === auth.currentUser.uid ? 1 : 0
        );
      }

      setAccounts(merged);
    };

    const unsubAccounts = onValue(accountsRef, (snapshot) => {
      accountsData = snapshot.exists() ? snapshot.val() : {};
      updateCombinedData();
    });

    const unsubScores = onValue(scoresRef, (snapshot) => {
      scoresData = snapshot.exists() ? snapshot.val() : {};
      updateCombinedData();
    });

    return () => {
      unsubAccounts();
      unsubScores();
    };
  }, [auth.currentUser]);

  return (
    <div
      className={`w-full transition-colors ${
        darkMode
          ? "bg-transparent text-gray-100"
          : "bg-transparent text-gray-900"
      }`}
    >
      {/* ✅ Title */}
      <h2 className="text-3xl  text-sky-500 font-extrabold  tracking-wide px-4 mt-6">Online Accounts</h2>

      {/* ✅ Swiper Wrapper (with spacing) */}
      <Swiper
        spaceBetween={24}
        slidesPerView={3.2}
        className="mt-6 sm:px-0 px-4 pb-6"
      >
        {accounts.map((acc) => {
          const isCurrentUser = auth.currentUser?.uid === acc.uid;
          const latestNote = acc.notes
            ? Object.values(acc.notes).slice(-1)[0]
            : null;

          return (
            <SwiperSlide key={acc.uid}>
              {/* ✅ Card Container */}
              <div
                className={`shadow-lg rounded-2xl p-6 flex flex-col items-center relative
                  transition-all duration-300
                  ${darkMode ? "bg-gray-800/70 hover:bg-gray-900" : "bg-white"}
                  mx-1 mb-4`} // ✅ added spacing para di dikit
              >
                <div className="relative mt-2">
                  {/* Avatar */}
                  <img
                    src={acc.avatar || userdp}
                    alt={acc.username}
                    className="w-16 h-16 rounded-full border-2 border-sky-500 shadow object-cover"
                  />

                  {/* ✅ Online badge */}
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      acc.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>

                  {/* ✅ Notes bubble */}
                  {latestNote ? (
                    <div
                      onClick={() => isCurrentUser && setShowNotesModal(true)}
                      className={`absolute -top-6 -left-8 
                        text-sm font-semibold rounded-2xl 
                        px-4 py-2 max-w-[140px] cursor-pointer 
                        shadow-md hover:opacity-90 
                        text-center truncate
                        ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                      title={latestNote.text}
                    >
                      {latestNote.text}
                    </div>
                  ) : (
                    isCurrentUser && (
                      <button
                        onClick={() => setShowNotesModal(true)}
                        className="absolute -top-2 -left-2 
                          bg-sky-500 text-white 
                          rounded-full w-8 h-8 flex items-center justify-center 
                          shadow-md hover:bg-sky-600"
                      >
                        +
                      </button>
                    )
                  )}
                </div>

                {/* Username */}
                <p className="text-sm mt-3 text-center font-medium">
                  {acc.username}
                </p>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* ✅ Notes Modal */}
      {showNotesModal && <Notes onClose={() => setShowNotesModal(false)} />}
    </div>
  );
};

export default Online;
