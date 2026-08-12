import React, { useState, useRef, useEffect } from "react";

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = options.find(
    option => option.value === value
  );

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <div
        className="input-field searchable-select-control"
        onClick={() => setOpen(!open)}
      >
        {selectedOption?.label || placeholder}

        <span className="select-arrow">
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div className="searchable-select-dropdown">
          <input
            type="text"
            className="input-field searchable-select-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />

          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="searchable-select-option"
                  onClick={() => {
                    onChange(option.value);
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="no-options">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;