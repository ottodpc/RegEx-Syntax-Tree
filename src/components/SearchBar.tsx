import React from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for books..."
        className="border rounded-lg p-2 w-64"
      />
      <button
        onClick={handleSearch}
        className="ml-4 bg-blue-500 text-white rounded-lg p-2"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
