import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "./Tables/BasicTables";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/loader";
import { useNavigate } from "react-router";
import Pagination from "../../components/Pagination";
import * as XLSX from "xlsx";
import { Save, Eraser, Download } from "lucide-react";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";

export default function UpdateCurrency() {
  const user = useSelector((state: any) => state.user.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize || 10);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [isImportEnabled, setIsImportEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{ type: string; title: string; message: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const columns = [
    { header: "Currency Code", accessor: "code" },
    { header: "Current Exchange Rate", accessor: "currentRate" },
    { header: "New Exchange Rate", accessor: "newRate" },
    {
      header: "Difference",
      accessor: "difference",
      cell: (row: any) => (
        <span
          style={{
            color: row.difference > 0 ? "green" : row.difference < 0 ? "red" : "black",
          }}
        >
          {row.difference !== null
            ? `${row.difference > 0 ? "+" : ""}${row.difference.toFixed(6)}`
            : "-"}
        </span>
      ),
    },
  ];

  const fetchCurrencyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://localhost:63844/api/Currency/list");
      return response.data || [];
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: `There was a problem retrieving data from the database. ${error.message || error}`,
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currencyData = await fetchCurrencyData();
    if (!currencyData.length) {
      setAlert({
        type: "error",
        title: "Error",
        message: `There was a problem retrieving data from the database.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const processedRows = jsonData.slice(3).map((row: any) => {
        const code = row[0]?.toString().slice(0, 3) || "";
        const newRateValue = row[1];
        const matchedCurrency = currencyData.find(
          (c: any) => c.CurrencyCode.toUpperCase() === code.toUpperCase()
        );

        const currentRate = matchedCurrency ? Number(matchedCurrency.Rate) : null;

       const newRate =
        newRateValue && !isNaN(newRateValue)
          ? parseFloat((1 / +newRateValue).toFixed(7))  // redondea a 8 decimales
          : null;


        const EPSILON = 0.00001; // umbral de tolerancia
        const diffValue = currentRate !== null && newRate !== null ? newRate - currentRate : null;

        const difference =
          diffValue !== null
            ? Math.abs(diffValue) < EPSILON
              ? 0
              : Number(diffValue.toFixed(6)) // redondea a 6 decimales
            : null;


        return { code, currentRate, newRate, difference };
      });

      setRows(processedRows);
      setIsSaveEnabled(true);
      setIsImportEnabled(false);
      setCurrentPage(1);
    };

    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
    fileInputRef.current.click();   
  }
};


  const handleSaveUpdates = async () => {
    const payload = rows.map((row) => ({
      CurrencyCode: row.code,
      NewRate: parseFloat(row.newRate as string),
      User: user.userId.toString(),
    }));

    try {
      const response = await axios.post(
        "https://localhost:63844/api/Currency/update",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setAlert({
        type: "success",
        title: "Success",
        message: response.data.message || "Update Completed",
      });

      setTimeout(() => {
        setRows([]);
        setIsSaveEnabled(false);
        setIsImportEnabled(true);
      }, 3000);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Error",
        message: `Failed to update currency. ${error.message || error}`,
      });
    }
  };

  const totalPages = Math.ceil(rows.length / recordsPerPage);
  const paginatedData = rows.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleConfirmSave = () => setIsConfirmOpen(true);

  const confirmSave = async () => {
    setIsConfirmOpen(false);
    await handleSaveUpdates();
  };

  // Función para reiniciar todo
const handleReset = () => {
  setRows([]);
  setIsSaveEnabled(false);
  setIsImportEnabled(true);
  setCurrentPage(1);
  setAlert(null);

  if (fileInputRef.current) fileInputRef.current.value = ""; // limpiar input
};


useEffect(() => {
  if (alert) {
    const timer = setTimeout(() => {
      setAlert(null);
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [alert]);


  return (
    <>
      <Loader isLoad={loading} />

      {alert && (
        <div className="mb-4">
          <Alert
            variant={alert.type}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        </div>
      )}

      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span
          className="font-medium cursor-pointer"
          onClick={() => navigate("/currency")}
        >
          Currency
        </span>{" "}
        / <span className="text-gray-500 font-medium">&nbsp;Import/Update</span>
      </nav>

      <PageMeta title="Import/Update" description="Upload and update currency rates" />

    <div className="grid grid-cols-6 gap-4 md:gap-3"></div>
      <div className="col-span-12 mt-8">
        <div className="w-full flex justify-end mb-3 gap-2">
          <button
              onClick={() => {
                if (!isImportEnabled) return; // <-- previene abrir el explorador
                triggerFileInput();
              }}       
              className={` text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2
                ${isImportEnabled ? "bg-blue-800 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
              `}
            >
              <Download size={16} /> Import Excel File
          </button>

          <button
            onClick={handleConfirmSave}
            disabled={!isSaveEnabled}
            className={` text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2
              ${isSaveEnabled ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}
            `}
          >
            <Save size={16} /> Save Updates
          </button>

          <button
            onClick={handleReset}
            className={`text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2
              ${isSaveEnabled 
                ? "bg-blue-800 hover:bg-blue-700" // azul cuando hay datos importados
                : "bg-gray-400 cursor-not-allowed" // gris al inicio
              }`}
          >
            <Eraser size={16} /> Clear
          </button>


          
        </div>

        <div className="centered-table">
          <BasicTables
            page="Import/Update"
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

        </div>

        {rows.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={rows.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
            onRecordsPerPageChange={setRecordsPerPage}
          />
        )}

        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        showCloseButton={true}
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Confirm Update
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to save these changes? This will update the currency exchange rates.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmSave}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
