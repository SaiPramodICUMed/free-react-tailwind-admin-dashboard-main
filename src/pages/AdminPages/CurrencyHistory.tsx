import BasicTables from "./Tables/BasicTables";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/loader";
import { useNavigate } from "react-router";
import Pagination from "../../components/Pagination";
import PageMeta from "../../components/common/PageMeta";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { Download, Eraser } from "lucide-react";
import axios from "axios";

export default function CurrencyHistory() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize || 10);
  const [resetDateFilterTrigger, setResetDateFilterTrigger] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: "asc" | "desc" } | null>(null);

  const navigate = useNavigate();

  const EPSILON = 1e-5; // Umbral de tolerancia

  // 🔹 Definir columnas
  const columns = useMemo(() => [
    { header: "Currency Code", accessor: "CurrencyCode" },
    { header: "Previous Exchange Rate", accessor: "OldRate" },
    { header: "Updated Exchange Rate", accessor: "NewRate" },
    {
      header: "Difference",
      accessor: "Difference",
      cell: (row: any) => {
        let value = row.Difference ?? 0;
        if (Math.abs(value) < EPSILON) value = 0;

        let colorClass = "text-black";
        if (value > 0) colorClass = "text-green-600";
        else if (value < 0) colorClass = "text-red-600";
        else colorClass = "text-gray-500";

        return <span className={colorClass}>{value.toFixed(6)}</span>;
      },
    },
    { header: "User Name", accessor: "UserName" },
    { header: "Date", accessor: "ModifiedDate" },
    { header: "ExecutionId", accessor: "UserFriendlyId" },
  ], []);

  // 🔹 Obtener datos desde la API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:63844/api/Currency/history");
      const data = response.data || [];

      const dataWithDifference = data.map((row: any) => {
        const diffValue = row.NewRate - row.OldRate;
        const Difference =
          diffValue !== null
            ? Math.abs(diffValue) < EPSILON
              ? 0
              : Number(diffValue.toFixed(6))
            : null;
        return { ...row, Difference };
      });

      setInboxData(dataWithDifference);
    } catch (error: any) {
      toast.error(`Unable to retrieve currency history updates. ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleColumnFilterChange = (newFilters: Record<string, string>) => {
    setColumnFilters(newFilters);
    setCurrentPage(1);
  };

  // 🔹 Filtrado
  const fullyFilteredData = useMemo(() => {
    return inboxData.filter((row) =>
      columns.every((col) => {
        const filterValue = columnFilters[col.accessor];
        if (!filterValue) return true;
        return String(row[col.accessor] ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    );
  }, [inboxData, columnFilters, columns]);

  // 🔹 Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortConfig) return fullyFilteredData;
    const { column, direction } = sortConfig;
    return [...fullyFilteredData].sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }
      return direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [fullyFilteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / recordsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleClearFilters = () => {
    setColumnFilters({});
    setResetDateFilterTrigger(prev => prev + 1);
  };

  // 🔹 Exportar a Excel
  const exportTableToExcel = async () => {
    if (!sortedData.length) {
      toast.warning("No data available to export.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Currency History");

      worksheet.mergeCells("A1", `${String.fromCharCode(65 + columns.length - 1)}1`);
      worksheet.getCell("A1").value = `Currency Updates History`;
      worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getRow(1).font = { bold: true, size: 14 };

      worksheet.addRow(columns.map((c) => c.header));
      worksheet.getRow(2).font = { bold: true };
      worksheet.getRow(2).alignment = { horizontal: "center" };

      sortedData.forEach((row) => {
        worksheet.addRow(columns.map((col) => {
          const value = row[col.accessor];
          if (col.accessor.toLowerCase().includes("date") && value) {
            try { return new Date(value).toLocaleDateString(); } catch { return value; }
          }
          if (col.accessor === "Difference" && typeof value === "number") {
            return value.toFixed(6);
          }
          return value ?? "";
        }));
      });

      worksheet.columns.forEach((col) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? cell.value.toString().length : 0;
          if (len > maxLength) maxLength = len;
        });
        col.width = maxLength + 4;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `CurrencyHistory_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while exporting the Excel file.");
    }
  };

  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/currency")}>
          Currency
        </span>{" / "}
        <span className="text-gray-500 font-medium">&nbsp;Currency Exchange Rates History</span>
      </nav>

      <PageMeta title="Currency Exchange Rates History" description="Currency exchange rate history" />

      <div className="col-span-12 mt-8">
        <div className="w-full flex justify-end mb-3 gap-2">
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-blue-700 hover:text-white text-gray-700 font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Eraser size={16} /> Clear Filters
          </button>

          <button
            onClick={exportTableToExcel}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Download
          </button>
        </div>

        <div className="centered-table">
          <BasicTables
            page="Currency Exchange Rates History"
            inboxData={paginatedData}
            columns={columns}
            enableFilters
            filterableColumns={["CurrencyCode","UserFriendlyId","ModifiedDate","UserName"]}
            onColumnFilterChange={handleColumnFilterChange}
            columnFilters={columnFilters}
            resetDateFilterTrigger={resetDateFilterTrigger}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
          />
        </div>

        {sortedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={sortedData.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
            onRecordsPerPageChange={setRecordsPerPage}
          />
        )}
      </div>
    </>
  );
}
