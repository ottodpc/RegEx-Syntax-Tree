import React from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const handleSearch = (term: string) => {
    console.log(`Searching for: ${term}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Find books</h1>
      <SearchBar onSearch={handleSearch} />

      <div className="flex flex-col mt-4 space-y-4">
        <button className="bg-gray-200 p-4 rounded-lg text-center">
          English books
        </button>
        <button className="bg-gray-200 p-4 rounded-lg text-center">
          Livres en français
        </button>
        <button className="bg-gray-200 p-4 rounded-lg text-center">
          Deutsche Bücher
        </button>
        <button className="bg-gray-200 p-4 rounded-lg text-center">
          Other languages
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
