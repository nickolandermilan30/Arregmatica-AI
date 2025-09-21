// src/components/FeedNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Trash2, FileText, Menu, X } from "lucide-react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { auth } from "../firebase";
import userdp from "../assets/userdp.png";
import FriendDetail from "./Modal/FriendDetail";
import NotifPost from "./Modal/NotifPost";
import { useDarkMode } from "../Theme/DarkModeContext";
import { useNavigate } from "react-router-dom";

const FeedNavbar = () => {
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);
  const [openNotifDropdown, setOpenNotifDropdown] = useState(false);
  const [openSearchDropdown, setOpenSearchDropdown] = useState(false);

  const [myPosts, setMyPosts] = useState([]);
  const [deletePostId, setDeletePostId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navbarRef = useRef(null);
  const currentUser = auth.currentUser;
  const db = getDatabase();
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  // Fetch accounts
  useEffect(() => {
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAccounts(Object.keys(data).map((uid) => ({ uid, ...data[uid] })));
      } else setAccounts([]);
    });
    return () => unsubscribe();
  }, [db]);

  // Filter accounts on search
  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      setOpenSearchDropdown(false);
      return;
    }
    const lower = query.toLowerCase();
    const results = accounts.filter((acc) =>
      acc.username?.toLowerCase().includes(lower)
    );
    setFiltered(results);
    setOpenSearchDropdown(results.length > 0);
  }, [query, accounts]);

  // Fetch my posts
  useEffect(() => {
    if (!currentUser) return;
    const myRef = ref(db, `accounts/${currentUser.uid}`);
    const unsubscribe = onValue(myRef, (snapshot) => {
      const accountData = snapshot.val();
      if (accountData?.posts) {
        const postsArray = Object.entries(accountData.posts).sort(
          ([, a], [, b]) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setMyPosts(postsArray);
      } else setMyPosts([]);
    });
    return () => unsubscribe();
  }, [currentUser, db]);

  // Notifications
  useEffect(() => {
    if (!currentUser) return;
    const accountsRef = ref(db, "accounts");
    const unsubscribe = onValue(accountsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setNotifications([]);
        return;
      }
      const data = snapshot.val();
      const newNotifs = [];
      Object.keys(data).forEach((uid) => {
        const user = data[uid];
        if (!user.posts) return;

        Object.entries(user.posts).forEach(([postId, post]) => {
          const ownerUid = uid;

          // Likes
          if (post.likedBy) {
            Object.keys(post.likedBy).forEach((likerId) => {
              if (post.uid === currentUser.uid && likerId !== currentUser.uid)
                newNotifs.push({
                  type: "like",
                  postId,
                  ownerUid,
                  from: data[likerId] || { username: "Someone" },
                  timestamp: post.timestamp,
                  content: post.content,
                });
            });
          }

          // Comments
          if (post.comments) {
            Object.entries(post.comments).forEach(([cid, comment]) => {
              if (post.uid === currentUser.uid && comment.uid !== currentUser.uid)
                newNotifs.push({
                  type: "comment",
                  postId,
                  ownerUid,
                  from: data[comment.uid] || { username: "Someone" },
                  timestamp: comment.timestamp,
                  content: post.content,
                });
            });
          }

          // Reposts
          if (post.repostedBy) {
            Object.keys(post.repostedBy).forEach((reposterId) => {
              if (post.uid === currentUser.uid && reposterId !== currentUser.uid)
                newNotifs.push({
                  type: "repost",
                  postId,
                  ownerUid,
                  from: data[reposterId] || { username: "Someone" },
                  timestamp: post.timestamp,
                  content: post.content,
                });
            });
          }

          // Mentions
          if (post.content && currentUser.displayName) {
            if (post.content.includes(`@${currentUser.displayName}`) && post.uid !== currentUser.uid)
              newNotifs.push({
                type: "mention",
                postId,
                ownerUid,
                from: user,
                timestamp: post.timestamp,
                content: post.content,
              });
          }
        });
      });

      newNotifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(newNotifs);
    });
    return () => unsubscribe();
  }, [db, currentUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setOpenProfileDropdown(false);
        setOpenNotifDropdown(false);
        setOpenSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const handleDeletePost = async () => {
    if (!deletePostId || !currentUser) return;
    try {
      await remove(ref(db, `accounts/${currentUser.uid}/posts/${deletePostId}`));
      setShowDeleteModal(false);
      setDeletePostId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav
      ref={navbarRef}
      className={`flex items-center justify-between px-4 py-3 shadow-md relative transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      {/* Left - Logo / Title */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate("/community")}
      >
        <p className="italic font-semibold text-lg">Community</p>
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4 relative">
        {/* Search */}
        <div className="relative w-48 sm:w-64 md:w-80">
          <div
            className={`flex items-center rounded-full px-3 py-2 border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                : "bg-gray-100 border-gray-200 text-gray-700 placeholder-gray-500"
            }`}
          >
            <Search size={18} className="mr-2" />
            <input
              type="text"
              placeholder="Search learners"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base"
            />
          </div>
          {openSearchDropdown && (
            <div
              className={`absolute left-0 mt-2 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto z-[9999] transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border border-gray-700 text-gray-100"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {filtered.map((acc) => (
                <div
                  key={acc.uid}
                  className={`flex items-center gap-3 p-2 sm:p-3 cursor-pointer transition-colors duration-200 ${
                    darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedUser(acc);
                    setShowModal(true);
                    setOpenSearchDropdown(false);
                  }}
                >
                  <img
                    src={acc.avatar || userdp}
                    alt={acc.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base">{acc.username}</p>
                    <p className="text-xs break-all">{acc.uid}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenNotifDropdown((prev) => !prev);
              setOpenProfileDropdown(false);
              setOpenSearchDropdown(false);
            }}
            className={`relative p-2 rounded-full transition ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"
            }`}
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {openNotifDropdown && (
            <div
              className={`absolute right-0 mt-5 w-80 max-h-[500px] overflow-y-auto rounded-xl shadow-lg border p-4 z-[9999] transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              <h2 className="font-semibold mb-3">Notifications</h2>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <FileText size={36} className="mb-2" />
                  <p className="text-md font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border-b cursor-pointer transition-colors duration-200 ${
                        darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedNotif(notif);
                        setShowNotifModal(true);
                        setOpenNotifDropdown(false);
                      }}
                    >
                      <img
                        src={notif.from?.avatar || userdp}
                        alt="user"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notif.from?.username || "Someone"}</span>{" "}
                          {notif.type === "like"
                            ? "liked your post"
                            : notif.type === "comment"
                            ? "commented:"
                            : notif.type === "repost"
                            ? "reposted your post"
                            : "mentioned you"}
                        </p>
                        {notif.type === "comment" && (
                          <p className="text-xs mt-1 line-clamp-2">{notif.content}</p>
                        )}
                        <p className="text-xs mt-1">{formatTimestamp(notif.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {currentUser && (
          <div className="relative">
            <img
              src={currentUser.photoURL || userdp}
              alt="My Profile"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border object-cover cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
              onClick={() => {
                setOpenProfileDropdown((prev) => !prev);
                setOpenNotifDropdown(false);
                setOpenSearchDropdown(false);
              }}
            />
            {openProfileDropdown && (
              <div
                className={`absolute right-0 mt-5 w-72 sm:w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-lg border p-4 z-[9999] transition-colors duration-300 ${
                  darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-800 border-gray-200"
                }`}
              >
                {/* User Info */}
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.photoURL || userdp}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border object-cover"
                    />
                    <div className="flex flex-col">
                      <p className="font-semibold">{currentUser.displayName || "No Name"}</p>
                      <p className="text-xs opacity-70 break-all">{currentUser.uid}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className={`p-2 rounded-lg transition-colors duration-300 ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A7.5 7.5 0 1112 19.5a7.5 7.5 0 01-6.879-1.696zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Posts */}
                <h3 className="font-semibold mb-2">My Posts</h3>
                {myPosts.length === 0 ? (
                  <p className="text-sm text-gray-500">You have no posts yet</p>
                ) : (
                  <div className="space-y-4">
                    {myPosts.map(([postId, post]) => (
                      <div key={postId} className="border rounded-lg overflow-hidden relative">
                        {post.imageURLs?.[0] && (
                          <img
                            src={post.imageURLs[0]}
                            alt="post"
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-2">
                          <p className="text-sm line-clamp-2">{post.content}</p>
                          <p className="text-xs mt-1">{formatTimestamp(post.timestamp)}</p>
                        </div>
                        <button
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                          onClick={() => {
                            setDeletePostId(postId);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className={`absolute top-full left-0 w-full flex flex-col gap-4 p-4 shadow-lg z-50 md:hidden transition-colors duration-300 ${
            darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
          }`}
        >
          {/* Search (Mobile) */}
          <div className="relative w-full">
            <div
              className={`flex items-center rounded-full px-3 py-2 border transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                  : "bg-gray-100 border-gray-200 text-gray-700 placeholder-gray-500"
              }`}
            >
              <Search size={18} className="mr-2" />
              <input
                type="text"
                placeholder="Search learners"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-sm"
              />
            </div>
            {openSearchDropdown && (
              <div
                className={`absolute left-0 mt-2 w-full rounded-lg shadow-lg max-h-60 overflow-y-auto z-[9999] ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {filtered.map((acc) => (
                  <div
                    key={acc.uid}
                    className={`flex items-center gap-3 p-2 cursor-pointer transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedUser(acc);
                      setShowModal(true);
                      setOpenSearchDropdown(false);
                    }}
                  >
                    <img
                      src={acc.avatar || userdp}
                      alt={acc.username}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium text-sm">{acc.username}</p>
                      <p className="text-xs break-all">{acc.uid}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications (Mobile) */}
          <button
            onClick={() => {
              setOpenNotifDropdown((prev) => !prev);
              setOpenProfileDropdown(false);
            }}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            }`}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>
          {openNotifDropdown && (
            <div
              className={`mt-2 rounded-lg shadow-lg border max-h-[300px] overflow-y-auto p-4 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications yet</p>
              ) : (
                notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer ${
                      darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setSelectedNotif(notif);
                      setShowNotifModal(true);
                      setOpenNotifDropdown(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <img
                      src={notif.from?.avatar || userdp}
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{notif.from?.username || "Someone"}</span>{" "}
                        {notif.type === "like"
                          ? "liked your post"
                          : notif.type === "comment"
                          ? "commented"
                          : notif.type === "repost"
                          ? "reposted your post"
                          : "mentioned you"}
                      </p>
                      <p className="text-xs">{formatTimestamp(notif.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Profile (Mobile) */}
          {currentUser && (
            <button
              onClick={() => {
                navigate("/profile");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <img
                src={currentUser.photoURL || userdp}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm">{currentUser.displayName || "My Profile"}</span>
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && selectedUser && <FriendDetail user={selectedUser} onClose={() => setShowModal(false)} />}
      {showNotifModal && selectedNotif && (
        <NotifPost
          notif={selectedNotif}
          onClose={() => {
            setShowNotifModal(false);
            setSelectedNotif(null);
          }}
        />
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`p-6 max-w-sm w-full text-center rounded-xl shadow-lg transition-colors duration-300 ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <p className="font-semibold mb-4">
              Are you sure you want to delete this post?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  darkMode
                    ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  darkMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                onClick={handleDeletePost}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default FeedNavbar;
