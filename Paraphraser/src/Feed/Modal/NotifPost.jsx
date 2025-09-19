// src/components/NotifPost.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update, push, remove } from "firebase/database";
import { auth } from "../../firebase";
import userdp from "../../assets/userdp.png";
import { X } from "lucide-react";
import { FaHeart, FaComment, FaRetweet } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext";

const NotifPost = ({ notif, onClose }) => {
  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [newComment, setNewComment] = useState("");
  const db = getDatabase();
  const currentUser = auth.currentUser;
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!notif) return;

    const postRef = ref(db, `accounts/${notif.ownerUid}/posts/${notif.postId}`);
    const ownerRef = ref(db, `accounts/${notif.ownerUid}`);

    const unsubPost = onValue(postRef, (snap) => {
      if (snap.exists()) setPost({ postId: notif.postId, uid: notif.ownerUid, ...snap.val() });
      else setPost(null);
    });

    const unsubOwner = onValue(ownerRef, (snap) => {
      if (snap.exists()) setOwner({ uid: notif.ownerUid, ...snap.val() });
      else setOwner(null);
    });

    return () => {
      unsubPost();
      unsubOwner();
    };
  }, [notif, db]);

  const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : "";

  const renderContent = (text) => {
    if (!text) return null;
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(/(@[a-zA-Z0-9_]+)/g, `<span class="text-blue-500 font-medium">$1</span>`);
    const withHashtags = withMentions.replace(/(#[a-zA-Z0-9_]+)/g, `<span class="text-pink-500 font-medium">$1</span>`);
    return (
      <div
        className={`${darkMode ? "text-gray-100" : "text-gray-800"} leading-relaxed text-base`}
        dangerouslySetInnerHTML={{ __html: withHashtags }}
      />
    );
  };

  const handleLike = async () => {
    if (!currentUser || !post) return;
    const postPath = `accounts/${post.uid}/posts/${post.postId}`;
    const alreadyLiked = post.likedBy?.[currentUser.uid];

    await update(ref(db, postPath), {
      [`likedBy/${currentUser.uid}`]: alreadyLiked ? null : true,
      likeCount: alreadyLiked ? Math.max((post.likeCount || 0) - 1, 0) : (post.likeCount || 0) + 1,
    });
  };

  const handleRepost = async () => {
    if (!currentUser || !post) return;
    const postPath = `accounts/${post.uid}/posts/${post.postId}`;
    const alreadyReposted = post.repostedBy?.[currentUser.uid];

    await update(ref(db, postPath), {
      [`repostedBy/${currentUser.uid}`]: alreadyReposted ? null : true,
      repostCount: alreadyReposted ? Math.max((post.repostCount || 0) - 1, 0) : (post.repostCount || 0) + 1,
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !post) return;

    const commentsRef = ref(db, `accounts/${post.uid}/posts/${post.postId}/comments`);
    await push(commentsRef, {
      username: currentUser.displayName || currentUser.email,
      avatar: currentUser.photoURL || userdp,
      uid: currentUser.uid,
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
    });

    setNewComment("");
  };

  const handleDeleteComment = async (commentId, commentUid) => {
    if (!currentUser || commentUid !== currentUser.uid) return;
    const commentRef = ref(db, `accounts/${post.uid}/posts/${post.postId}/comments/${commentId}`);
    await remove(commentRef);
  };

  if (!post) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-lg p-6 shadow-lg`}>
          <p>Post not found or has been removed.</p>
          <button
            onClick={onClose}
            className={`${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} mt-4 px-4 py-2 rounded-lg transition`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"} relative rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden z-70`}>
        {/* Header */}
        <div className={`${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between p-4 border-b`}>
          <div className="flex items-center gap-3">
            <img
              src={notif.from?.avatar || owner?.avatar || userdp}
              alt={notif.from?.username || "User"}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <p className="font-semibold">{notif.from?.username || owner?.username || "Someone"}</p>
              <p className="text-xs text-gray-400">{notif.from?.email || owner?.email || ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">{formatTimestamp(notif.timestamp)}</p>
            <button
              onClick={onClose}
              className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} p-2 rounded-full transition`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className={`${darkMode ? "bg-gray-800" : "bg-gray-50"} rounded-xl p-4 shadow-sm`}>
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.avatar || owner?.avatar || userdp}
                alt={post.username || "Author"}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold">{post.username || owner?.username || "Author"}</p>
                <p className="text-xs text-gray-400">{formatTimestamp(post.timestamp)}</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-3">{renderContent(post.content)}</div>

            {/* Images */}
            {post.imageURLs?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {post.imageURLs.slice(0, 4).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`img-${i}`}
                    className="w-full h-44 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 ${post.likedBy?.[currentUser?.uid] ? "text-red-500" : "hover:text-red-400"}`}
              >
                <FaHeart />
                <span>{post.likeCount || 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <FaComment />
                <span>{Object.keys(post.comments || {}).length}</span>
              </div>
              <button
                onClick={handleRepost}
                className={`flex items-center gap-2 ${post.repostedBy?.[currentUser?.uid] ? "text-green-500" : "hover:text-green-400"}`}
              >
                <FaRetweet />
                <span>{post.repostCount || 0}</span>
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold mb-3">{darkMode ? "" : ""} Comments</h3>
            {post.comments && Object.keys(post.comments).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(post.comments)
                  .sort(([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(([cid, comment]) => (
                    <div
                      key={cid}
                      className={`${darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800"} flex items-start gap-3 p-3 rounded-lg border shadow-sm`}
                    >
                      <img
                        src={comment.avatar || userdp}
                        alt={comment.username || "User"}
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{comment.username || "User"}</p>
                          <p className="text-xs text-gray-400">{formatTimestamp(comment.timestamp)}</p>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                      {comment.uid === currentUser?.uid && (
                        <button
                          onClick={() => handleDeleteComment(cid, comment.uid)}
                          className="text-red-500 text-xs font-bold hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>No comments yet.</p>
            )}

            {/* Add Comment */}
            <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2 items-center">
              <img
                src={currentUser?.photoURL || userdp}
                alt="me"
                className="w-9 h-9 rounded-full object-cover border"
              />
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600 placeholder-gray-400 focus:ring-blue-500" : "bg-white text-gray-800 border-gray-300 placeholder-gray-500 focus:ring-blue-500"} flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2`}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className={`${darkMode ? "border-t border-gray-700" : "border-t border-gray-200"} p-4 flex items-center justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`${darkMode ? "bg-gray-700 text-gray-100 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} px-4 py-2 rounded-lg transition`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotifPost;
