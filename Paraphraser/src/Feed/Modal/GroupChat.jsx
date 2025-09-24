// src/Feed/Modal/GroupChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaComments, FaSmile, FaPaperPlane, FaImage, FaEllipsisV } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext";
import {
  getDatabase, ref, push, onValue, update, get, set, remove,
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

  // bago: for reply
  const [replyTo, setReplyTo] = useState(null);
  // bago: active menu
  const [menuOpen, setMenuOpen] = useState(null);

  const listRef = useRef(null);
  const db = getDatabase(), auth = getAuth(), storage = getStorage();

  const formatTime = ts => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const groupReactions = obj => Object.values(obj || {}).reduce((a, r) => ((a[r.emoji] = [...(a[r.emoji] || []), r]), a), {});
  const openLightbox = (imgs, idx) => { setLightboxImages(imgs); setCurrentIndex(idx); setLightboxOpen(true); };
  const nextImage = () => setCurrentIndex(i => (i + 1) % lightboxImages.length);
  const prevImage = () => setCurrentIndex(i => (i - 1 + lightboxImages.length) % lightboxImages.length);

  // Auth
  useEffect(() => onAuthStateChanged(auth, async u => {
    if (!u) return setCurrentUser(null);
    setCurrentUser(u);
    const mRef = ref(db, `${GROUP_PATH}/members/${u.uid}`), snap = await get(mRef);
    snap.exists() && update(mRef, {
      username: u.displayName || u.email || "User", avatar: u.photoURL || "", lastSeen: Date.now(),
    });
  }), [auth, db]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  // Messages
  useEffect(() => {
    if (!joined) return;
    const unsub = onValue(ref(db, `${GROUP_PATH}/messages`), snap => {
      const msgs = snap.exists() ? Object.entries(snap.val()).map(([id, m]) => ({ id, ...m }))
        .sort((a, b) => a.timestamp - b.timestamp) : [];
      setMessages(msgs);
    });
    return () => unsub();
  }, [joined, db]);

  // Check joined
  useEffect(() => { currentUser && get(ref(db, `${GROUP_PATH}/members/${currentUser.uid}`))
    .then(snap => snap.exists() && (setJoined(true), setReadyPrompt(false))); }, [currentUser, db]);

  // Online users
  useEffect(() => {
    const unsub = onValue(ref(db, "scores"), snap => {
      if (!snap.exists()) return setOnlineCount(0), setOnlineUsers([]);
      const users = Object.entries(snap.val()).map(([uid, d]) => ({
        uid, fullName: d.fullName || "User", avatar: d.avatar || "", isOnline: d.isOnline || false,
      }));
      const online = users.filter(u => u.isOnline);
      setOnlineCount(online.length); setOnlineUsers(online);
    });
    return () => unsub();
  }, [db]);

  const handleJoin = async () => {
    if (!currentUser) return alert("Please login to join the group chat.");
    setLoadingJoin(true);
    try {
      const mRef = ref(db, `${GROUP_PATH}/members/${currentUser.uid}`), member = {
        email: currentUser.email || "", username: currentUser.displayName || currentUser.email || "User",
        avatar: currentUser.photoURL || "", createdAt: Date.now(), lastSeen: Date.now(),
      };
      await set(mRef, member);
      await push(ref(db, `${GROUP_PATH}/messages`), {
        senderUid: currentUser.uid, senderName: member.username, avatar: member.avatar,
        text: `${member.username} joined the Arregmatica Community.`, timestamp: Date.now(), system: true,
      });
      setJoined(true); setReadyPrompt(false);
    } catch (e) { console.error(e); alert("Failed to join. Try again."); }
    finally { setLoadingJoin(false); }
  };

  const handleSend = async (urls = []) => {
    if (!input.trim() && !urls.length) return;
    if (!currentUser) return alert("Please login to send messages.");
    const msg = {
      senderUid: currentUser.uid, senderName: currentUser.displayName || currentUser.email || "User",
      avatar: currentUser.photoURL || "", text: input.trim(), images: urls, timestamp: Date.now(),
      reactions: {}, system: false,
      replyTo: replyTo || null,
    };
    try {
      await push(ref(db, `${GROUP_PATH}/messages`), msg);
      await update(ref(db, `${GROUP_PATH}/members/${currentUser.uid}`), { lastSeen: Date.now() });
      setInput(""); setReplyTo(null);
    } catch (e) { console.error(e); alert("Failed to send message."); }
  };

  const handleImageUpload = async e => {
    if (!currentUser) return;
    const files = [...e.target.files]; if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(async f => {
        const r = sRef(storage, `messages/${Date.now()}_${f.name}`); await uploadBytes(r, f);
        return getDownloadURL(r);
      }));
      await handleSend(urls);
    } catch (e) { console.error(e); alert("Failed to upload image."); }
    finally { setUploading(false); e.target.value = null; }
  };

  const handleReact = async (id, r) => {
    if (!currentUser) return;
    const rRef = ref(db, `${GROUP_PATH}/messages/${id}/reactions/${currentUser.uid}`);
    const snap = await get(rRef);
    snap.exists() && snap.val().emoji === r ? remove(rRef) : set(rRef, {
      emoji: r, avatar: currentUser.photoURL || "", name: currentUser.displayName || currentUser.email || "User",
    });
    setActiveReaction(null);
  };

  const handleDelete = async id => {
    if (!currentUser) return;
    try { await remove(ref(db, `${GROUP_PATH}/messages/${id}`)); }
    catch (e) { console.error(e); alert("Failed to delete."); }
  };

  const renderImages = imgs => {
    if (!imgs?.length) return null;
    const extra = imgs.length > 4 ? imgs.length - 4 : 0, show = imgs.slice(0, 4);
    const click = i => openLightbox(imgs, i);
    if (show.length === 1) return <img src={show[0]} 
    onClick={() => click(0)} className="rounded-xl w-11/12 max-h-40 mb-2 object-cover cursor-pointer" />;
    if (show.length === 2) return <div className="flex gap-1 mb-2">{show.map((s, i) =>
      <img key={i} src={s} 
      onClick={() => click(i)} className="w-[48%] max-h-32 rounded-xl object-cover cursor-pointer" />)}</div>;
    if (show.length === 3) return (
      <div className="grid grid-cols-2 gap-1 mb-2">
        <img src={show[0]} 
        onClick={() => click(0)} className="col-span-2 max-h-32 rounded-xl object-cover cursor-pointer" />
        {show.slice(1).map((s, i) => <img key={i} src={s} 
        onClick={() => click(i + 1)} className="max-h-32 rounded-xl object-cover cursor-pointer" />)}
      </div>
    );
    return <div className="grid grid-cols-2 gap-1 mb-2 relative">
      {show.map((s, i) => <div key={i} className="relative cursor-pointer" onClick={() => click(i)}>
        <img src={s} 
        className="max-h-32 rounded-xl object-cover w-full" />
        {i === show.length - 1 && extra > 0 &&
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl text-white text-xl font-bold">+{extra}</div>}
      </div>)}
    </div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-0">
      <div className={`rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col transition-colors ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full shadow"><FaComments /></div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Arregmatica Community</h2>
              <p className="text-xs sm:text-sm opacity-70">{onlineCount} {onlineCount === 1 ? "member" : "members"} online</p>
            </div>
          </div>
          <button onClick={onClose} className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"} text-lg`}>✕</button>
        </div>

        {/* Prompt */}
        {readyPrompt ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h3 className="text-2xl font-semibold mb-3">Are you ready to join us?</h3>
            <p className="text-sm opacity-75 mb-6 text-center">Join the Arregmatica Community to chat with members, share tips and stay updated.</p>
            <div className="flex items-center gap-4">
              <button onClick={handleJoin} disabled={loadingJoin} className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-60">{loadingJoin ? "Joining..." : "Join Us"}</button>
              <button onClick={() => setReadyPrompt(false)} className={`px-6 py-3 rounded-xl ${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-900"}`}>Maybe later</button>
            </div>
            {!currentUser && <p className="mt-6 text-sm text-red-500">Please log in to join the group chat.</p>}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 relative">

              {messages.length === 0 ? <p className="text-center opacity-60">No messages yet — start the conversation!</p> : messages.map(msg => {
                if (msg.system) return <div key={msg.id} className="flex flex-col items-center text-sm opacity-70"><p>{msg.text}</p><div className="w-full border-t border-gray-400/40 my-2"></div></div>;
                const isMe = msg.senderUid === currentUser?.uid, grouped = groupReactions(msg.reactions);
                return (
                  <div key={msg.id} className={`flex gap-3 items-start ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (msg.avatar ? <img src={msg.avatar}
                     className="w-10 h-10 rounded-full object-cover" /> :
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">{msg.senderName?.[0]?.toUpperCase() || "U"}</div>)}
                    <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-xs font-semibold mb-1 opacity-70">{msg.senderName || "User"}</span>
                      <div className={`px-4 py-2 rounded-2xl shadow break-words whitespace-pre-wrap max-w-full sm:max-w-[100%]  ${isMe ? "bg-green-500 text-white rounded-tr-none" : darkMode ? "bg-gray-800 text-gray-100 rounded-tl-none" : "bg-gray-200 text-gray-900 rounded-tl-none"}`}>
                        {renderImages(msg.images)}{msg.text && <p>{msg.text}</p>}
                        {/* Reply preview */}
                        {msg.replyTo && <div className="text-xs opacity-70 border-l-2 pl-2 mt-1">{msg.replyTo.text}</div>}
                        {/* Reactions */}
                        {Object.keys(grouped).length > 0 && <div className="mt-2 flex gap-2 flex-wrap">
                          {Object.entries(grouped).map(([emo, us], i) =>
                            <div key={i} className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-full">
                              <span>{emo}</span>
                              <div className="flex -space-x-1">{us.slice(0, 3).map((u, j) =>
                                <img key={j} src={u.avatar} 
                                className="w-4 h-4 rounded-full border border-white" />)}</div>
                              <span className="text-[10px] opacity-70">{us.length}</span>
                            </div>)}
                        </div>}
                      </div>
                      <div className="flex items-center justify-between gap-3 w-full mt-1 relative">
  {isMe ? (
    <>
      <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveReaction(activeReaction === msg.id ? null : msg.id)} className="text-gray-500 hover:text-yellow-500 text-sm relative">
          <FaSmile />
          {activeReaction === msg.id && (
            <div className={`absolute bottom-full right-0 mb-2 flex gap-2 p-2 rounded-xl shadow-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
              {reactions.map(r => (
                <button key={r} onClick={() => handleReact(msg.id, r)} className="text-xl hover:scale-125">{r}</button>
              ))}
            </div>
          )}
        </button>
        <button onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm relative">
          <FaEllipsisV />
          {menuOpen === msg.id && (
            <div className={`absolute z-[9999] top-full right-0 mt-2 shadow-lg rounded-lg p-2 text-sm ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}>
              <button onClick={() => { setReplyTo({ id: msg.id, text: msg.text || "[image]" }); setMenuOpen(null); }} className="block w-full text-left px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600">Reply</button>
              {isMe && <button onClick={() => { handleDelete(msg.id); setMenuOpen(null); }} className="block w-full text-left px-2 py-1 hover:bg-red-500 hover:text-white">Delete</button>}
            </div>
          )}
        </button>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm relative">
          <FaEllipsisV />
          {menuOpen === msg.id && (
            <div className={`absolute top-full left-0 mt-2 shadow-lg rounded-lg p-2 text-sm ${darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"}`}>
              <button onClick={() => { setReplyTo({ id: msg.id, text: msg.text || "[image]" }); setMenuOpen(null); }} className="block w-full text-left px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600">Reply</button>
              {isMe && <button onClick={() => { handleDelete(msg.id); setMenuOpen(null); }} className="block w-full text-left px-2 py-1 hover:bg-red-500 hover:text-white">Delete</button>}
            </div>
          )}
        </button>
        <button onClick={() => setActiveReaction(activeReaction === msg.id ? null : msg.id)} className="text-gray-500 hover:text-yellow-500 text-sm relative">
          <FaSmile />
          {activeReaction === msg.id && (
            <div className={`absolute bottom-full left-0 mb-2 flex gap-2 p-2 rounded-xl shadow-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
              {reactions.map(r => (
                <button key={r} onClick={() => handleReact(msg.id, r)} className="text-xl hover:scale-125">{r}</button>
              ))}
            </div>
          )}
        </button>
      </div>
      <span className="text-[10px] opacity-60">{formatTime(msg.timestamp)}</span>
    </>
  )}
</div>

                    </div>
                    {isMe && (currentUser.photoURL ? <img src={currentUser.photoURL} 
                    className="w-10 h-10 rounded-full object-cover" /> :
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">{currentUser.displayName?.[0]?.toUpperCase() || "U"}</div>)}
                  </div>
                );
              })}
            </div>

            {/* Lightbox */}
            {lightboxOpen && <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
              <button onClick={() => setLightboxOpen(false)} className="absolute top-5 right-5 text-white text-3xl">✕</button>
              <button onClick={prevImage} className="absolute left-5 text-white text-3xl">‹</button>
              <img src={lightboxImages[currentIndex]}
               className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
              <button onClick={nextImage} className="absolute right-5 text-white text-3xl">›</button>
            </div>}

            {/* Input */}
            {replyTo && <div className="px-6 py-2 text-sm border-t border-gray-400/30 flex justify-between items-center">
              <span>Replying to: {replyTo.text}</span>
              <button onClick={() => setReplyTo(null)} className="text-red-500">✕</button>
            </div>}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-b-2xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <label className="cursor-pointer text-gray-500 hover:text-green-500">
                <FaImage size={22} />
                <input type="file" accept="image/*" 
                multiple className="hidden" onChange={handleImageUpload} disabled={!joined || uploading} />
              </label>
              <input value={input}
               onChange={e => setInput(e.target.value)} placeholder={joined ? "Type a message..." : "Join to start messaging..."} disabled={!joined}
                onKeyDown={e => e.key === "Enter" && handleSend()} className={`flex-1 px-4 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`} />
              <button onClick={() => handleSend()} disabled={!joined || (!input.trim() && !uploading)} className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-60"><FaPaperPlane /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default GroupChat;
