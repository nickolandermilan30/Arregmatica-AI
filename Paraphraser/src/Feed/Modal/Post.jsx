import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import userdp from "../../assets/userdp.png";

const PostModal = ({ onClose }) => {
  const currentUser = auth.currentUser;

  const [postContent, setPostContent] = useState("");
  const [images, setImages] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(false); // <-- Loading state

  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const db = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const accountsArray = Object.keys(data).map((uid) => ({
          uid,
          ...data[uid],
        }));
        setAccounts(accountsArray);
      }
    });
    return () => unsubscribe();
  }, [db]);

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
    if (!postContent.trim() && images.length === 0) return;

    setLoading(true); // start loading

    try {
      const uploadedImageURLs = [];

      for (const img of images) {
        const imageRef = storageRef(storage, `post/${currentUser.uid}/${Date.now()}_${img.name}`);
        await uploadBytes(imageRef, img);
        const url = await getDownloadURL(imageRef);
        uploadedImageURLs.push(url);
      }

      const hashtagsArray = Array.from(postContent.matchAll(/#[a-zA-Z0-9_]+/g)).map((m) => m[0].substring(1));
      const mentionsArray = Array.from(postContent.matchAll(/@[a-zA-Z0-9_]+/g)).map((m) => m[0].substring(1));

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

      // Reset
      setPostContent("");
      setImages([]);
      onClose();
    } catch (err) {
      console.error("Error posting:", err);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const getHighlightedText = (text) => {
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="text-blue-500">$1</span>');
    const withHashtags = withMentions.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="text-red-500">$1</span>');
    return withHashtags.replace(/\n/g, "<br/>");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-opacity-70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 z-50">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>

        <div className="flex items-center mb-6">
          <img src={currentUser?.photoURL || userdp} alt="profile" className="w-14 h-14 rounded-full border object-cover mr-4" />
          <div>
            <span className="font-semibold text-gray-900 text-lg">{currentUser?.displayName || "Username"}</span>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <div ref={overlayRef} className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none text-lg whitespace-pre-wrap break-words text-black" dangerouslySetInnerHTML={{ __html: getHighlightedText(postContent) }} />
          <textarea
            ref={textareaRef}
            value={postContent}
            onChange={handleChange}
            placeholder="What's on your mind? Use @ to mention friends and # for hashtags"
            className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 text-lg bg-transparent relative"
            rows={6}
          />
          {mentionDropdown && (
            <div className="absolute left-0 mt-1 w-full max-h-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto z-50">
              {filteredAccounts.map((acc) => (
                <div key={acc.uid} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectMention(acc.username)}>
                  <img src={acc.avatar || userdp} 
                  alt={acc.username} 
                  className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-gray-800">{acc.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 flex-shrink-0">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover rounded-lg border" />
                <button onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1 text-sm">&times;</button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="cursor-pointer flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} multiple />
          </label>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition font-medium">Cancel</button>
          <button
            onClick={handlePost}
            className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition font-medium"
          >
            Post
          </button>
        </div>

        {/* Loading modal */}
        {loading && (
          <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-4">
              <p className="text-gray-800 font-medium">Posting...</p>
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
