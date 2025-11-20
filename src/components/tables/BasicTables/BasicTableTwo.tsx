import { useState, useEffect } from "react";

export default function BasicTableTwo<T extends Record<string, any>>({
  columns = [],
  data = [],
  setSelected,
  viewDetails = false,
  handleViewDetails,
  handleCreate,
  createOption=false,
  checkBox=false
}: {
  columns: any[];
  data: T[];
  setSelected?: React.Dispatch<React.SetStateAction<T[]>>;
  viewDetails?: boolean;
  handleViewDetails?: (row: any) => void;
  handleCreate?: (row: any) => void;
  createOption?:boolean;
  checkBox?:boolean;
}) {
  const [tableData, setTableData] = useState(
    data.map((d) => ({ ...d, checked: d.checked ?? false }))
  );

  useEffect(() => {
    setTableData(data.map((d) => ({ ...d, checked: d.checked ?? false })));
  }, [data]);

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [tableHeight, setTableHeight] = useState("60vh");

  const updateTableHeight = () => {
    const screenHeight = window.innerHeight;
    if (screenHeight < 600) setTableHeight("40vh");
    else if (screenHeight < 900) setTableHeight("55vh");
    else setTableHeight("65vh");
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

  const toggleCheckbox = (index: number) => {
    const updated = [...tableData];
    updated[index].checked = !updated[index].checked;
    setTableData(updated);
    setSelected?.(updated);
  };

  /** ✅ Toggle all checkboxes */
  const toggleAll = (checked: boolean) => {
    const updated = tableData.map((row) => ({ ...row, checked }));
    setTableData(updated);
    setSelected?.(updated);
  };

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

  const allChecked = tableData.length > 0 && tableData.every((r) => r.checked);
  const someChecked = tableData.some((r) => r.checked);

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
      onClick={hideTooltip}
    >
      <div
        className="max-w-full overflow-x-auto overflow-y-auto relative"
        style={{ maxHeight: tableHeight }}
      >
        <table className="min-w-full table-fixed">
          <thead className="border-b border-gray-100 bg-[#0065bd] sticky top-0 z-30">
            <tr>
              {/* ✅ Sticky Checkbox Header Fix */}
              { createOption&& (
                <th className="px-5 py-3 font-medium text-white text-start text-sm w-[120px]">
                  Create
                </th>

              )}
              {checkBox && (
              <th
                className="px-4 py-3 font-medium text-white text-start text-sm w-[40px] sticky left-0 z-40 bg-blue-800"
                style={{ backgroundColor: "#0065bd" }} // same as bg-blue-800
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
              </th>)}
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
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={row.TaskId ?? rowIndex} className="hover:bg-gray-50">
                  {createOption && (
                    <td className="px-4 py-3 w-[120px]">
                      <button
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleCreate?.(row)}
                      >
                        Details
                      </button>
                    </td>
                  )}
                  {/* ✅ Sticky Checkbox Column Fix */}
                  {checkBox && (
                  <td
                    className="px-4 py-3 text-center w-[40px] sticky left-0 z-20 bg-white"
                    style={{
                      backgroundColor: "white", // prevent blue gap
                    }}
                  >
                    <input
                      type="checkbox"
                      className="cursor-pointer accent-blue-600"
                      checked={row.checked}
                      onChange={() => toggleCheckbox(rowIndex)}
                    />
                  </td>)}
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
                     ["OriginalValue"].includes(
                        col.accessor
                      )
                        ?  cellValue == null || cellValue === ""
                          ? '$ 0.00'
                          :`$ ${ Number(cellValue).toFixed(2)}`:
                      ["UploadDate", "Created", "LastModified", "StartDate", "EndDate", "LastSaleDate"].includes(
                        col.accessor
                      )
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
                          "OriginalValue"
                        ].includes(col.accessor)
                          ? cellValue == null || cellValue === ""
                            ? 0
                            : Number(cellValue).toFixed(2)
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
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
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
