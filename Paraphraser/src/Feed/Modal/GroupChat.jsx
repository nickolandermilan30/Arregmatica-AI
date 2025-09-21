// src/Feed/Modal/GroupChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaComments, FaSmile } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  get,
  set,
} from "firebase/database";
import { getAuth } from "firebase/auth";

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
  const listRef = useRef(null);

  const db = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen messages
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

  // Check membership
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

  // Listen to accounts for online users
  useEffect(() => {
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOnlineCount(0);
        return;
      }
      const data = snapshot.val();
      let count = 0;
      const now = Date.now();
      Object.values(data).forEach((acc) => {
        if (acc.lastSignIn) {
          const lastSeen = new Date(acc.lastSignIn).getTime();
          // Online if active within 5 minutes
          if (now - lastSeen <= 5 * 60 * 1000) {
            count++;
          }
        }
      });
      setOnlineCount(count);
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

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!currentUser) return alert("Please login to send messages.");

    const msg = {
      senderUid: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email || "User",
      avatar: currentUser.photoURL || "",
      text: input.trim(),
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

  const handleReact = async (msgId, reaction) => {
    if (!currentUser) return;
    const reactionPath = `${GROUP_PATH}/messages/${msgId}/reactions/${currentUser.uid}`;
    const reactionRef = ref(db, reactionPath);
    await set(reactionRef, {
      emoji: reaction,
      avatar: currentUser.photoURL || "",
      name: currentUser.displayName || currentUser.email || "User",
    });
    setActiveReaction(null);
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col relative transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-t-2xl ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full text-lg shadow">
              <FaComments />
            </div>
            <div>
              <h2 className="text-lg font-bold">Arregmatica Community</h2>
              <p className="text-sm opacity-70">
                {onlineCount} {onlineCount === 1 ? "member online" : "members online"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
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
                  darkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-200 text-gray-900"
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
                  // System message
                  if (msg.system) {
                    return (
                      <div
                        key={msg.id}
                        className="flex flex-col items-center text-sm opacity-70"
                      >
                        <p>{msg.text}</p>
                        <div className="w-full border-t border-gray-400/40 my-2"></div>
                      </div>
                    );
                  }

                  const isMe = msg.senderUid === (currentUser && currentUser.uid);
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar */}
                      {!isMe &&
                        (msg.avatar ? (
                          <img
                            src={msg.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : "U"}
                          </div>
                        ))}

                      {/* Bubble & Info */}
                      <div
                        className={`max-w-[70%] flex flex-col relative ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Name */}
                        <span className="text-xs font-semibold mb-1 opacity-70">
                          {msg.senderName || "User"}
                        </span>

                        {/* Bubble */}
                        <div
                          className={`px-4 py-2 rounded-2xl shadow break-words ${
                            isMe
                              ? "bg-green-500 text-white rounded-tr-none"
                              : darkMode
                              ? "bg-gray-800 text-gray-100 rounded-tl-none"
                              : "bg-gray-200 text-gray-900 rounded-tl-none"
                          }`}
                        >
                          {msg.text}

                          {/* Reactions Inside Bubble */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="mt-2 flex gap-1 flex-wrap">
                              {Object.values(msg.reactions).map((r, i) => (
                                <span
                                  key={i}
                                  className="text-sm bg-black/10 px-2 py-1 rounded-full flex items-center gap-1"
                                >
                                  {r.emoji}
                                  {r.avatar ? (
                                    <img
                                      src={r.avatar}
                                      alt="reactor"
                                      className="w-4 h-4 rounded-full"
                                    />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center">
                                      {r.name ? r.name.charAt(0).toUpperCase() : "U"}
                                    </span>
                                  )}
                                </span>
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
                              <span className="text-[10px] opacity-60">
                                {formatTime(msg.timestamp)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] opacity-60">
                                {formatTime(msg.timestamp)}
                              </span>
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

                      {/* Avatar sa kanan pag ako yung sender */}
                      {isMe &&
                        (currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="my-avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                            {currentUser.displayName
                              ? currentUser.displayName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-b-2xl ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
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
                onClick={handleSend}
                disabled={!joined || !input.trim()}
                className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
