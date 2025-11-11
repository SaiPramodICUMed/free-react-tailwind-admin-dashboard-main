import { useState, useEffect, useRef, use } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SmartFilterTable<T extends Record<string, any>>({
  columns = [],
  data = [],
}: {
  columns: any[];
  data: T[];
}) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleFilterChange = (accessor: string, value: any) => {
   
  setFilters((prev) => {
    const updated = { ...prev };
//console.log(accessor, value === "");
    // If value is empty (e.g., clearing), remove that column filter
    if (
      value === "" ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete updated[accessor];
      return updated;
    }

    // For arrays (multiSelect etc.)
    if (Array.isArray(value)) {
      updated[accessor] = [...value];
    } else {
      // Replace only the current column filter
      updated[accessor] = value;
    }
 //console.log(updated);
    return updated;
  });

};


  const filteredData = data.filter((row) =>
    columns.every((col) => {
      const filterType = col.filterType || "text";
      const value = row[col.accessor];
      const filter = filters[col.accessor];
      if (!filter || (Array.isArray(filter) && filter.length === 0)) return true;

      switch (filterType) {
        case "text":
          return String(value ?? "")
            .toLowerCase()
            .includes(String(filter).toLowerCase());
        case "select":
          return filter === "" || value === filter;
        case "autocomplete":
          return (
            String(value ?? "")
              .toLowerCase()
              .includes(String(filter).toLowerCase()) || !filter
          );
        case "multiSelect":
          return filter.includes(value);
        case "range":
          const [min, max] = filter;
          return (
            (min === null || value >= min) && (max === null || value <= max)
          );
        case "dateRange":
          const [start, end] = filter;
          const date = new Date(value);
          return (!start || date >= start) && (!end || date <= end);
        default:
          return true;
      }
    })
  );

  // const dateShortcuts = [
  //   { label: "3M", months: 3 },
  //   { label: "6M", months: 6 },
  //   { label: "1Y", months: 12 },
  // ];

  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 🧠 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        openDropdown &&
        dropdownRef.current[openDropdown] &&
        !dropdownRef.current[openDropdown]?.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  useEffect(() => { console.log(filters)}, [filters]);
  

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto relative">
        <table className="min-w-full table-fixed text-sm">
          {/* HEADER */}
          <thead className="border-b border-gray-100 bg-blue-800 text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-4 py-2 text-start font-medium text-sm w-[150px]"
                >
                  {col.header}
                </th>
              ))}
            </tr>

            {/* FILTER ROW */}
            <tr className="text-gray-700 text-xs bg-white">
              {columns.map((col) => {
                const filterType = col.filterType || "text";
                const selectedValues = filters[col.accessor] ?? [];

                return (
                  <th
                    key={col.accessor}
                    className="px-2 py-1 text-start bg-white relative"
                  >
                    {/* TEXT FILTER */}
                    {filterType === "text" && (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                        value={filters[col.accessor] ?? ""}
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value)
                        }
                        placeholder={`Search ${col.header}`}
                      />
                    )}

                    {/* SELECT FILTER */}
                    {filterType === "select" && (
                      <select
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white"
                        value={filters[col.accessor] ?? ""}
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value)
                        }
                      >
                        <option value="">All</option>
                        {col.filterOptions?.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* AUTOCOMPLETE FILTER */}
                    {filterType === "autocomplete" && (
                      <div
                        className="relative"
                        ref={(el) => (dropdownRef.current[col.accessor] = el)}
                      >
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white truncate"
                          value={filters[col.accessor] ?? ""}
                          onChange={(e) =>
                            handleFilterChange(col.accessor, e.target.value)
                          }
                          placeholder={`Type to search`}
                          onFocus={() => setOpenDropdown(col.accessor)}
                          title={filters[col.accessor]}
                        />
                        {openDropdown === col.accessor &&
                          filters[col.accessor] &&
                          col.filterOptions?.filter((opt: string) =>
                            opt
                              .toLowerCase()
                              .includes(filters[col.accessor].toLowerCase())
                          ).length > 0 && (
                            <ul
                              className="absolute z-20 bg-white border border-gray-200 rounded-md mt-1 shadow overflow-auto"
                              style={{
                                minWidth: "max-content",
                                width: "auto",
                                maxWidth: "50px",
                              }}
                            >
                              {col.filterOptions
                                .filter((opt: string) =>
                                  opt
                                    .toLowerCase()
                                    .includes(
                                      filters[col.accessor].toLowerCase()
                                    )
                                )
                                .map((opt: string) => (
                                  <li
                                    key={opt}
                                    onClick={() => {
                                      handleFilterChange(col.accessor, opt);
                                      setOpenDropdown(null);
                                    }}
                                    className="px-2 py-1 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                                  >
                                    {opt}
                                  </li>
                                ))}
                            </ul>
                          )}
                      </div>
                    )}

                    {/* MULTISELECT FILTER */}
                   {filterType === "multiSelect" && (
  <div
    className="relative"
    ref={(el) => (dropdownRef.current[col.accessor] = el)}
  >
    <div
      className="border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white cursor-pointer truncate max-w-[100px]"
      onClick={() =>
        setOpenDropdown(
          openDropdown === col.accessor ? null : col.accessor
        )
      }
      title={selectedValues.join(", ")}
    >
      {selectedValues.length > 0
        ? selectedValues.join(", ").length > 25
          ? selectedValues.join(", ").slice(0, 25) + "..."
          : selectedValues.join(", ")
        : `Select ${col.header}`}
    </div>

    {openDropdown === col.accessor && (
      <div
        className="absolute z-20 bg-white border border-gray-200 rounded-md mt-1 shadow-lg overflow-auto p-1"
        style={{
          minWidth: "max-content",
          width: "auto",
          maxHeight: "180px",
        }}
      >
        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search..."
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs mb-1"
          value={filters[`${col.accessor}_search`] ?? ""}
          onChange={(e) =>
            handleFilterChange(`${col.accessor}_search`, e.target.value)
          }
        />

        {/* ✅ Select/Unselect All */}
        <label className="flex items-center px-2 py-1 border-b text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={
              selectedValues.length === col.filterOptions?.length
            }
            onChange={(e) =>
              handleFilterChange(
                col.accessor,
                e.target.checked ? col.filterOptions : []
              )
            }
            className="mr-2"
          />
          {selectedValues.length === col.filterOptions?.length
            ? "Unselect All"
            : "Select All"}
        </label>

        {/* 🔄 Filtered Options */}
        {col.filterOptions
          ?.filter((opt: string) =>
            opt
              .toLowerCase()
              .includes(
                (filters[`${col.accessor}_search`] ?? "").toLowerCase()
              )
          )
          .map((opt: string) => (
            <label
              key={opt}
              className="flex items-center px-2 py-1 text-xs hover:bg-blue-50 cursor-pointer whitespace-nowrap"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, opt]
                    : selectedValues.filter((v: string) => v !== opt);
                  handleFilterChange(col.accessor, newValues);
                }}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
      </div>
    )}
  </div>
)}


                    {/* RANGE FILTER */}
  {filterType === "range" && (
  <div
    className="relative"
    ref={(el) => (dropdownRef.current[col.accessor] = el)}
  >
    {/* Trigger */}
    <div
      className="border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white cursor-pointer text-center"
      onClick={() =>
        setOpenDropdown(openDropdown === col.accessor ? null : col.accessor)
      }
    >
      {filters[col.accessor]
        ? `${filters[col.accessor][0]} - ${filters[col.accessor][1]}`
        : `Select Range`}
    </div>

    {openDropdown === col.accessor && (
      <div className="absolute z-30 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 w-[260px]">
        {/* Range visualization */}
        <div className="relative w-full h-2 bg-gray-200 rounded mt-1 mb-3 overflow-hidden">
          <div
            className="absolute top-0 h-2 bg-blue-600 rounded transition-all duration-300"
            style={{
              left: `${
                ((Math.max(filters[col.accessor]?.[0] ?? col.min ?? 0, col.min ?? 0) - (col.min ?? 0)) /
                  ((col.max ?? 1000) - (col.min ?? 0))) *
                100
              }%`,
              width: `${
                ((Math.min(filters[col.accessor]?.[1] ?? col.max ?? 0, col.max ?? 1000) -
                  Math.max(filters[col.accessor]?.[0] ?? col.min ?? 0, col.min ?? 0)) /
                  ((col.max ?? 1000) - (col.min ?? 0))) *
                100
              }%`,
            }}
          ></div>
        </div>

        {/* Current range display */}
        <div className="text-xs text-gray-600 text-center mb-2">
          Showing range:{" "}
          <b>{filters[col.accessor]?.[0] ?? col.min ?? 0}</b> -{" "}
          <b>{filters[col.accessor]?.[1] ?? col.max ?? 0}</b>
        </div>

        {/* Input fields with min/max applied on blur only */}
        <div className="flex justify-between gap-2">
          <input
            type="number"
            className="w-[45%] border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Min"
            value={
              filters[col.accessor]?.[0] === 0
                ? ""
                : filters[col.accessor]?.[0] ?? col.min ?? ""
            }
            onChange={(e) => {
              const rawVal = e.target.value;
              const minVal = rawVal === "" ? 0 : Number(rawVal);
              const maxVal = filters[col.accessor]?.[1] ?? col.max ?? 0;
              handleFilterChange(col.accessor, [minVal, maxVal]);
            }}
            onBlur={(e) => {
              const val = Number(e.target.value);
              const min = col.min ?? 0;
              const max = col.max ?? 1000;
              const clamped = Math.min(Math.max(val, min), max);
              const maxVal = filters[col.accessor]?.[1] ?? max;
              handleFilterChange(col.accessor, [clamped, maxVal]);
            }}
          />
          <input
            type="number"
            className="w-[45%] border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Max"
            value={
              filters[col.accessor]?.[1] === 0
                ? ""
                : filters[col.accessor]?.[1] ?? col.max ?? ""
            }
            onChange={(e) => {
              const rawVal = e.target.value;
              const maxVal = rawVal === "" ? 0 : Number(rawVal);
              const minVal = filters[col.accessor]?.[0] ?? col.min ?? 0;
              handleFilterChange(col.accessor, [minVal, maxVal]);
            }}
            onBlur={(e) => {
              const val = Number(e.target.value);
              const min = col.min ?? 0;
              const max = col.max ?? 1000;
              const clamped = Math.min(Math.max(val, min), max);
              const minVal = filters[col.accessor]?.[0] ?? min;
              handleFilterChange(col.accessor, [minVal, clamped]);
            }}
          />
        </div>

        {/* Validation message */}
        {filters[col.accessor] &&
          filters[col.accessor][0] > filters[col.accessor][1] && (
            <div className="text-red-500 text-xs mt-2 text-center">
              ❌ Invalid range: Min cannot exceed Max
            </div>
          )}

        {/* Buttons */}
        <div className="flex justify-between mt-3">
          <button
            className="px-3 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              handleFilterChange(col.accessor, [col.min ?? 0, col.max ?? 1000]);
              setOpenDropdown(null);
            }}
          >
            Reset
          </button>
          <button
            className={`px-3 py-1 text-xs border rounded text-white ${
              filters[col.accessor]?.[0] > filters[col.accessor]?.[1]
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={filters[col.accessor]?.[0] > filters[col.accessor]?.[1]}
            onClick={() => setOpenDropdown(null)}
          >
            Apply
          </button>
        </div>
      </div>
    )}
  </div>
)}
                    {/* DATE RANGE FILTER */}
{filterType === "dateRange" && (
  <div
    className="relative"
    ref={(el) => (dropdownRef.current[col.accessor] = el)}
  >
    {/* Trigger button */}
    <div
      className="border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white cursor-pointer text-center"
      onClick={() =>
        setOpenDropdown(openDropdown === col.accessor ? null : col.accessor)
      }
    >
      {filters[col.accessor]
        ? `${filters[col.accessor][0]?.toLocaleDateString() ?? "Start"} - ${
            filters[col.accessor][1]?.toLocaleDateString() ?? "End"
          }`
        : "Select Date Range"}
    </div>

    {/* Popup */}
    {openDropdown === col.accessor && (
      <div className="absolute z-30 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 w-[260px]">
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          {[
            { label: "3 Months", months: 3 },
            { label: "6 Months", months: 6 },
            { label: "1 Year", months: 12 },
            { label: "2 Years", months: 24 },
            { label: "All", months: 0 },
            { label: "Custom", months: -1 },
          ].map(({ label, months }) => (
            <label key={label} className="flex items-center gap-2">
              <input
                type="radio"
                name={`dateRange-${col.accessor}`}
                className="accent-blue-600"
                checked={filters[`${col.accessor}_preset`] === label}
                onChange={() => {
                  const end = new Date();
                  if (months > 0) {
                    const start = new Date();
                    start.setMonth(end.getMonth() - months);
                    handleFilterChange(col.accessor, [start, end]);
                  } else if (label === "All") {
                    handleFilterChange(col.accessor, [null, null]);
                  }
                  handleFilterChange(`${col.accessor}_preset`, label);
                }}
              />
              {label}
            </label>
          ))}

          {/* Custom From–To pickers */}
          {filters[`${col.accessor}_preset`] === "Custom" && (
            <div className="mt-2 space-y-2 pl-5">
              <div className="flex items-center gap-2">
                <span className="w-10">From</span>
                <DatePicker
                  selected={filters[col.accessor]?.[0] ?? null}
                  onChange={(date) =>
                    handleFilterChange(col.accessor, [
                      date,
                      filters[col.accessor]?.[1] ?? null,
                    ])
                  }
                  selectsStart
                  startDate={filters[col.accessor]?.[0]}
                  endDate={filters[col.accessor]?.[1]}
                  dateFormat="dd/MM/yyyy"
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full bg-white"
                  placeholderText="Select date"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10">To</span>
                <DatePicker
                  selected={filters[col.accessor]?.[1] ?? null}
                  onChange={(date) =>
                    handleFilterChange(col.accessor, [
                      filters[col.accessor]?.[0] ?? null,
                      date,
                    ])
                  }
                  selectsEnd
                  startDate={filters[col.accessor]?.[0]}
                  endDate={filters[col.accessor]?.[1]}
                  dateFormat="dd/MM/yyyy"
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full bg-white"
                  placeholderText="Select date"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-3">
          <button
            className="px-3 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              handleFilterChange(col.accessor, [null, null]);
              handleFilterChange(`${col.accessor}_preset`, "All");
              setOpenDropdown(null);
            }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-xs border rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setOpenDropdown(null)}
          >
            Apply
          </button>
        </div>
      </div>
    )}
  </div>
)}

                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100 text-xs bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={`${rowIndex}-${col.accessor}`}
                      className="px-4 py-2 text-gray-700 truncate"
                    >
                      {String(row[col.accessor] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 bg-white"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
