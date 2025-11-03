import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange: (value: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange,
  onRecordsPerPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 4) {
        startPage = 2;
        endPage = 5;
      }

      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
        endPage = totalPages - 1;
      }

      pages.push(1);
      if (startPage > 2) pages.push("...");
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate visible record range
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-3 bg-gray-50 border-t border-gray-200 px-4">
      {/* Left side - showing records */}
      <div className="text-gray-700 text-sm">
        Showing{" "}
        <span className="font-medium text-[#0f59ac]">
          {startRecord}–{endRecord}
        </span>{" "}
        of <span className="font-medium">{totalRecords}</span> records
      </div>

      {/* Center - pagination buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs border rounded hover:bg-[#0f59ac] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          « Prev
        </button>

        <div className="hidden sm:flex gap-2">
          {renderPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`dots-${index}`}
                className="px-3 py-1 text-gray-500 select-none text-xs"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                className={`px-3 py-1 border rounded shadow-sm text-xs ${
                  currentPage === page
                    ? "bg-[#0f59ac] text-white border-blue-600 font-semibold"
                    : "bg-white text-gray-700 hover:bg-[#0f59ac] hover:text-white"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-xs border rounded hover:bg-[#0f59ac] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Next »
        </button>
      </div>

      {/* Right side - records per page selector */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <label htmlFor="records" className="hidden sm:block">
          Rows per page:
        </label>
        <select
          id="records"
          value={recordsPerPage}
          onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {[10, 20, 50, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
