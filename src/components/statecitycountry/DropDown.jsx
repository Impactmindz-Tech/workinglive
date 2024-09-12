import React, { useState, useEffect, useRef } from "react";

const Dropdown = ({ data = [], selectedValue, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.preventDefault();  // Prevents the form submission
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelect = (value) => {
    onChange(value);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      {/* Prevent form submission when clicking dropdown */}
      <button
        onMouseDown={(e) => e.preventDefault()} // Prevent form validation trigger
        onClick={toggleDropdown}
        className={`w-full px-4 py-2 text-left rounded-lg input focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={disabled}
      >
        {selectedValue || placeholder}
      </button>
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-40">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={inputRef}
            autoFocus
            className="w-full px-4 py-2 border-b border-gray-300 rounded-t-lg focus:outline-none"
          />
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div
                key={item}
                onClick={() => handleSelect(item)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {item}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
