import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import FeedNavbar from "./FeedNavbar";
import PostModal from "./Modal/Post";
import userdp from "../assets/userdp.png";

const Feeds = () => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const db = getDatabase();

  useEffect(() => {
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      const allPosts = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.values(data).forEach((account) => {
          const userPosts = account.posts ? Object.values(account.posts) : [];
          userPosts.forEach((post) => {
            allPosts.push({
              ...post,
              username: account.username,
              avatar: account.avatar,
              uid: account.uid,
            });
          });
        });
        allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts(allPosts);
      }
    });
    return () => unsubscribe();
  }, [db]);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const renderContent = (text) => {
    if (!text) return null;
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="text-blue-500">$1</span>');
    const withHashtags = withMentions.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="text-red-500">$1</span>');
    return <span dangerouslySetInnerHTML={{ __html: withHashtags }} />;
  };

  const renderImages = (images) => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return <img src={images[0]} alt="post" className="w-full h-80 object-cover rounded-lg" />;
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <img key={i} src={img} alt="post" className="w-full h-48 object-cover rounded-lg" />
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          <img src={images[0]} alt="post" className="col-span-2 h-48 w-full object-cover rounded-lg" />
          <img src={images[1]} alt="post" className="h-48 w-full object-cover rounded-lg" />
          <img src={images[2]} alt="post" className="h-48 w-full object-cover rounded-lg" />
        </div>
      );
    }

    if (images.length >= 4) {
      const firstFour = images.slice(0, 4);
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {firstFour.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt="post" className="h-48 w-full object-cover rounded-lg" />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xl font-bold rounded-lg">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FeedNavbar />
      <div className="p-4 space-y-4">
        {/* Create Post Box */}
        <div
          className="flex items-center bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
          onClick={() => setShowPostModal(true)}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full text-xl font-bold mr-4">+</div>
          <span className="text-gray-500">Create a post</span>
        </div>

        {/* Feeds Header */}
        <h1 className="text-xl font-semibold">Feeds</h1>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-4 space-y-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <img src={post.avatar || userdp} 
                  alt={post.username} 
                  className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{post.username}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(post.timestamp)}</p>
                  </div>
                </div>

                {/* Post content */}
                <div className="text-gray-800 text-sm leading-relaxed">{renderContent(post.content)}</div>

                {/* Post images */}
                {renderImages(post.imageURLs)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && <PostModal onClose={() => setShowPostModal(false)} />}
    </div>
  );
};

export default Feeds;
