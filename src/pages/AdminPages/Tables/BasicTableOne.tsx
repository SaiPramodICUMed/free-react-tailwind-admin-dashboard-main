import { useState, useEffect, useMemo } from "react";
import DatePicker from "../../../components/form/date-picker";
import Input from "../../../components/form/input/InputField";

export default function BasicTableOne<T extends Record<string, any>>({
  columns = [],
  data = [],
  enableFilters = false,
  filterableColumns = [],
  onFilterChange,
  externalFilters = {},
  resetDateFilterTrigger,
  sortConfig,
  onSortChange
}: {
  columns: any[];
  data: T[];
  enableFilters?: boolean;
  filterableColumns?: string[];
  onFilterChange?: (filters: Record<string, string>) => void;
  externalFilters?: Record<string, string>;
  resetDateFilterTrigger?: number;
  sortConfig?: { column: string; direction: "asc" | "desc" } | null;
  onSortChange?: (sort: { column: string; direction: "asc" | "desc" } | null) => void;
}) {
  const [filters, setFilters] = useState<Record<string, string>>(externalFilters || {});

  useEffect(() => setFilters(externalFilters), [externalFilters]);

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleDateChange = (key: string, selectedDates: Date[]) => {
    const date = selectedDates[0];
    handleFilterChange(key, date ? date.toISOString().split("T")[0] : "");
  };

  const handleSortClick = (column: string) => {
    if (!onSortChange) return;

    if (!sortConfig || sortConfig.column !== column) {
      onSortChange({ column, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      onSortChange({ column, direction: "desc" });
    } else {
      onSortChange(null);
    }
  };

  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.column !== column) return null;
    return sortConfig.direction === "asc" ? " 🔼" : " 🔽";
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white w-full relative z-10">
      <div className="min-h-[50vh] sm:min-h-[60vh] md:min-h-[65vh] lg:min-h-[70vh]">
        <table className="min-w-full table-fixed">
          <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-5 py-3 font-medium text-white text-center text-sm truncate w-[150px] cursor-pointer select-none"
                  onClick={() => handleSortClick(col.accessor)}
                >
                  {col.header} {getSortIcon(col.accessor)}
                </th>
              ))}
            </tr>

            {enableFilters && (
              <tr className="bg-blue-50">
                {columns.map((col) => (
                  <th key={`filter-${col.accessor}`} className="px-3 py-2">
                    {filterableColumns.includes(col.accessor) ? (
                      col.accessor.toLowerCase().includes("date") ? (
                        <DatePicker
                          id={`filter-${col.accessor}`}
                          placeholder="Select a date"
                          defaultDate={filters[col.accessor] ? new Date(filters[col.accessor]) : undefined}
                          onChange={(dates) => handleDateChange(col.accessor, dates)}
                          resetTrigger={resetDateFilterTrigger}
                        />
                      ) : (
                        <Input
                          id={`filter-${col.accessor}`}
                          placeholder="Filter..."
                          value={filters[col.accessor] || ""}
                          onChange={(e) => handleFilterChange(col.accessor, e.target.value)}
                          className="text-xs"
                        />
                      )
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.TaskId ?? rowIndex} className="hover:bg-gray-200 dark:hover:bg-gray-700">
                  {columns.map((col) => {
                    const cellValue = row[col.accessor] ?? " ";
                    return (
                      <td
                        key={`${rowIndex}-${col.accessor}`}
                        className="px-4 py-3 text-gray-700 text-center truncate"
                      >
                        {col.cell ? col.cell(row) : String(cellValue)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
