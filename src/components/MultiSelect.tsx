import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: number;
}

interface Props {
  options: Option[];
  value: Option[];
  onChange: (values: Option[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleOption = (opt: Option) => {
    const exists = value.find((v) => v.value === opt.value);
    if (exists) onChange(value.filter((v) => v.value !== opt.value));
    else onChange([...value, opt]);
  };

  const selectAll = () => onChange(options);
  const unselectAll = () => onChange([]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      {/* Selected box */}
      <div
        className="border border-gray-300 rounded px-2 py-1 bg-white text-sm cursor-pointer w-full"
        onClick={() => setOpen(!open)}
      >
        {value.length === 0
          ? placeholder
          : value.length === 1
          ? value[0].label
          : `${value.length} selected`}
      </div>

      {open && (
        <div className="absolute z-30 bg-white border border-gray-300 rounded shadow-lg mt-1 p-2 w-56 max-h-64 overflow-auto">
          
          {/* Search */}
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Select All */}
          <div className="flex items-center gap-2 px-1 py-1 border-b">
            <input
              type="checkbox"
              checked={value.length === options.length}
              onChange={(e) => (e.target.checked ? selectAll() : unselectAll())}
            />
            <span className="text-sm">
              {value.length === options.length ? "Unselect All" : "Select All"}
            </span>
          </div>

          {/* Options */}
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center gap-2 px-1 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.some((v) => v.value === opt.value)}
                onChange={() => toggleOption(opt)}
              />
              <span className="text-sm">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
