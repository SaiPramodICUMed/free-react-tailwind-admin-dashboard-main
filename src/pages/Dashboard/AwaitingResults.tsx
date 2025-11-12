import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AwaitingResults() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords] = useState(taskCount.awaitingResults || 0);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );
  const [chartOpen, setChartOpen] = useState(false);

  const navigate = useNavigate();

  const columns = [
    { header: "Task Name", accessor: "Name" },
    { header: "Task Type", accessor: "TaskType" },
    { header: "Status", accessor: "TaskStatus" },
    { header: "Account Names", accessor: "AccountNames" },
    { header: "Buying Group Names", accessor: "BuyingGroupNames" },
    { header: "Creator", accessor: "Owner" },
    { header: "Created", accessor: "Created" },
    { header: "Last Modified", accessor: "LastModified" },
    { header: "Items", accessor: "ItemCount" },
    { header: "Value", accessor: "OriginalValue" },
    { header: "Floor Breaks", accessor: "FloorBreaks" },
    { header: "Country", accessor: "CountryName" },
  ];

  const fetchData = async (tab: any, start: number, end: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        firstRow: start,
        lastRow: end,
        sortBy: "DeadlineOrdered",
        sortByDirection: "asc",
        filter: `AND (1 <> 1 OR tab = '${tab}') AND tab = '${tab}'`,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching Awaiting Results data:", error.message);
      setLoading(false);
      return null;
    }
  };

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * noOfrecordsPerPage + 1;
    const end = pageNumber * noOfrecordsPerPage;
    fetchData("AwaitingResults", start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  useEffect(() => {
    fetchData("AwaitingResults", 1, user.gridPageSize);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  return (
    <>
      <Loader isLoad={loading} />

      {/* 🔹 Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>{" "}
        /{" "}
        <span className="text-gray-500 font-medium cursor-pointer">
          Awaiting Results
        </span>
      </nav>

      <PageMeta
        title="Pricing Tool - Awaiting Results"
        description="Inbox Awaiting Results Dashboard"
      />

      <div className="space-y-3">
        {/* ✅ Compact animated metrics (same as Home) */}
        <EcommerceMetrics taskCount={taskCount} />

        {/* ✅ Collapsible Chart Section - Consistent with Home/Drafts/InProgress */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setChartOpen(!chartOpen)}
            className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <span>📊 Summary</span>
            {chartOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {chartOpen && (
            <div className="p-3 border-t border-gray-100">
              <MonthlySalesChart page={"Awaiting Results"} />
            </div>
          )}
        </div>

        {/* ✅ Table */}
        <BasicTables page={"Awaiting Results"} inboxData={inboxData} columns={columns} />

        {/* ✅ Pagination */}
        {inboxData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setPageChange}
            onRecordsPerPageChange={(val) => changeRecordsPerPage(val)}
          />
        )}
      </div>
    </>
  );
}
