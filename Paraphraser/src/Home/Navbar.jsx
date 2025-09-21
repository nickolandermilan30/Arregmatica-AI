import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logopng.png";
import { useDarkMode } from "../Theme/DarkModeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // user dropdown
  const [dictDropdown, setDictDropdown] = useState(false); // tools dropdown (desktop)
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  // Listen for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Auto-close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setDictDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "?";
    const name = nameOrEmail.split(" ");
    if (name.length > 1) {
      return name[0][0].toUpperCase() + name[1][0].toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className={`px-6 py-3 flex items-center justify-between shadow relative z-50 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        {/* Logo */}
        <Link to="/landingpage" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
        </Link>

        {/* Links - Desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex space-x-10 text-lg font-medium items-center text-center">
            <Link to="/landingpage" className="hover:text-blue-500">
              Home
            </Link>
            <Link to="/feed" className="hover:text-blue-500">
              Community
            </Link>
            <Link to="/services" className="hover:text-blue-500">
              Arregmatica AI
            </Link>

            {/* Tools Dropdown (Desktop only) */}
            <div className="relative">
              <button
                onClick={() => setDictDropdown(!dictDropdown)}
                className="flex items-center gap-1 hover:text-blue-500"
              >
                Tools
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    dictDropdown ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {dictDropdown && (
                <div
                  className={`absolute left-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50 ${
                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
                  }`}
                >
                  <Link
                    to="/home"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Text Enhancer
                  </Link>
                  <Link
                    to="/dictionary"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Dictionary
                  </Link>
                  <Link
                    to="/humanize"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Humanize Word
                  </Link>
                  <Link
                    to="/essa-checker"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Essay Checker
                  </Link>
                  <Link
                    to="/history"
                    className={`block px-4 py-2 border-t mt-1 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    History
                  </Link>
                </div>
              )}
            </div>

            <Link to="/about" className="hover:text-blue-500">
              About
            </Link>
          </div>
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center gap-4 relative">
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="relative w-8 h-8">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 text-white font-bold">
                      {getInitials(user.displayName || user.email)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                <span className="font-medium">{user.displayName || user.email}</span>
                <ChevronDown size={18} />
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50 ${
                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
                  }`}
                >
                  <Link
                    to="/profile"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className={`w-full text-left px-4 py-2 text-red-600 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <Link
            to="/quiz"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            Take Quiz
          </Link>
        </div>

        {/* Mobile Burger */}
        <button
          className="md:hidden text-sky-500 focus:outline-none"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-64 shadow-lg z-50 transform transition-transform duration-300 ${
              darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
            } ${isOpen ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="text-sky-500">
                <X size={28} />
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-4 text-lg">
              <Link to="/landingpage" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/feed" onClick={() => setIsOpen(false)}>
                Community
              </Link>
              <Link to="/services" onClick={() => setIsOpen(false)}>
                Arregmatica AI
              </Link>
              {/* Tools as flat list on mobile */}
              <Link to="/home" onClick={() => setIsOpen(false)}>
                Text Enhancer
              </Link>
              <Link to="/dictionary" onClick={() => setIsOpen(false)}>
                Dictionary
              </Link>
              <Link to="/humanize" onClick={() => setIsOpen(false)}>
                Humanize Word
              </Link>
              <Link to="/essa-checker" onClick={() => setIsOpen(false)}>
                Essay Checker
              </Link>
              <Link to="/history" onClick={() => setIsOpen(false)}>
                History
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)}>
                About
              </Link>
              <Link
                to="/quiz"
                className="bg-sky-500 text-white px-4 py-2 rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Take Quiz
              </Link>

              {/* User Links flat on mobile */}
              {user && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-8 h-8">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 text-white font-bold">
                          {getInitials(user.displayName || user.email)}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <span className="font-medium">{user.displayName || user.email}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className={`w-full text-left px-4 py-2 text-red-600 transition-colors duration-200 ${
                      darkMode ? "hover:bg-gray-700/60" : "hover:bg-gray-100"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`p-8 rounded-2xl shadow-2xl text-center w-96 ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">
              Are you sure you want to logout?
            </h2>
            <p className="mb-8">
              You’ll need to log in again to access your account.
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`font-semibold px-6 py-3 rounded-lg shadow-md ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
