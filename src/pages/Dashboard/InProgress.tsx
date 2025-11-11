import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTaskCount, addUser, addCountries, resetRecords } from "../../store/userSlice";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import { Navigate, useNavigate } from "react-router";
//import Bar from "../../components/Bar";
//import data from "../../data.json";

export default function InProgress() {
  const user = useSelector((state: any) => state.user.users);
  //console.log("user",user);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const [totalRecords] = useState(taskCount.inProgress);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );
  const [selectedRows, setSelectedRows] = useState([]);

  const columns: any = [
    {
      header: "Task Name",
      accessor: "Name",
      filterType: "text",
      filterOptions: ["Active", "Inactive", "Pending"],
    },
    {
      header: "Task Type",
      accessor: "TaskType",
      filterType: "select",
      filterOptions: ["Activedsfsfdsdfsf", "Inactive", "Pending"],
    },
    {
      header: "Status",
      accessor: "TaskStatus",
      filterType: "autocomplete",
      filterOptions: ["Active", "Inactive", "Pending"],
    },
    { header: "Account Names", accessor: "AccountNames" },
    { header: "Buying Group Names", accessor: "BuyingGroupNames" },
    { header: "Next", accessor: "FAO", filterType: "autocomplete" },
    {
      header: "Creator",
      accessor: "Owner",
      filterType: "multiSelect",
      filterOptions: ["Actived", "Inactive", "Pending"],
    },
    { header: "Created", accessor: "Created", filterType: "range" },
    {
      header: "Last Modified",
      accessor: "LastModified",
      filterType: "dateRange",
    },
    { header: "Items", accessor: "ItemCount" },
    { header: "Value", accessor: "OriginalValue" },
    { header: "Floor Breaks", accessor: "FloorBreaks" },
    { header: "Due", accessor: "Due" },
    { header: "Country", accessor: "CountryName" },
  ];

  const fetchData = async (arg: any, start: number, end: number) => {
    //console.log(arg, start, end);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        firstRow: start,
        lastRow: end,
        sortBy: "DeadlineOrdered",
        sortByDirection: "asc",
        filter: `AND (  1 <> 1  OR tab = '${arg}' )  AND tab = '${arg}'`,
        fieldList: "*",
        timeout: 0,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("API Response:", response.data);
      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };
  const fetchTasksCount = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Inbox/taskCounts/${user.userId}`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Task count API Response:", response.data);
      dispatch(addTaskCount(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };
 const navigate = useNavigate();
  const fetchCountries = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getUsersCountries/${user.userId}`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Countries API Response:", response.data);
      dispatch(addCountries(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    // console.log(start, end);
    fetchData("inprogress", start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    // console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  const selected = () => {
    //console.log("selectedRows",selectedRows);
    const selected = selectedRows.filter((row: any) => row.checked);
    if(selected.length===0){
      alert("Please select at least one record");
      return;
    }else{
    console.log("selected", selected);
    dispatch(resetRecords(selected));
   navigate("/confirmSelectionAccount");
    }
  };

  useEffect(() => {
    fetchData("inprogress", 1, user.gridPageSize);
  }, []);
  useEffect(() => {
    fetchTasksCount();
    fetchCountries();
  }, []);

  // console.log("columns", columns);
  // console.log("inboxData", inboxData);

  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span className="font-medium" onClick={()=>{navigate('/home')}}>Inbox</span> /
          <span className="text-gray-500 font-medium">&nbsp;Inprogress</span>
        </nav>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-8">
          <EcommerceMetrics taskCount={taskCount} />

          <MonthlySalesChart page={"In Progress"} />
          {/* <Bar/> */}
        </div>

        <div className="col-span-12 mt-8">
          {/* <div className="flex justify-end p-0">
            <button
              onClick={selected}
              className="bg-blue-800 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              Create
            </button>
          </div> */}
          <BasicTables
            page={"In Progress"}
            inboxData={inboxData}
            columns={columns}
            // checkBox={true}
            // setSelectedRows={setSelectedRows}
          />
        </div>
        <div className="col-span-12 mt-8">
          {inboxData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setPageChange}
              onRecordsPerPageChange={(val) => {
                changeRecordsPerPage(val);
                //setPageChange(1); // reset to first page on change
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
