import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // user dropdown
  const [dictDropdown, setDictDropdown] = useState(false); // dictionary dropdown
  const [mobileDictDropdown, setMobileDictDropdown] = useState(false); // mobile dictionary dropdown
  const navigate = useNavigate();

  // Listen for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Auto-close sidebar kapag nag-resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white px-6 py-3 flex items-center justify-between">
        {/* Logo (Left side) */}
        <Link to="/landingpage" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
        </Link>

        {/* Links - Desktop (Centered) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex space-x-10 text-lg font-medium items-center">
            <Link to="/landingpage" className="text-gray-700 hover:text-blue-500">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-500">
              Arregmatica AI
            </Link>
            <Link to="/history" className="text-gray-700 hover:text-blue-500">
              History
            </Link>

            {/* ✅ Dictionary Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDictDropdown(!dictDropdown)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-500"
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
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/home"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDictDropdown(false)}
                  >
                    Text Enhancer
                  </Link>
                  <Link
                    to="/dictionary"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDictDropdown(false)}
                  >
                    Dictionary
                  </Link>
                  <Link
                    to="/humanize"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDictDropdown(false)}
                  >
                    Humanize Word
                  </Link>
                  <Link
                    to="/essa-checker"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDictDropdown(false)}
                  >
                    Essay Checker
                  </Link>

                </div>
              )}
            </div>

            <Link to="/about" className="text-gray-700 hover:text-blue-500">
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
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
              >
                <span className="text-gray-700 font-medium">
                  {user.displayName || user.email}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
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

        {/* Burger - Mobile */}
        <button
          className="md:hidden text-sky-500 focus:outline-none"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* ✅ Overlay + Sidebar for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-sky-500">
            <X size={28} />
          </button>
        </div>

        <div className="flex flex-col p-4 space-y-4 text-lg">
          <Link to="/home" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/services" onClick={() => setIsOpen(false)}>
            Arregmatica AI
          </Link>
          <Link to="/history" onClick={() => setIsOpen(false)}>
            History
          </Link>

          {/* ✅ Mobile Dictionary Dropdown */}
          <div>
            <button
              onClick={() => setMobileDictDropdown(!mobileDictDropdown)}
              className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-100"
            >
              <span>Tools</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  mobileDictDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {mobileDictDropdown && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                <Link
                  to="/landingpage"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Text Enhancer
                </Link>
                <Link
                  to="/dictionary"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Dictionary
                </Link>
                <Link
                  to="/humanize"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Humanize Word
                </Link>
                <Link
                  to="/essa-checker"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Essay Checker
                </Link>


              </div>
            )}
          </div>

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

          {/* ✅ User dropdown sa Mobile */}
          {user && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <span className="text-gray-700 font-medium">
                  {user.displayName || user.email}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="mt-2 bg-white rounded-lg shadow-md py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-96">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Are you sure you want to logout?
            </h2>
            <p className="text-gray-600 mb-8">
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
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md"
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
