import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLanguages } from "../store/books";

const LanguagesPage: React.FC = () => {
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      const langs = await getLanguages();
      setLanguages(langs);
    };

    fetchLanguages();
  }, []);

  return (
    <div className="languages p-16">
      <div className="title text-center font-bold text-3xl mb-8">
        Choose a language
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="language text-center p-8 rounded-lg shadow-lg bg-black hover:bg-white text-white hover:text-black active:bg-gray-600">
          <Link to="/books/all" className="t no-underline">
            All
          </Link>
        </div>
        {languages.map((lang) => (
          <div
            key={lang}
            className="language text-center p-8 rounded-lg shadow-lg bg-black hover:bg-white text-white hover:text-black active:bg-gray-600"
          >
            <Link to={`/books/${lang}`} className=" no-underline">
              {lang}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagesPage;
