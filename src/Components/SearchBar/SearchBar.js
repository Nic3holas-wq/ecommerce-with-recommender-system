import React, { useState } from "react";
import "./SearchBar.css";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);  // 🔹 Call search function on every change
  };

  return (
    <div className="container-searchbar">
      <form className="search-container" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={handleChange}
          className="search-input"
        />
        
      </form>
    </div>
  );
};

export default SearchBar;
