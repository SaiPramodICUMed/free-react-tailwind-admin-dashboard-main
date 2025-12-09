// SmartFilterTable.tsx  (aka BasicTableWithFIlter.tsx)
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";

type Column = {
  header: string;
  accessor: string;
  filterType?: string;
  filterOptions?: string[];
  min?: number;
  max?: number;
};

export default function SmartFilterTable<T extends Record<string, any>>({
  columns = [],
  data = [],
  searchData,
  setSelected,
  searchFilterData,
  viewDetails = false,
  handleViewDetails,
  handleCreate,
  createOption = false,
  checkBox = false,
}: {
  columns: Column[];
  data: T[];
  setSelected?: React.Dispatch<React.SetStateAction<T[]>>;
  searchData?: (data: Record<string, any>) => void;
  searchFilterData?: (data: Record<string, any>) => void;
  viewDetails?: boolean;
  handleViewDetails?: (row: any) => void;
  handleCreate?: (row: any) => void;
  createOption?: boolean;
  checkBox?: boolean;
}) {
  // table rows state with checked
  const [tableData, setTableData] = useState(
    data.map((d) => ({ ...d, checked: d.checked ?? false }))
  );

  // filters object; keys are accessor names (or accessor + "_preset" / "_search")
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [tempDateFilters, setTempDateFilters] = useState<Record<string, any>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const user = useSelector((state: any) => state.user.users);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // debounce refs
  const debounceRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  // date formatting helpers
  const formatToDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const getDaysFromToday = (dateString: string): string => {
    if (!dateString) return "0 days";
    const givenDate = new Date(dateString);
    const today = new Date();
    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - givenDate.getTime()) / (1000 * 60 * 60 * 24));
    return `- ${diffDays} days`;
  };

  // keep tableData in sync when parent `data` changes
  useEffect(() => {
    setTableData(data.map((d) => ({ ...d, checked: d.checked ?? false })));
  }, [data]);

  const toggleCheckbox = (index: number) => {
    const updated = [...tableData];
    updated[index].checked = !updated[index].checked;
    setTableData(updated);
    setSelected?.(updated);
  };

  const toggleAll = (checked: boolean) => {
    const updated = tableData.map((row) => ({ ...row, checked }));
    setTableData(updated);
    setSelected?.(updated);
  };

  const allChecked = tableData.length > 0 && tableData.every((r) => r.checked);
  const someChecked = tableData.some((r) => r.checked);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };
  const hideTooltip = () => setTooltip(null);

  // Click outside handler for dropdowns
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

  // -------------------------
  // Filter handling
  // -------------------------
  // Generic update helper: set or remove key
  const updateFilterKey = (accessor: string, value: any) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
        delete next[accessor];
      } else {
        next[accessor] = Array.isArray(value) ? [...value] : value;
      }
      return next;
    });
  };

  // called by text inputs, select dropdowns, range/date APPLY etc
  const handleFilterChange = (accessor: string, value: any) => {
    // for range/date we might pass arrays or presets; update accordingly
    updateFilterKey(accessor, value);
  };

  // For autocomplete suggestions (typing in inputs inside dropdowns)
  // We update filters so the displayed input matches, but also call searchFilterData immediately
  const handleSearchInput = (accessor: string, value: any) => {
    // update the internal filters input so UI stays in sync
    setFilters((prev) => {
      const next = { ...prev };
      if (value === "" || value === null) {
        delete next[accessor];
      } else {
        next[accessor] = value;
      }
      return next;
    });

    // fire suggestion handler immediately (this should NOT mutate filters in child)
    if (typeof searchFilterData === "function") {
      searchFilterData({ ...filters, [accessor]: value });
    }
  };

  // Debounced effect: when filters change (due to user action), call parent handlers
  useEffect(() => {
    // Skip first mount
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    // small debounce to reduce chattiness
    debounceRef.current = window.setTimeout(() => {
      const snapshot = { ...filters };

      if (typeof searchData === "function") {
        searchData(snapshot);
      }
      if (typeof searchFilterData === "function") {
        // depending on how parent expects these, call both (parent can dedupe)
        searchFilterData(snapshot);
      }
    }, 180);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // -------------------------
  // Helpers used in UI for multiSelect checkboxes
  // -------------------------
  const toggleMultiSelectOption = (accessor: string, option: string, checked: boolean) => {
    setFilters((prev) => {
      const current = Array.isArray(prev[accessor]) ? [...prev[accessor]] : [];
      let next: string[] = [];
      if (checked) {
        // add if not exists
        if (!current.includes(option)) current.push(option);
        next = current;
      } else {
        // remove
        next = current.filter((v) => v !== option);
      }
      // if empty remove key
      const dst = { ...prev };
      if (next.length === 0) delete dst[accessor];
      else dst[accessor] = next;
      return dst;
    });
  };

  const setMultiSelectAll = (accessor: string, options: string[]) => {
    setFilters((prev) => {
      const dst = { ...prev };
      dst[accessor] = [...options];
      return dst;
    });
  };

  const unsetMultiSelectAll = (accessor: string) => {
    setFilters((prev) => {
      const dst = { ...prev };
      delete dst[accessor];
      return dst;
    });
  };

  // -------------------------
  // Date preset helper: returns [startDate, endDate] or nulls
  // -------------------------
  const presetToRange = (months: number) => {
    if (months <= 0) return [null, null];
    const end = new Date();
    const start = new Date();
    // move start to months ago
    start.setMonth(end.getMonth() - months);
    // zero time
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div
        className="max-w-full overflow-x-auto relative"
        style={{ maxHeight: "480px", overflowY: "auto" }}
      >

        <table className="min-w-full table-fixed text-sm">
          <thead
            className="border-b border-gray-100 bg-[#0065bd] text-white sticky top-0 z-30"
          >

            <tr>
              {createOption && (
                <th className="px-5 py-3 font-medium text-white text-start text-sm w-[120px]">
                  Create
                </th>
              )}

              {checkBox && (
                <th
                  className="px-4 py-3 font-medium text-white text-start text-sm w-[40px] sticky left-0 z-40 bg-blue-800"
                  style={{ backgroundColor: "#0065bd" }}
                >
                  <input
                    type="checkbox"
                    className="cursor-pointer accent-blue-600"
                    checked={allChecked}
                    ref={(input) => {
                      if (input) input.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
              )}

              {viewDetails && (
                <th className="px-5 py-3 font-medium text-white text-start text-sm w-[120px]">
                  Actions
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-5 py-3 font-medium text-white text-start text-sm truncate w-[150px]"
                >
                  {col.header}
                </th>
              ))}
            </tr>

            {/* FILTER ROW */}
            <tr className="text-gray-700 text-xs bg-white sticky top-12 z-20">

              {createOption && (
                <th className="px-5 py-3 font-medium text-white text-start text-sm w-[120px]">
                  Create
                </th>
              )}

              {checkBox && (
                <th
                  className="px-4 py-3 font-medium text-white text-start text-sm w-[40px] sticky left-0 z-40"
                >
                  check
                </th>
              )}

              {viewDetails && (
                <th className="px-5 py-3 font-medium text-white text-start text-sm w-[120px]">
                  Actions
                </th>
              )}

              {columns.map((col) => {
                const filterType = col.filterType || "text";
                const selectedValues = filters[col.accessor] ?? [];

                return (
                  <th
                    key={col.accessor}
                    className="px-2 py-1 text-start bg-white relative"
                  >
                    {/* TEXT / AUTOCOMPLETE */}
                    {filterType === "text" && (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs bg-white"
                        value={filters[col.accessor] ?? ""}
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value.trim() === "" ? "" : e.target.value)
                        }
                        placeholder={`Search ${col.header}`}
                      />
                    )}

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
                            handleSearchInput(col.accessor, e.target.value)
                          }
                          placeholder={`Type to search`}
                          onFocus={() => setOpenDropdown(col.accessor)}
                        />

                        {openDropdown === col.accessor &&
                          (filters[col.accessor] ?? "") !== "" &&
                          (col.filterOptions ?? [])
                            .filter((opt: any) =>
                              String(opt?.name ?? opt)
                                .toLowerCase()
                                .includes(String(filters[col.accessor] ?? "").toLowerCase())
                            ).length > 0 && (

                            <ul className="absolute z-20 bg-white border border-gray-200 rounded-md mt-1 shadow overflow-auto max-h-48">
                              {(col.filterOptions ?? [])
                                .filter((opt: any) =>
                                  String(opt?.name ?? opt)
                                    .toLowerCase()
                                    .includes(String(filters[col.accessor] ?? "").toLowerCase())
                                )
                                .map((opt: any) => {
                                  const label = String(opt?.name ?? opt);

                                  return (
                                    <li
                                      key={label}
                                      onClick={() => {
                                        handleFilterChange(col.accessor, label);
                                        setOpenDropdown(null);
                                      }}
                                      className="px-2 py-1 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                                    >
                                      {label}
                                    </li>
                                  );
                                })}
                            </ul>
                          )}
                      </div>
                    )}


                    {/* SELECT */}
                    {filterType === "select" && (
                      <select
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white"
                        value={filters[col.accessor] ?? ""}
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value === "" ? "" : e.target.value)
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

                    {/* MULTISELECT */}
                    {filterType === "multiSelect" && (
                      <div
                        className="relative"
                        ref={(el) => (dropdownRef.current[col.accessor] = el)}
                      >
                        <div
                          className="border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white cursor-pointer truncate max-w-[100px]"
                          onClick={() =>
                            setOpenDropdown(openDropdown === col.accessor ? null : col.accessor)
                          }
                          title={
                            Array.isArray(selectedValues)
                              ? selectedValues.map((v: any) => v?.label ?? v).join(", ")
                              : ""
                          }
                        >
                          {Array.isArray(selectedValues) && selectedValues.length > 0
                            ? selectedValues
                              .map((v: any) => v?.label ?? String(v))
                              .join(", ").length > 25
                              ? selectedValues
                                .map((v: any) => v?.label ?? String(v))
                                .join(", ")
                                .slice(0, 25) + "..."
                              : selectedValues.map((v: any) => v?.label ?? String(v)).join(", ")
                            : `Select ${col.header}`}

                        </div>

                        {openDropdown === col.accessor && (
                          <div
                            className="absolute z-20 bg-white border border-gray-200 rounded-md mt-1 shadow-lg 
           max-h-60 overflow-y-auto p-1 w-[200px]"
                            style={{
                              right: "0px",   // ✅ force open toward LEFT
                              left: "auto",   // ✅ prevent overflow to right
                            }}
                          >


                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs mb-1"
                              value={filters[`${col.accessor}_search`] ?? ""}
                              onChange={(e) => {
                                handleFilterChange(`${col.accessor}_search`, e.target.value);
                                if (typeof searchFilterData === "function") {
                                  searchFilterData({
                                    ...filters,
                                    [`${col.accessor}_search`]: e.target.value,
                                  });
                                }
                              }}
                            />

                            <label className="flex items-center px-2 py-1 border-b text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  Array.isArray(filters[col.accessor]) &&
                                  Array.isArray(col.filterOptions) &&
                                  filters[col.accessor].length === col.filterOptions.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked)
                                    setMultiSelectAll(col.accessor, col.filterOptions ?? []);
                                  else unsetMultiSelectAll(col.accessor);
                                }}
                                className="mr-2"
                              />
                              {Array.isArray(filters[col.accessor]) &&
                                Array.isArray(col.filterOptions) &&
                                filters[col.accessor].length === col.filterOptions.length
                                ? "Unselect All"
                                : "Select All"}
                            </label>

                            {
                              (col.filterOptions ?? [])
                                .filter((opt: any) =>
                                  String(opt?.label ?? opt)
                                    .toLowerCase()
                                    .includes(
                                      String(filters[`${col.accessor}_search`] ?? "").toLowerCase()
                                    )
                                )
                                .map((opt: any) => {
                                  const label = String(opt?.label ?? opt);   // ✅ what user sees
                                  const value = opt?.value ?? label;        // ✅ what you filter by

                                  return (
                                    <label
                                      key={value}
                                      className="flex items-center px-2 py-1 text-xs hover:bg-blue-50 cursor-pointer whitespace-nowrap"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          Array.isArray(filters[col.accessor]) &&
                                          filters[col.accessor].includes(opt)
                                        }
                                        onChange={(e) =>
                                          toggleMultiSelectOption(
                                            col.accessor,
                                            opt,               // ✅ store FULL object for Segment
                                            e.target.checked
                                          )
                                        }
                                        className="mr-2"
                                      />
                                      {label}
                                    </label>
                                  );
                                })

                            }
                          </div>
                        )}
                      </div>
                    )}


                    {/* RANGE */}
                    {filterType === "range" && (
                      <div
                        className="relative"
                        ref={(el) => (dropdownRef.current[col.accessor] = el)}
                      >
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
                          <div
                            className="absolute z-30 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 w-[260px]"
                            style={{
                              right: "0px",   // ✅ forces popup to open toward LEFT
                              left: "auto",   // ✅ prevents overflow to right
                            }}
                          >

                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{col.min}</span>
                              <span>{col.max}</span>
                            </div>

                            <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden mb-3">
                              <div
                                className="absolute top-0 h-2 bg-blue-600 rounded"
                                style={{
                                  left: `${(((filters[col.accessor]?.[0] ?? col.min ?? 0) - (col.min ?? 0)) / ((col.max ?? 1000) - (col.min ?? 0))) * 100}%`,
                                  width: `${(((filters[col.accessor]?.[1] ?? col.max ?? 0) - (filters[col.accessor]?.[0] ?? col.min ?? 0)) / ((col.max ?? 1000) - (col.min ?? 0))) * 100}%`,
                                }}
                              ></div>
                            </div>

                            <div className="flex justify-between gap-2">
                              <input
                                type="number"
                                className="w-[45%] border border-gray-300 rounded-md px-2 py-1 text-xs"
                                placeholder="Min"
                                value={filters[col.accessor]?.[0] ?? ""}
                                onChange={(e) => {
                                  const minVal = e.target.value === "" ? "" : Number(e.target.value);
                                  const maxVal = filters[col.accessor]?.[1] ?? "";
                                  // if both empty, remove key
                                  if (minVal === "" && (maxVal === "" || maxVal == null)) {
                                    handleFilterChange(col.accessor, []);
                                  } else {
                                    handleFilterChange(col.accessor, [
                                      minVal === "" ? (col.min ?? 0) : minVal,
                                      maxVal === "" ? (col.max ?? 0) : maxVal,
                                    ]);
                                  }
                                }}
                              />
                              <input
                                type="number"
                                className="w-[45%] border border-gray-300 rounded-md px-2 py-1 text-xs"
                                placeholder="Max"
                                value={filters[col.accessor]?.[1] ?? ""}
                                onChange={(e) => {
                                  const maxVal = e.target.value === "" ? "" : Number(e.target.value);
                                  const minVal = filters[col.accessor]?.[0] ?? "";
                                  if (maxVal === "" && (minVal === "" || minVal == null)) {
                                    handleFilterChange(col.accessor, []);
                                  } else {
                                    handleFilterChange(col.accessor, [
                                      minVal === "" ? (col.min ?? 0) : minVal,
                                      maxVal === "" ? (col.max ?? 0) : maxVal,
                                    ]);
                                  }
                                }}
                              />
                            </div>

                            <div className="flex justify-between mt-3">
                              <button
                                className="px-3 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200"
                                onClick={() => {
                                  // cancel - reset temp to current filters
                                  setOpenDropdown(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 text-xs border rounded bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => {
                                  // apply is already updating via inputs; just close
                                  setOpenDropdown(null);
                                }}
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DATE RANGE */}
                    {filterType === "dateRange" && (
                      <div
                        className="relative"
                        ref={(el) => (dropdownRef.current[col.accessor] = el)}
                      >
                        <div
                          className="border border-gray-300 rounded-md px-2 py-1 text-gray-400 text-xs bg-white cursor-pointer text-center"
                          onClick={() =>
                            setOpenDropdown(openDropdown === col.accessor ? null : col.accessor)
                          }
                        >
                          {filters[col.accessor]
                            ? `${filters[col.accessor][0]?.toLocaleDateString() ?? "Start"} - ${filters[col.accessor][1]?.toLocaleDateString() ?? "End"}`
                            : "Select Date Range"}
                        </div>

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
                                    checked={tempDateFilters[`${col.accessor}_preset`] === label}
                                    onChange={() => {
                                      const end = new Date();
                                      if (months > 0) {
                                        const [start, finish] = presetToRange(months);
                                        setTempDateFilters((prev) => ({
                                          ...prev,
                                          [col.accessor]: [start, finish],
                                          [`${col.accessor}_preset`]: label,
                                        }));
                                      } else if (label === "All") {
                                        // "All" means remove the filter on apply
                                        setTempDateFilters((prev) => ({
                                          ...prev,
                                          [col.accessor]: [null, null],
                                          [`${col.accessor}_preset`]: label,
                                        }));
                                      } else if (label === "Custom") {
                                        setTempDateFilters((prev) => ({
                                          ...prev,
                                          [`${col.accessor}_preset`]: label,
                                          [col.accessor]: filters[col.accessor] || [null, null],
                                        }));
                                      }
                                    }}
                                  />
                                  {label}
                                </label>
                              ))}

                              {/* Custom Date Range */}
                              {tempDateFilters[`${col.accessor}_preset`] === "Custom" && (
                                <div className="mt-2 space-y-2 pl-5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-10">From</span>
                                    <DatePicker
                                      selected={tempDateFilters[col.accessor]?.[0] ?? null}
                                      onChange={(date) =>
                                        setTempDateFilters((prev) => ({
                                          ...prev,
                                          [col.accessor]: [date, prev[col.accessor]?.[1] ?? null],
                                        }))
                                      }
                                      selectsStart
                                      startDate={tempDateFilters[col.accessor]?.[0]}
                                      endDate={tempDateFilters[col.accessor]?.[1]}
                                      dateFormat="dd/MM/yyyy"
                                      className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full bg-white"
                                      placeholderText="Select date"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="w-10">To</span>
                                    <DatePicker
                                      selected={tempDateFilters[col.accessor]?.[1] ?? null}
                                      onChange={(date) =>
                                        setTempDateFilters((prev) => ({
                                          ...prev,
                                          [col.accessor]: [prev[col.accessor]?.[0] ?? null, date],
                                        }))
                                      }
                                      selectsEnd
                                      startDate={tempDateFilters[col.accessor]?.[0]}
                                      endDate={tempDateFilters[col.accessor]?.[1]}
                                      dateFormat="dd/MM/yyyy"
                                      className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full bg-white"
                                      placeholderText="Select date"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between mt-3">
                              <button
                                className="px-3 py-1 text-xs border rounded bg-gray-100 hover:bg-gray-200"
                                onClick={() => {
                                  // cancel - restore temp to current filters
                                  setTempDateFilters((prev) => ({
                                    ...prev,
                                    [col.accessor]: filters[col.accessor] ?? [null, null],
                                    [`${col.accessor}_preset`]: filters[`${col.accessor}_preset`] ?? "All",
                                  }));
                                  setOpenDropdown(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 text-xs border rounded bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => {
                                  // Apply:
                                  const preset = tempDateFilters[`${col.accessor}_preset`];
                                  const payloadRange = tempDateFilters[col.accessor] ?? [null, null];

                                  if (preset === "All") {
                                    // remove the date filter entirely
                                    handleFilterChange(col.accessor, []);
                                    handleFilterChange(`${col.accessor}_preset`, "All");
                                  } else {
                                    // set the date range
                                    handleFilterChange(col.accessor, payloadRange);
                                    handleFilterChange(`${col.accessor}_preset`, preset ?? "All");
                                  }
                                  setOpenDropdown(null);
                                }}
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

          <tbody className="divide-y divide-gray-100 text-xs">
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {createOption && (
                    <td className="px-4 py-3 w-[120px]">
                      <button
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleCreate?.(row)}
                      >
                        Create+
                      </button>
                    </td>
                  )}

                  {checkBox && (
                    <td
                      className="px-4 py-3 text-center w-[40px] sticky left-0 z-20 bg-white"
                      style={{
                        backgroundColor: "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        className="cursor-pointer accent-blue-600"
                        checked={row.checked}
                        onChange={() => toggleCheckbox(rowIndex)}
                      />
                    </td>
                  )}

                  {viewDetails && (
                    <td className="px-4 py-3 w-[120px]">
                      <button
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleViewDetails?.(row)}
                      >
                        Details
                      </button>
                    </td>
                  )}

                  {columns.map((col) => {
                    const cellValue = row[col.accessor] ?? "-";
                    const rawValue =
                      ["OriginalValue"].includes(col.accessor)
                        ? cellValue == null || cellValue === ""
                          ? "$ 0.00"
                          : `${user.currencyFormat} ${Number(cellValue).toFixed(2)}`
                        : ["UploadDate", "Created", "LastModified", "StartDate", "EndDate", "LastSaleDate"].includes(col.accessor)
                          ? formatToDate(cellValue)
                          : [
                            "GrossSales",
                            "GM",
                            "GMPerc",
                            "YRSales",
                            "GrossMargin",
                            "GMPercent",
                            "GrossASP",
                            "GM_P",
                            "ManagerMarginFloor",
                            "SalesmanMarginFloor",
                            "SegManagerFloor",
                            "SegSalesmanFloor",
                            "SegTargetPrice",
                            "LastYearSales",
                            "YRSalesTracing",
                            "OriginalValue",
                            "GrossSalesTracing"
                          ].includes(col.accessor)
                            ? (() => {
                              const num = Number(cellValue);
                              const safeValue = isNaN(num) ? 0 : num;
                              return `${user.currencyFormat} ${safeValue.toFixed(2)}`;
                            })()

                            : col.accessor === "Due"
                              ? getDaysFromToday(cellValue)
                              : cellValue ?? "-";

                    return (
                      <td
                        key={`${rowIndex}-${col.accessor}`}
                        className="px-4 py-3 text-gray-700 text-start truncate w-[150px] max-w-[150px] cursor-help overflow-hidden text-ellipsis whitespace-nowrap relative"
                        onClick={(e) => showTooltip(String(rawValue), e)}
                        onMouseEnter={(e) => showTooltip(String(rawValue), e)}
                        onMouseLeave={hideTooltip}
                      >
                        {String(rawValue)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (createOption ? 1 : 0) + (checkBox ? 1 : 0) + (viewDetails ? 1 : 0)} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {tooltip && (
          <div
            className="fixed z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-md pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              whiteSpace: "normal",
              maxWidth: "250px",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
