// src/Feed/Modal/GroupChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaComments, FaSmile, FaPaperPlane, FaImage } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  get,
  set,
  remove,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";

const GROUP_PATH = "groups/arregmatica";
const reactions = ["👍", "❤️", "😂", "😮", "😢"];

const GroupChat = ({ onClose }) => {
  const { darkMode } = useDarkMode();
  const [joined, setJoined] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [readyPrompt, setReadyPrompt] = useState(true);
  const [activeReaction, setActiveReaction] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  const listRef = useRef(null);
  const db = getDatabase();
  const auth = getAuth();
  const storage = getStorage();

  const openLightbox = (imgs, idx) => {
  setLightboxImages(imgs);
  setCurrentIndex(idx);
  setLightboxOpen(true);
};

const nextImage = () => {
  setCurrentIndex((prev) => (prev + 1) % lightboxImages.length);
};

const prevImage = () => {
  setCurrentIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
};


  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const memberRef = ref(db, `${GROUP_PATH}/members/${user.uid}`);
        const snap = await get(memberRef);
        if (snap.exists()) {
          await update(memberRef, {
            username: user.displayName || user.email || "User",
            avatar: user.photoURL || "",
            lastSeen: Date.now(),
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, [auth, db]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen to messages
  useEffect(() => {
    if (!joined) return;
    const messagesRef = ref(db, `${GROUP_PATH}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const msgs = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(([id, msg]) => {
          msgs.push({ id, ...msg });
        });
        msgs.sort((a, b) => a.timestamp - b.timestamp);
      }
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [joined, db]);

  // Check if user already joined
  useEffect(() => {
    if (!currentUser) return;
    const membersRef = ref(db, `${GROUP_PATH}/members/${currentUser.uid}`);
    get(membersRef).then((snap) => {
      if (snap.exists()) {
        setJoined(true);
        setReadyPrompt(false);
      }
    });
  }, [currentUser, db]);

  // Online users from "scores"
  useEffect(() => {
    const scoresRef = ref(db, "scores");
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOnlineCount(0);
        setOnlineUsers([]);
        return;
      }
      const data = snapshot.val();
      const usersArray = Object.keys(data).map((uid) => ({
        uid,
        fullName: data[uid].fullName || "User",
        avatar: data[uid].avatar || "",
        isOnline: data[uid].isOnline || false,
      }));
      const online = usersArray.filter((u) => u.isOnline);
      setOnlineCount(online.length);
      setOnlineUsers(online);
    });
    return () => unsubscribe();
  }, [db]);

  const handleJoin = async () => {
    if (!currentUser) return alert("Please login to join the group chat.");
    setLoadingJoin(true);
    try {
      const memberRef = ref(db, `${GROUP_PATH}/members/${currentUser.uid}`);
      const memberData = {
        email: currentUser.email || "",
        username: currentUser.displayName || currentUser.email || "User",
        avatar: currentUser.photoURL || "",
        createdAt: Date.now(),
        lastSeen: Date.now(),
      };
      await set(memberRef, memberData);

      const messagesRef = ref(db, `${GROUP_PATH}/messages`);
      const joinMessage = {
        senderUid: currentUser.uid,
        senderName: memberData.username,
        avatar: memberData.avatar,
        text: `${memberData.username} joined the Arregmatica Community.`,
        timestamp: Date.now(),
        system: true,
      };
      await push(messagesRef, joinMessage);

      setJoined(true);
      setReadyPrompt(false);
    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to join. Try again.");
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleSend = async (imageUrls = []) => {
    if (!input.trim() && imageUrls.length === 0) return;
    if (!currentUser) return alert("Please login to send messages.");

    const msg = {
      senderUid: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email || "User",
      avatar: currentUser.photoURL || "",
      text: input.trim(),
      images: imageUrls, // array of uploaded image URLs
      timestamp: Date.now(),
      reactions: {},
      system: false,
    };

    try {
      const messagesRef = ref(db, `${GROUP_PATH}/messages`);
      await push(messagesRef, msg);

      const memberRef = ref(db, `${GROUP_PATH}/members/${currentUser.uid}`);
      await update(memberRef, { lastSeen: Date.now() });

      setInput("");
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message.");
    }
  };

  const handleImageUpload = async (e) => {
    if (!currentUser) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = [];
      for (let file of files) {
        const fileRef = sRef(storage, `messages/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }
      await handleSend(urls);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  // Toggle reaction with proper group counting
  const handleReact = async (msgId, reaction) => {
    if (!currentUser) return;
    const reactionRef = ref(db, `${GROUP_PATH}/messages/${msgId}/reactions/${currentUser.uid}`);
    const snap = await get(reactionRef);

    if (snap.exists() && snap.val().emoji === reaction) {
      await remove(reactionRef); // Remove if clicked again
    } else {
      await set(reactionRef, {
        emoji: reaction,
        avatar: currentUser.photoURL || "",
        name: currentUser.displayName || currentUser.email || "User",
      });
    }
    setActiveReaction(null);
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Group reactions by emoji
  const groupReactions = (reactionsObj) => {
    const grouped = {};
    if (!reactionsObj) return grouped;
    Object.values(reactionsObj).forEach((r) => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push(r);
    });
    return grouped;
  };

const renderImages = (imgs) => {
  if (!imgs || imgs.length === 0) return null;
  const extra = imgs.length > 4 ? imgs.length - 4 : 0;
  const displayImgs = imgs.slice(0, 4);

  const handleClick = (idx) => openLightbox(imgs, idx);

  if (displayImgs.length === 1) {
    return (
      <img
        src={displayImgs[0]}
        alt="msg-img"
        className="rounded-xl w-11/12 max-h-40 mb-2 object-cover cursor-pointer"
        onClick={() => handleClick(0)}
      />
    );
  } else if (displayImgs.length === 2) {
    return (
      <div className="flex gap-1 mb-2">
        {displayImgs.map((i, idx) => (
          <img
            key={idx}
            src={i}
            alt="msg-img"
            className="w-[48%] max-h-32 rounded-xl object-cover cursor-pointer"
            onClick={() => handleClick(idx)}
          />
        ))}
      </div>
    );
  } else if (displayImgs.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 mb-2">
        <img
          src={displayImgs[0]}
          alt="msg-img"
          className="col-span-2 max-h-32 rounded-xl object-cover cursor-pointer"
          onClick={() => handleClick(0)}
        />
        {displayImgs.slice(1).map((i, idx) => (
          <img
            key={idx}
            src={i}
            alt="msg-img"
            className="max-h-32 rounded-xl object-cover cursor-pointer"
            onClick={() => handleClick(idx + 1)}
          />
        ))}
      </div>
    );
  } else {
  return (
    <div className="grid grid-cols-2 gap-1 mb-2 relative">
      {displayImgs.map((i, idx) => {
        const isLast = idx === displayImgs.length - 1;
        return (
          <div key={idx} className="relative w-full h-full cursor-pointer" onClick={() => openLightbox(imgs, idx)}>
            <img
              src={i}
              alt="msg-img"
              className="max-h-32 rounded-xl object-cover w-full"
            />
            {isLast && extra > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl text-white text-xl font-bold">
                +{extra}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-0">
      <div
  className={`rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col relative transition-colors duration-300 ${
    darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
  }`}
>

        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-lg shadow">
              <FaComments />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Arregmatica Community</h2>
              <p className="text-xs sm:text-sm opacity-70">
                {onlineCount} {onlineCount === 1 ? "member online" : "members online"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors text-lg ${
              darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Ready Prompt */}
        {readyPrompt ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h3 className="text-2xl font-semibold mb-3">Are you ready to join us?</h3>
            <p className="text-sm opacity-75 mb-6 text-center">
              Join the Arregmatica Community to chat with members, share tips and stay updated.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleJoin}
                disabled={loadingJoin}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-60"
              >
                {loadingJoin ? "Joining..." : "Join Us"}
              </button>
              <button
                onClick={() => setReadyPrompt(false)}
                className={`px-6 py-3 rounded-xl transition ${
                  darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"
                }`}
              >
                Maybe later
              </button>
            </div>
            {!currentUser && (
              <p className="mt-6 text-sm text-red-500">
                Please log in to join the group chat.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {messages.length === 0 ? (
                <p className="text-center opacity-60">
                  No messages yet — start the conversation!
                </p>
              ) : (
                messages.map((msg) => {
                  if (msg.system) {
                    return (
                      <div key={msg.id} className="flex flex-col items-center text-sm opacity-70">
                        <p>{msg.text}</p>
                        <div className="w-full border-t border-gray-400/40 my-2"></div>
                      </div>
                    );
                  }

                  const isMe = msg.senderUid === (currentUser && currentUser.uid);
                  const groupedReactions = groupReactions(msg.reactions);

                  return (
                    <div key={msg.id} className={`flex gap-3 items-start ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe &&
                        (msg.avatar ? (
                          <img src={msg.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : "U"}
                          </div>
                        ))}

                      {/* Bubble & Info */}
                      <div className={`max-w-[70%] flex flex-col relative ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs font-semibold mb-1 opacity-70">
                          {msg.senderName || "User"}
                        </span>

                        {/* Bubble */}
                        <div className={`px-4 py-2 rounded-2xl shadow break-words whitespace-pre-wrap max-w-full sm:max-w-[100%] ${
                          isMe
                            ? "bg-green-500 text-white rounded-tr-none"
                            : darkMode
                            ? "bg-gray-800 text-gray-100 rounded-tl-none"
                            : "bg-gray-200 text-gray-900 rounded-tl-none"
                        }`}>
                          {/* Images */}
                          {renderImages(msg.images)}

                          {/* Text */}
                          {msg.text && <p>{msg.text}</p>}

                          {/* Grouped Reactions */}
                          {Object.keys(groupedReactions).length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {Object.entries(groupedReactions).map(([emoji, users], idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-full">
                                  <span>{emoji}</span>
                                  <div className="flex -space-x-1">
                                    {users.slice(0, 3).map((u, i) => (
                                      <img
                                        key={i}
                                        src={u.avatar || ""}
                                        alt={u.name}
                                        className="w-4 h-4 rounded-full border border-white"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] opacity-70">{users.length}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Time + React */}
                        <div className="flex items-center justify-between gap-3 w-full mt-1 relative">
                          {isMe ? (
                            <>
                              <button
                                onClick={() =>
                                  setActiveReaction(activeReaction === msg.id ? null : msg.id)
                                }
                                className="text-gray-500 hover:text-yellow-500 text-sm relative"
                              >
                                <FaSmile />
                                {activeReaction === msg.id && (
                                  <div
                                    className={`absolute bottom-full right-0 mb-2 flex gap-2 p-2 rounded-xl shadow-lg ${
                                      darkMode ? "bg-gray-700" : "bg-white"
                                    }`}
                                  >
                                    {reactions.map((r) => (
                                      <button
                                        key={r}
                                        onClick={() => handleReact(msg.id, r)}
                                        className="text-xl hover:scale-125 transition"
                                      >
                                        {r}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </button>
                              <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
                              <button
                                onClick={() =>
                                  setActiveReaction(activeReaction === msg.id ? null : msg.id)
                                }
                                className="text-gray-500 hover:text-yellow-500 text-sm relative"
                              >
                                <FaSmile />
                                {activeReaction === msg.id && (
                                  <div
                                    className={`absolute bottom-full left-0 mb-2 flex gap-2 p-2 rounded-xl shadow-lg ${
                                      darkMode ? "bg-gray-700" : "bg-white"
                                    }`}
                                  >
                                    {reactions.map((r) => (

                                                                          <button
                                        key={r}
                                        onClick={() => handleReact(msg.id, r)}
                                        className="text-xl hover:scale-125 transition"
                                      >
                                        {r}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isMe &&
                        (currentUser.photoURL ? (
                          <img src={currentUser.photoURL} alt="my-avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "U"}
                          </div>
                        ))}
                    </div>
                  );
                })
              )}
            </div>

            {lightboxOpen && (
  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
    <button
      onClick={() => setLightboxOpen(false)}
      className="absolute top-5 right-5 text-white text-3xl"
    >
      ✕
    </button>

    <button
      onClick={prevImage}
      className="absolute left-5 text-white text-3xl"
    >
      ‹
    </button>

    <img
      src={lightboxImages[currentIndex]}
      alt="lightbox"
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
    />

    <button
      onClick={nextImage}
      className="absolute right-5 text-white text-3xl"
    >
      ›
    </button>
  </div>
)}


            {/* Input */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-b-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {/* Image upload button */}
              <label className="cursor-pointer text-gray-500 hover:text-green-500">
                <FaImage size={22} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={!joined || uploading}
                />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={joined ? "Type a message..." : "Join to start messaging..."}
                className={`flex-1 px-4 py-2 rounded-xl border outline-none transition-colors ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={!joined}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={!joined || (!input.trim() && !uploading)}
                className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition disabled:opacity-60"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupChat;

