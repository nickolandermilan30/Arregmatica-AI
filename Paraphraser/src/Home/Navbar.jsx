import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // ✅ burger & close icons
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white px-6 py-3 flex items-center justify-between ">
        {/* Logo (Left) */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={logo}
            alt="Logo"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Links (Center) - hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="space-x-10 text-lg font-medium">
            <Link to="/" className="text-gray-700 hover:text-blue-500 transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-500 transition-colors">
              Arregmatica AI
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-500 transition-colors">
              About
            </Link>
          </div>
        </div>

        {/* Button (Right) - hidden on mobile */}
        <div className="hidden md:block">
          <Link
            to="/quiz"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            Take Quiz
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-sky-500 focus:outline-none" // ✅ Sky blue icon
          onClick={() => setIsOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Blurred Background Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar (Mobile Menu) */}
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
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/services"
            className="text-gray-700 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Arregmatica AI
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-blue-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>

          <Link
            to="/quiz"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md text-center"
            onClick={() => setIsOpen(false)}
          >
            Take Quiz
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
