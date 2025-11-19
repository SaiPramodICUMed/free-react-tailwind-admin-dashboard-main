import BasicTables from "./Tables/BasicTables";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../../components/loader";
import { useNavigate } from "react-router";
import Pagination from "../../components/Pagination";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { Download, Eraser, Filter, ChevronDown } from "lucide-react";



export default function CurrentCurrency() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize || 10);
  const [filters, setFilters] = useState<{ CurrencyCode?: string }>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  const columns = [
    { header: "", accessor: " " },
    { header: "Currency Code", accessor: "CurrencyCode" },
    { header: "Currency Exchange Rate", accessor: "Rate" },
    { header: "", accessor: " " },
  ];

  // 🔹 Obtener datos desde la API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:63844/api/Currency/list");
      setInboxData(response.data || []);
      setFilteredData(response.data || []);
    } catch (error: any) {
      toast.error(`Unable to retrieve current currency exchange rates. ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Filtro único por CurrencyCode
  const uniqueCurrencyCodes = Array.from(
    new Set(inboxData.map((d) => d.CurrencyCode))
  );

  const handleFilter = (code: string | null) => {
    if (!code) {
      setFilters({});
      setFilteredData(inboxData);
    } else {
      setFilters({ CurrencyCode: code });
      setFilteredData(inboxData.filter((row) => row.CurrencyCode === code));
    }
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // 🔹 Exportar a Excel
  const exportTableToExcel = async (rows: any[]) => {
    if (!rows.length) {
      toast.warning("No data available to export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Currency");
    const currentYear = new Date().getFullYear();

    worksheet.mergeCells("A1:B1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${currentYear} Rates`;
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0070C0" } };
    titleCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:B2");
    const budgetCell = worksheet.getCell("A2");
    budgetCell.value = "Budget FX Rates";
    budgetCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF808080" } };
    budgetCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    budgetCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.getCell("A3").value = "Currency";
    worksheet.getCell("B3").value = "Rate";
    ["A3", "B3"].forEach((key) => {
      const cell = worksheet.getCell(key);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBEDAFF" } };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    rows.forEach((row, i) => {
      const r = i + 4;
      worksheet.getCell(`A${r}`).value = row.CurrencyCode;
      worksheet.getCell(`B${r}`).value = row.Rate;
    });

    worksheet.columns.forEach((col) => (col.width = 20));
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Currency_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 🔹 Paginación local
  const setPageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const changeRecordsPerPage = (recordsPerPage: number) => {
    setRecordsPerPage(recordsPerPage);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );


return (
  <>
    <Loader isLoad={loading} />

    {/* Breadcrumb */}
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/currency")}>
          Currency
        </span>{" / "}
        <span className="text-gray-500 font-medium">&nbsp;Current Exchange Rates</span>
      </nav>

    <PageMeta
      title="Current Exchange Rates"
      description="Table of current currency exchange rates"
    />

    <div className="grid grid-cols-6 gap-4 md:gap-3">
      <div className="col-span-12 mt-8">
        {/* 🔹 Botones */}
        <div className="w-full flex justify-end mb-3 gap-2">
          <button
            onClick={() => handleFilter(null)}
             className="bg-gray-200 hover:bg-blue-700 hover:text-white text-gray-700 font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Eraser size={16} /> Clear Filters
          </button>

          <button
            onClick={() => exportTableToExcel(filteredData)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Download
          </button>
        </div>

        {/* 🔹 Selector de filtro */}
        <div className="relative inline-block mb-4">
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)} // 👈 alternar menú
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 border border-blue-300 rounded hover:bg-blue-200"
          >
            <Filter size={14} />
            {filters.CurrencyCode ? filters.CurrencyCode : "Filter by Currency Code"}
            <ChevronDown size={14} />
          </button>

          {isFilterOpen && ( // 👈 solo muestra cuando está abierto
            <ul className="absolute left-0 mt-1 w-40 max-h-40 overflow-y-auto bg-white border border-gray-300 shadow-md z-50">
              <li
                onClick={() => handleFilter(null)}
                className="px-3 py-1 cursor-pointer hover:bg-blue-700 hover:text-white"
              >
                All
              </li>
              {uniqueCurrencyCodes.map((code) => (
                <li
                  key={code}
                  onClick={() => handleFilter(code)}
                  className="px-3 py-1 cursor-pointer hover:bg-blue-700 hover:text-white"
                >
                  {code}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🔹 Tabla centrada */}
        <div className="centered-table ">
  <BasicTables
    page="Current Exchange Rates"
    inboxData={paginatedData}
    columns={columns}
    checkBox={false}
    enableFilters={false}
    filterableColumns={[]}
    onColumnFilterChange={() => {}}
    columnFilters={{}}
    resetDateFilterTrigger={0}
    sortConfig={null}
    onSortChange={() => {}}
  />

  <style jsx>{`
    .centered-table table td,
    .centered-table table th {
      text-align: center !important; /* centra el texto */
    }
  `}</style>
</div>


        {/* 🔹 Paginación */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredData.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setPageChange}
            onRecordsPerPageChange={changeRecordsPerPage}
          />
        )}
      </div>
    </div>
  </>
);
}
