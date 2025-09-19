import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import userdp from "../../assets/userdp.png";
import Comments from "./Comments"; // reuse Comments modal
import { FaHeart, FaRegHeart, FaComment, FaRetweet } from "react-icons/fa";
import { useDarkMode } from "../../Theme/DarkModeContext"; // ✅ import dark mode context
import "./FriendDetail.css"; // hide-scrollbar CSS

const FriendDetail = ({ user, onClose }) => {
  const [posts, setPosts] = useState([]);
  const [userInteractions, setUserInteractions] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const db = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { darkMode } = useDarkMode(); // ✅ get dark mode state

  useEffect(() => {
    if (!user?.uid) return;

    const postsRef = ref(db, `accounts/${user.uid}/posts`);
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const postsArray = Object.entries(data).map(([id, post]) => ({
        postId: id,
        uid: user.uid, // attach owner uid for comments
        ...post,
      }));
      postsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPosts(postsArray);

      // Track likes/reposts
      const interactions = {};
      postsArray.forEach((post, idx) => {
        interactions[idx] = {
          liked: post.likedBy?.[currentUser?.uid] || false,
          reposted: post.repostedBy?.[currentUser?.uid] || false,
        };
      });
      setUserInteractions(interactions);
    });

    return () => unsubscribe();
  }, [db, user?.uid, currentUser?.uid]);

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString();

  const renderContent = (text) => {
    if (!text) return null;
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(
      /(@[a-zA-Z0-9_]+)/g,
      '<span class="text-blue-500">$1</span>'
    );
    const withHashtags = withMentions.replace(
      /(#[a-zA-Z0-9_]+)/g,
      '<span class="text-red-500">$1</span>'
    );
    return <span dangerouslySetInnerHTML={{ __html: withHashtags }} />;
  };

  const renderImages = (images) => {
    if (!images) return null;
    const urls = Object.values(images);

    if (urls.length === 1)
      return (
        <img
          src={urls[0]}
          alt="post"
          className="w-full h-80 object-cover rounded-lg mt-2"
        />
      );

    if (urls.length === 2)
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {urls.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="post"
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      );

    if (urls.length === 3)
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-2">
          <img
            src={urls[0]}
            alt="post"
            className="col-span-2 h-48 w-full object-cover rounded-lg"
          />
          <img
            src={urls[1]}
            alt="post"
            className="h-48 w-full object-cover rounded-lg"
          />
          <img
            src={urls[2]}
            alt="post"
            className="h-48 w-full object-cover rounded-lg"
          />
        </div>
      );

    const firstFour = urls.slice(0, 4);
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-2">
        {firstFour.map((img, i) => (
          <div key={i} className="relative">
            <img
              src={img}
              alt="post"
              className="h-48 w-full object-cover rounded-lg"
            />
            {i === 3 && urls.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xl font-bold rounded-lg">
                +{urls.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleLike = (index) => {
    if (!currentUser) return;
    const post = posts[index];
    const liked = !userInteractions[index]?.liked;
    const postRef = ref(db, `accounts/${user.uid}/posts/${post.postId}`);
    const updates = {};

    if (liked) {
      updates[`likedBy/${currentUser.uid}`] = {
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        avatar: currentUser.photoURL || userdp,
      };
      updates[`likeCount`] = (post.likeCount || 0) + 1;
    } else {
      updates[`likedBy/${currentUser.uid}`] = null;
      updates[`likeCount`] = (post.likeCount || 1) - 1;
    }

    update(postRef, updates);
  };

  const toggleRepost = (index) => {
    if (!currentUser) return;
    const post = posts[index];
    const reposted = !userInteractions[index]?.reposted;
    const postRef = ref(db, `accounts/${user.uid}/posts/${post.postId}`);
    const updates = {};

    if (reposted) {
      updates[`repostedBy/${currentUser.uid}`] = {
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        avatar: currentUser.photoURL || userdp,
      };
      updates[`repostCount`] = (post.repostCount || 0) + 1;
    } else {
      updates[`repostedBy/${currentUser.uid}`] = null;
      updates[`repostCount`] = (post.repostCount || 1) - 1;
    }

    update(postRef, updates);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm ${
        darkMode ? "bg-black/60" : "bg-black/50"
      }`}
    >
      <div
        className={`rounded-2xl shadow-xl w-[550px] max-h-[85vh] relative flex flex-col transition-colors duration-300 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-32 hide-scrollbar">
          {/* Cover Section */}
          <div
            className={`w-full h-44 relative rounded-t-2xl ${
              darkMode ? "bg-gray-800" : "bg-[#1DA1F2]"
            }`}
          />

          {/* Profile Header */}
          <div className="flex items-center gap-5 px-6 -mt-14">
            <div className="relative">
              <img
                src={user.avatar || userdp}
                alt={user.username}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
              />
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="mt-14">
              <h2 className="text-2xl font-bold break-words">
                {user.username}
              </h2>
              <p className="text-sm break-words">{user.email}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 shadow-sm ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-800"
                }`}
              >
                <p className="text-xs text-gray-400">UID</p>
                <p className="font-semibold break-words">{user.uid}</p>
              </div>
              <div
                className={`border rounded-lg p-4 shadow-sm ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-800"
                }`}
              >
                <p className="text-xs text-gray-400">Account Created</p>
                <p className="font-semibold break-words">{user.accountCreated}</p>
              </div>
              <div
                className={`border rounded-lg p-4 shadow-sm col-span-2 ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-800"
                }`}
              >
                <p className="text-xs text-gray-400">Last Sign In</p>
                <p className="font-semibold break-words">{user.lastSignIn}</p>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="mt-6 px-6">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20 mb-6 text-gray-500">
                <p className="text-lg font-medium">No posts yet</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <div
                  key={post.postId}
                  className={`border rounded-xl p-4 mb-4 shadow-sm transition-colors duration-200 ${
                    darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={user.avatar || userdp}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-2 text-sm">{renderContent(post.content)}</div>

                  {renderImages(post.imageURLs)}

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-2 text-sm">
                    <button
                      onClick={() => toggleLike(index)}
                      className="flex items-center gap-1"
                    >
                      {userInteractions[index]?.liked ? (
                        <FaHeart className="text-red-500 text-lg" />
                      ) : (
                        <FaRegHeart className="text-gray-500 text-lg" />
                      )}
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPost(post)}
                      className={`flex items-center gap-1 transition-colors duration-200 ${
                        darkMode ? "hover:text-blue-400" : "hover:text-blue-500"
                      }`}
                    >
                      <FaComment className="text-gray-500 text-lg" />
                      <span>
                        {post.comments ? Object.keys(post.comments).length : 0}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleRepost(index)}
                      className="flex items-center gap-1"
                    >
                      <FaRetweet
                        className={`${
                          userInteractions[index]?.reposted
                            ? "text-orange-500"
                            : "text-gray-500"
                        } text-lg`}
                      />
                      <span>{post.repostCount || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Close Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-300 ${
            darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg shadow transition-colors duration-200 ${
              darkMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedPost && (
        <Comments
          post={selectedPost}
          currentUser={currentUser}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default FriendDetail;
