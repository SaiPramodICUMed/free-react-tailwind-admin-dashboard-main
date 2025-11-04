import { useState } from "react";

interface Column {
  header: string;
  accessor: string;
}

export default function BasicTableOne<T extends Record<string, any>>({
  columns = [],
  data = [],
  checkBox = false, // ✅ new prop
}: {
  columns: Column[];
  data: T[];
  checkBox?: boolean;
}) {
  // ✅ Add checkbox state only if checkBox = true
  const [tableData, setTableData] = useState(
    checkBox ? data.map((d) => ({ ...d, checked: false })) : data
  );

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(
    null
  );

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const hideTooltip = () => setTooltip(null);

  const toggleCheckbox = (rowIndex: number) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, checked: !row.checked } : row
      )
    );
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
      onClick={hideTooltip}
    >
      <div className="max-w-full overflow-x-auto relative">
        <table className="min-w-full table-fixed">
          <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-blue-800">
            <tr>
              {/* ✅ Conditionally render checkbox header */}
              {checkBox && (
                <th className="px-4 py-3 font-medium text-white text-start text-sm w-[40px]">
                  <input
                    type="checkbox"
                    className="cursor-pointer accent-blue-600"
                    checked={
                      tableData.length > 0 &&
                      tableData.every((r: any) => r.checked)
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTableData((prev) =>
                        prev.map((row: any) => ({ ...row, checked }))
                      );
                    }}
                  />
                </th>
              )}

              {/* Other headers */}
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

          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr
                  key={row.TaskId ?? rowIndex}
                  className="hover:bg-gray-50"
                >
                  {/* ✅ Conditionally render checkbox column */}
                  {checkBox && (
                    <td className="px-4 py-3 text-center w-[40px]">
                      <input
                        type="checkbox"
                        className="cursor-pointer accent-blue-600"
                        checked={(row as any).checked}
                        onChange={() => toggleCheckbox(rowIndex)}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((col) => {
                    const cellValue = row[col.accessor] ?? "-";
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
                  colSpan={columns.length + (checkBox ? 1 : 0)}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Tooltip */}
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
