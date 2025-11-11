import { useState } from "react";


// Interface matching your JSON structure




export default function BasicTableOne<T extends Record<string, any>>({
  columns = [],
  data = [],
}: { columns: any[]; data: T[] }) {

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

   const formatToDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  function getDaysFromToday(dateString: string): string {
    if (!dateString) return "0 days";
    const givenDate = new Date(dateString);
    const today = new Date();

    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - givenDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return `- ${diffDays} days`;
  }

  const hideTooltip = () => setTooltip(null);
  
  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
      onClick={hideTooltip}
    >
      <div className="max-w-full overflow-x-auto relative">
        <table className="min-w-full table-fixed">
          {data.length > 0 && (
            <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-5 py-3 font-medium text-white text-start text-sm truncate w-[150px]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          )}
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.TaskId ?? rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    const cellValue = (col.accessor === "UploadDate" || col.accessor === "Created" || col.accessor === "LastModified" || col.accessor === "StartDate" || col.accessor === "EndDate" || col.accessor === "LastSaleDate") ? formatToDate(row[col.accessor]) 
                        : (col.accessor === "GrossSales" || col.accessor === "GM" || col.accessor === "GMPerc" || col.accessor === "YRSales" || col.accessor === "GrossMargin" || col.accessor === "GMPercent" || col.accessor === "GrossASP" || col.accessor === "GM_P" || col.accessor === "ManagerMarginFloor" || col.accessor === "SalesmanMarginFloor" || col.accessor === "SegManagerFloor" || col.accessor === "SegSalesmanFloor" || col.accessor === "SegTargetPrice" || col.accessor === "LastYearSales" || col.accessor === "YRSalesTracing") ? (row[col.accessor] == null || row[col.accessor] == undefined || row[col.accessor] == '') ? 0 : row[col.accessor]?.toFixed(2)
                        : col.accessor === "Due" ? getDaysFromToday(row[col.accessor]) 
                        : row[col.accessor] ?? "-";
                    return (
                      <td
                        key={`${rowIndex}-${col.accessor}`}
                        className="px-4 py-3 text-gray-700 dark:text-gray-300 text-start truncate w-[150px] max-w-[150px] cursor-help overflow-hidden text-ellipsis whitespace-nowrap relative"
                        onClick={(e) => showTooltip(String(cellValue), e)}
                        onMouseEnter={(e) => showTooltip(String(cellValue), e)}
                        onMouseLeave={hideTooltip}
                      >
                        {String(cellValue)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Custom Tooltip */}
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