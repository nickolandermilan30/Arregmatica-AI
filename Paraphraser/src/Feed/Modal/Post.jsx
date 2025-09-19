import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import userdp from "../../assets/userdp.png";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaMagic } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext";

const PostModal = ({ onClose }) => {
  const currentUser = auth.currentUser;
  const { darkMode } = useDarkMode(); // ✅ get dark mode state

  const [postContent, setPostContent] = useState("");
  const [images, setImages] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);

  const textareaRef = useRef(null);
  const db = getDatabase();
  const storage = getStorage();
  const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Fetch accounts for mentions
  useEffect(() => {
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const accountsArray = Object.keys(data).map((uid) => ({ uid, ...data[uid] }));
        setAccounts(accountsArray);
      }
    });
    return () => unsubscribe();
  }, [db]);

  // Handle typing and mention detection
  const handleChange = (e) => {
    const value = e.target.value;
    setPostContent(value);

    const cursorPos = e.target.selectionStart;
    const textUpToCursor = value.slice(0, cursorPos);
    const lastAt = textUpToCursor.lastIndexOf("@");

    if (lastAt >= 0) {
      const query = textUpToCursor.slice(lastAt + 1);
      if (query.length > 0) {
        const matches = accounts.filter((acc) =>
          acc.username.toLowerCase().startsWith(query.toLowerCase())
        );
        setFilteredAccounts(matches);
        setMentionQuery(query);
        setMentionDropdown(matches.length > 0);
        return;
      }
    }

    setMentionDropdown(false);
  };

  const handleSelectMention = (username) => {
    const cursorPos = textareaRef.current.selectionStart;
    const textUpToCursor = postContent.slice(0, cursorPos);
    const lastAt = textUpToCursor.lastIndexOf("@");

    const newText =
      textUpToCursor.slice(0, lastAt + 1) + username + " " + postContent.slice(cursorPos);

    setPostContent(newText);
    setMentionDropdown(false);

    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.selectionEnd = lastAt + 1 + username.length + 1;
    }, 0);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray].slice(-5));
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!postContent.trim() && images.length === 0) return; // block empty post
    setLoading(true);

    try {
      const uploadedImageURLs = [];
      for (const img of images) {
        const imageRef = storageRef(
          storage,
          `post/${currentUser.uid}/${Date.now()}_${img.name}`
        );
        await uploadBytes(imageRef, img);
        const url = await getDownloadURL(imageRef);
        uploadedImageURLs.push(url);
      }

      const hashtagsArray = Array.from(postContent.matchAll(/#[a-zA-Z0-9_]+/g)).map((m) =>
        m[0].substring(1)
      );
      const mentionsArray = Array.from(postContent.matchAll(/@[a-zA-Z0-9_]+/g)).map((m) =>
        m[0].substring(1)
      );

      const postObj = {
        content: postContent,
        imageURLs: uploadedImageURLs,
        hashtags: hashtagsArray,
        mentions: mentionsArray,
        timestamp: new Date().toISOString(),
      };

      const postsRef = ref(db, `accounts/${currentUser.uid}/posts`);
      const newPostRef = push(postsRef);
      await set(newPostRef, postObj);

      setPostContent("");
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Error posting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!postContent.trim()) return;
    setImproving(true);
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Improve this post by rewriting it into a longer, more meaningful, and well-written version while keeping the same context:\n"${postContent}"`;
      const result = await model.generateContent(prompt);

      const improved =
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || postContent;

      setPostContent(improved);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setImproving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
        darkMode ? "bg-gray-900/70" : "bg-white/30"
      }`}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl p-8 z-50 transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 font-bold text-2xl transition-colors duration-300 ${
            darkMode ? "text-gray-200 hover:text-white" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          &times;
        </button>

        {/* User Info */}
        <div className="flex items-center mb-6">
          <img
            src={currentUser?.photoURL || userdp}
            alt="profile"
            className="w-14 h-14 rounded-full border object-cover mr-4"
          />
          <div>
            <span className={`font-semibold text-lg ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {currentUser?.displayName || "Username"}
            </span>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
              {currentUser?.email}
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative mb-4">
          <textarea
            ref={textareaRef}
            value={postContent}
            onChange={handleChange}
            placeholder="What's on your mind? Use @ to mention friends and # for hashtags"
            className={`w-full border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition-colors duration-300 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
            rows={6}
          />

          {/* Mentions dropdown */}
          {mentionDropdown && (
            <div
              className={`absolute left-0 mt-1 w-full max-h-48 overflow-y-auto rounded-lg shadow-lg z-50 transition-colors duration-300 ${
                darkMode ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-300"
              }`}
            >
              {filteredAccounts.map((acc) => (
                <div
                  key={acc.uid}
                  className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200 ${
                    darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectMention(acc.username)}
                >
                  <img
                    src={acc.avatar || userdp}
                    alt={acc.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className={darkMode ? "text-gray-100" : "text-gray-800"}>
                    {acc.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images preview */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className={`absolute top-0 right-0 rounded-full p-1 text-sm transition-colors duration-300 ${
                    darkMode ? "bg-gray-600 text-gray-100 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <label
            className={`cursor-pointer flex items-center gap-2 font-medium transition-colors duration-300 ${
              darkMode ? "text-blue-400 hover:text-blue-500" : "text-blue-500 hover:text-blue-600"
            }`}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              multiple
            />
          </label>

          <button
            onClick={handleImprove}
            disabled={improving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition font-medium"
          >
            <FaMagic />
            {improving ? "Improving..." : "Improve Context"}
          </button>
        </div>

        {/* Footer buttons: Cancel left, Post right */}
        <div className="flex justify-between mt-6 gap-4">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl border font-medium transition-colors duration-300 ${
              darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!postContent.trim() && images.length === 0}
            className={`flex-1 px-6 py-2 rounded-xl font-medium transition-colors duration-300 ${
              !postContent.trim() && images.length === 0
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Post
          </button>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl z-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl flex flex-col items-center gap-4">
              <p className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-800"}`}>Posting...</p>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-500 animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostModal;
