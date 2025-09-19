import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import userdp from "../../assets/userdp.png";
import { useDarkMode } from "../../Theme/DarkModeContext";

const Comments = ({ post, currentUser, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const db = getDatabase();
  const { darkMode } = useDarkMode(); // ✅ get dark mode state

  useEffect(() => {
    if (!post?.uid || !post?.postId) return;

    const commentsRef = ref(db, `accounts/${post.uid}/posts/${post.postId}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const commentsArray = Object.entries(data).map(([id, comment]) => ({ id, ...comment }));
      commentsArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, [db, post]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    const commentsRef = ref(db, `accounts/${post.uid}/posts/${post.postId}/comments`);
    push(commentsRef, {
      username: currentUser.displayName || currentUser.email,
      avatar: currentUser.photoURL || userdp,
      uid: currentUser.uid,
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
    });

    setNewComment("");
  };

  const handleDeleteComment = (commentId, commentUid) => {
    if (commentUid !== currentUser.uid) return;
    const commentRef = ref(db, `accounts/${post.uid}/posts/${post.postId}/comments/${commentId}`);
    remove(commentRef);
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 p-4 backdrop-blur-sm ${
        darkMode ? "bg-gray-900/60" : "bg-white/30"
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-xl shadow-lg p-4 flex flex-col max-h-[80vh] overflow-y-auto transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          <button
            onClick={onClose}
            className={`font-bold text-xl transition-colors duration-300 ${
              darkMode ? "text-gray-200 hover:text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            &times;
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 relative">
                <img
                  src={comment.avatar || userdp}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{comment.username}</p>
                  <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                    {comment.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
                {comment.uid === currentUser.uid && (
                  <button
                    onClick={() => handleDeleteComment(comment.id, comment.uid)}
                    className="text-red-500 text-sm font-bold ml-2 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={`flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 transition-colors duration-300 ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-blue-400"
                : "border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:ring-blue-500"
            }`}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Comments;
