// src/pages/Feeds.js
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import FeedNavbar from "./FeedNavbar";
import OnlinePeople from "./Online";
import PostModal from "./Modal/Post";
import ImageLightbox from "./ImageLightbox";
import Comments from "./Modal/Comments";
import GroupChat from "./Modal/GroupChat";
import userdp from "../assets/userdp.png";
import { FaHeart, FaRegHeart, FaComment, FaRetweet, FaStar, FaComments } from "react-icons/fa";
import { useDarkMode } from "../Theme/DarkModeContext";

const Feeds = () => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [posts, setPosts] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [userInteractions, setUserInteractions] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const db = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (!currentUser) return;

    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      const allPosts = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(([uid, account]) => {
          const userPosts = account.posts ? Object.entries(account.posts) : [];
          userPosts.forEach(([postId, post]) => {
            allPosts.push({
              ...post,
              postId,
              username: account.username,
              avatar: account.avatar,
              uid,
              likeCount: post.likeCount || 0,
              repostCount: post.repostCount || 0,
              likedBy: post.likedBy || {},
              repostedBy: post.repostedBy || {},
              comments: post.comments || {},
            });
          });
        });

        allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts(allPosts);

        const interactions = {};
        allPosts.forEach((post, idx) => {
          interactions[idx] = {
            liked: !!post.likedBy[currentUser.uid],
            reposted: !!post.repostedBy[currentUser.uid],
          };
        });
        setUserInteractions(interactions);
      }
    });

    return () => unsubscribe();
  }, [db, currentUser]);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const renderContent = (text) => {
    if (!text) return null;
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(
      /(@[a-zA-Z0-9_]+)/g,
      '<span class="text-sky-500 font-medium">$1</span>'
    );
    const withHashtags = withMentions.replace(
      /(#[a-zA-Z0-9_]+)/g,
      '<span class="text-pink-500 font-medium">$1</span>'
    );
    return <span dangerouslySetInnerHTML={{ __html: withHashtags }} />;
  };

  const renderImages = (images) => {
    if (!images || images.length === 0) return null;
    const openLightbox = (index) => setLightbox({ open: true, images, index });

    if (images.length === 1)
      return (
        <img
          src={images[0]}
          alt="post"
          className="w-full h-80 object-cover rounded-xl cursor-pointer mt-2 shadow"
          onClick={() => openLightbox(0)}
        />
      );

    if (images.length === 2)
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="post"
              className="w-full h-48 object-cover rounded-xl cursor-pointer shadow"
              onClick={() => openLightbox(i)}
            />
          ))}
        </div>
      );

    if (images.length === 3)
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-2">
          <img
            src={images[0]}
            alt="post"
            className="col-span-2 h-48 w-full object-cover rounded-xl cursor-pointer shadow"
            onClick={() => openLightbox(0)}
          />
          <img
            src={images[1]}
            alt="post"
            className="h-48 w-full object-cover rounded-xl cursor-pointer shadow"
            onClick={() => openLightbox(1)}
          />
          <img
            src={images[2]}
            alt="post"
            className="h-48 w-full object-cover rounded-xl cursor-pointer shadow"
            onClick={() => openLightbox(2)}
          />
        </div>
      );

    const firstFour = images.slice(0, 4);
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-2">
        {firstFour.map((img, i) => (
          <div key={i} className="relative">
            <img
              src={img}
              alt="post"
              className="h-48 w-full object-cover rounded-xl cursor-pointer shadow"
              onClick={() => openLightbox(i)}
            />
            {i === 3 && images.length > 4 && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold rounded-xl cursor-pointer"
                onClick={() => openLightbox(3)}
              >
                +{images.length - 4}
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
    const postRef = ref(db, `accounts/${post.uid}/posts/${post.postId}`);
    const updates = {};

    if (liked) {
      updates[`likedBy/${currentUser.uid}`] = {
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        avatar: currentUser.photoURL || userdp,
      };
      updates[`likeCount`] = post.likeCount + 1;
    } else {
      updates[`likedBy/${currentUser.uid}`] = null;
      updates[`likeCount`] = post.likeCount - 1;
    }

    update(postRef, updates);
  };

  const toggleRepost = (index) => {
    if (!currentUser) return;
    const post = posts[index];
    const reposted = !userInteractions[index]?.reposted;
    const postRef = ref(db, `accounts/${post.uid}/posts/${post.postId}`);
    const updates = {};

    if (reposted) {
      updates[`repostedBy/${currentUser.uid}`] = {
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        avatar: currentUser.photoURL || userdp,
      };
      updates[`repostCount`] = post.repostCount + 1;
    } else {
      updates[`repostedBy/${currentUser.uid}`] = null;
      updates[`repostCount`] = post.repostCount - 1;
    }

    update(postRef, updates);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-sky-50 to-sky-100 text-gray-900"
      }`}
    >
     
      <FeedNavbar />
       <div className="max-w-7xl mx-auto mt-6">
  <OnlinePeople />
</div>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Create post + Join group chat + Ask Assistant */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div
            className={`flex items-center p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition w-full ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
            onClick={() => setShowPostModal(true)}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-sky-500 text-white rounded-full text-2xl font-bold mr-4">
              +
            </div>
            <span className="font-semibold">Create a Post</span>
          </div>

          <div
            className={`flex items-center p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition w-full ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
            onClick={() => setShowGroupChat(true)}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full text-xl mr-4 animate-bounce">
              <FaComments />
            </div>
            <span className="font-semibold">Join our Group Chat</span>
          </div>

          <div
            onClick={() => navigate("/services")}
            className={`flex items-center p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition w-full ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 text-white rounded-full text-xl mr-4">
              <FaStar className="animate-pulse" />
            </div>
            <span className="font-semibold">Ask Arregmatica Assistant</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-sky-500 mb-8 tracking-wide">
          Feeds
        </h1>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center">No posts yet. Be the first to post!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-xl p-6 space-y-4 transition-all duration-300 relative ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
                }`}
              >
                {/* Repost avatars */}
                <div className="absolute top-3 right-3 flex -space-x-2">
                  {Object.values(post.repostedBy || {}).slice(0, 5).map((user, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={user.avatar || userdp}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border-2 border-white cursor-pointer"
                      />
                      <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {user.username}
                      </span>
                    </div>
                  ))}
                  {Object.keys(post.repostedBy || {}).length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold border-2 border-white">
                      +{Object.keys(post.repostedBy).length - 5}
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar || userdp}
                    alt={post.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-sky-500 shadow"
                  />
                  <div>
                    <p className="font-semibold">{post.username}</p>
                    <p className="text-xs opacity-60">{formatTimestamp(post.timestamp)}</p>
                  </div>
                </div>

                {/* Post content */}
                <div className="text-base leading-relaxed">{renderContent(post.content)}</div>
                {renderImages(post.imageURLs)}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={() => toggleLike(index)}
                    className="flex items-center gap-2 hover:scale-105 transition"
                  >
                    {userInteractions[index]?.liked ? (
                      <FaHeart className="text-red-500 text-xl" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-xl" />
                    )}
                    <span className="text-sm">{post.likeCount}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center gap-2 hover:scale-105 transition"
                  >
                    <FaComment className="text-gray-500 text-xl" />
                    <span className="text-sm">{Object.keys(post.comments || {}).length}</span>
                  </button>

                  <button
                    onClick={() => toggleRepost(index)}
                    className="flex items-center gap-2 hover:scale-105 transition"
                  >
                    <FaRetweet
                      className={`text-xl ${
                        userInteractions[index]?.reposted
                          ? "text-orange-500"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="text-sm">{post.repostCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
      {showGroupChat && <GroupChat onClose={() => setShowGroupChat(false)} />}
      {lightbox.open && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox({ ...lightbox, open: false })}
        />
      )}
      {selectedPost && (
        <Comments post={selectedPost} currentUser={currentUser} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default Feeds;
