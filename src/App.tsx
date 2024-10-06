import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LanguagesPage from "./pages/LanguagesPage";
import BooksPage from "./pages/BooksPage";
import Navbar from "./components/NavBar";
import RegExTester from "./pages/RegExTester";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <div className="py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/books/:lang" element={<BooksPage />} />
            <Route path="/regex-test" element={<RegExTester />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
