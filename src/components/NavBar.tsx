import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    // TODO : Navbar responsive
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* NOTE : Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" className="text-black no-underline">
            <img
              src="/assets/book.png"
              alt="Logo"
              className="w-10 h-10 inline-block mr-2 "
            />
            Gutenberg project
          </Link>
        </div>

        {/* NOTE : Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <Link
            to="/languages"
            className="text-black no-underline hover:text-green-500"
          >
            Find book
          </Link>
          <Link
            to="/regex-test"
            className="text-black no-underline hover:text-green-500"
          >
            RegEx Tester
          </Link>
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black no-underline hover:text-green-500"
          >
            The Gutenberg Project
          </a>
          <a
            href="https://www-apr.lip6.fr/~buixuan/daar2024"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black no-underline hover:text-green-500"
          >
            DAAR
          </a>
        </div>

        {/* NOTE : Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* NOTE : Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <Link
            to="/languages"
            className="block text-black no-underline px-4 py-2 hover:bg-gray-200"
            onClick={toggleMenu}
          >
            Find book
          </Link>
          <Link
            to="/regex-test"
            className="block text-black no-underline px-4 py-2 hover:bg-gray-200"
            onClick={toggleMenu}
          >
            RegEx Tester
          </Link>
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-black no-underline px-4 py-2 hover:bg-gray-200"
            onClick={toggleMenu}
          >
            The Gutenberg Project
          </a>
          <a
            href="https://www-apr.lip6.fr/~buixuan/daar2024"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-black no-underline px-4 py-2 hover:bg-gray-200"
            onClick={toggleMenu}
          >
            DAAR
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
