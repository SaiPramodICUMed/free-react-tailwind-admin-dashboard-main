import { useState, useEffect } from "react";

export default function BasicTableOne<T extends Record<string, any>>({
  columns = [],
  data = [],
}: { columns: any[]; data: T[] }) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [tableHeight, setTableHeight] = useState("60vh");

  /** 🔹 Dynamically adjust height based on screen size */
  const updateTableHeight = () => {
    const screenHeight = window.innerHeight;

    if (screenHeight < 600) {
      setTableHeight("40vh"); // mobile
    } else if (screenHeight < 900) {
      setTableHeight("55vh"); // tablets/small laptops
    } else {
      setTableHeight("65vh"); // desktops
    }
  };

  useEffect(() => {
    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);
    return () => window.removeEventListener("resize", updateTableHeight);
  }, []);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const hideTooltip = () => setTooltip(null);

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

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
      onClick={hideTooltip}
    >
      {/* ✅ Responsive height & scroll only inside table */}
      <div
        className="max-w-full overflow-x-auto overflow-y-auto relative"
        style={{
          maxHeight: tableHeight,
        }}
      >
        <table className="min-w-full table-fixed">
          {data.length > 0 && (
            <thead className="border-b border-gray-100 bg-[#0065bd] sticky top-0 z-10">
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

          <tbody className="divide-y divide-gray-100 text-xs">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.TaskId ?? rowIndex} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    
                    const rawValue = row[col.accessor];
                    const cellValue =
                      ["OriginalValue"].includes(
                        col.accessor
                      )
                        ?  rawValue == null || rawValue === ""
                          ? '$0.00'
                          :`$${ Number(rawValue).toFixed(2)}`:
                      ["UploadDate", "Created", "LastModified", "StartDate", "EndDate", "LastSaleDate"].includes(
                        col.accessor
                      )
                        ? formatToDate(rawValue)
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
                            //"OriginalValue"
                          ].includes(col.accessor)
                        ? rawValue == null || rawValue === ""
                          ? 0
                          : Number(rawValue).toFixed(2)
                        : col.accessor === "Due"
                        ? getDaysFromToday(rawValue)
                        : rawValue ?? "-";

                    return (
                      <td
                        key={`${rowIndex}-${col.accessor}`}
                        className="px-4 py-3 text-gray-700 text-start truncate w-[150px] max-w-[150px] cursor-help overflow-hidden text-ellipsis whitespace-nowrap"
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
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Floating Tooltip */}
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
