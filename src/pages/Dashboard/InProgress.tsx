import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTaskCount, addCountries, resetRecords } from "../../store/userSlice";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
//import data from "../../data.json";

export default function InProgress() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords] = useState(taskCount.inProgress || 0);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );
  const [chartOpen, setChartOpen] = useState(false);

  const columns: any = [
    { header: "Task Name", accessor: "Name" },
    { header: "Task Type", accessor: "TaskType" },
    { header: "Status", accessor: "TaskStatus" },
    { header: "Account Names", accessor: "AccountNames" },
    { header: "Buying Group Names", accessor: "BuyingGroupNames" },
    { header: "Next", accessor: "FAO" },
    { header: "Creator", accessor: "Owner" },
    { header: "Created", accessor: "Created" },
    { header: "Last Modified", accessor: "LastModified" },
    { header: "Items", accessor: "ItemCount" },
    { header: "Value", accessor: "OriginalValue" },
    { header: "Floor Breaks", accessor: "FloorBreaks" },
    { header: "Due", accessor: "Due" },
    { header: "Country", accessor: "CountryName" },
  ];

  const handleViewDetails = (row:any) => {
  console.log("Parent received:", row);
};

  const fetchData = async (tab: string, start: number, end: number) => {
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
    } catch (error: any) {
      console.error("Error fetching In Progress data:", error.message);
      setLoading(false);
    }
  };

  const fetchTasksCount = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Inbox/taskCounts/${user.userId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(addTaskCount(response.data));
    } catch (error: any) {
      console.error("Error fetching task count:", error.message);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getUsersCountries/${user.userId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(addCountries(response.data));
    } catch (error: any) {
      console.error("Error fetching countries:", error.message);
    }
  };

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * noOfrecordsPerPage + 1;
    const end = pageNumber * noOfrecordsPerPage;
    fetchData("inprogress", start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  useEffect(() => {
    fetchData("inprogress", 1, user.gridPageSize);
    fetchTasksCount();
    fetchCountries();
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
          In Progress
        </span>
      </nav>

      <PageMeta
        title="Pricing Tool"
        description=""
      />

      <div className="space-y-3">
        {/* ✅ Compact animated metrics */}
        <EcommerceMetrics taskCount={taskCount} />

        {/* ✅ Collapsible Chart Section - Same as Home */}
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
              <MonthlySalesChart page={"In Progress"} />
            </div>
          )}
        </div>

        {/* ✅ Table */}
        <BasicTables page={"In Progress"} inboxData={inboxData} columns={columns} checkBox={true} handleViewDetails={handleViewDetails} viewDetails={false}/>

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
