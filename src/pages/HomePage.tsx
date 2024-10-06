import BookImg from "../assets/book.png";
import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="home flex flex-col items-center">
      <img src={BookImg} alt="Book Icon" className="mb-6" />
      <div className="title text-center font-bold text-3xl mb-16">
        Gutenberg project
      </div>
      <div className="links grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/languages" className="text-black no-underline">
          <div className="link bg-black hover:bg-white text-white hover:text-black text-center p-12 rounded-lg  active:bg-gray-800">
            Find books
          </div>
        </Link>

        <a
          href="https://www.gutenberg.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black no-underline"
        >
          <div className="link bg-black text-white hover:text-black text-center p-12 rounded-lg hover:bg-white active:bg-gray-800">
            The Gutenberg project
          </div>
        </a>

        <a
          href="https://www-npa.lip6.fr/~buixuan/daar2024"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black no-underline"
        >
          <div className="link bg-black text-white hover:text-black text-center p-12 rounded-lg hover:bg-white active:bg-gray-800">
            DAAR
          </div>
        </a>

        <a
          href="https://github.com/arthurescriou/gutenberg-app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black no-underline"
        >
          <div className="link bg-black text-white hover:text-black text-center p-12 rounded-lg hover:bg-white active:bg-gray-800">
            This app repository
          </div>
        </a>
      </div>
    </div>
  );
};

export default HomePage;
