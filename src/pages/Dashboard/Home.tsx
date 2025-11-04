import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTaskCount,addUser, addCountries } from "../../store/userSlice";
import Loader from "../../components/loader";
import Pagination from "../../components/Pagination";

export default function Home() {
  const user = useSelector((state: any) => state.user.users);
  console.log("user",user);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const [totalRecords] = useState(taskCount.inProgress);
  const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));

  const columns = [
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

  const fetchData = async (arg: any, start: number, end: number) => {
    console.log(arg);
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
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    console.log(start, end);
    fetchData("Inbox", start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
    setPageChange(1, recordsPerPage);
  };

  useEffect(() => {
    fetchData('Inbox', 1, user.gridPageSize);
  }, []);
 useEffect(() => {
    fetchTasksCount();
    fetchCountries();
  }, []);

  return (
    <>
    <Loader isLoad={loading} />
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <EcommerceMetrics taskCount={taskCount}/>

          <MonthlySalesChart page={'Inbox'} />
        </div>



        <div className="col-span-12 mt-8">
          <BasicTables page={'Inbox'} inboxData={inboxData} columns={columns} />
        </div>
        <div className="col-span-12 mt-8">
  {inboxData.length > 0 &&(
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
        />)}
        </div>


      </div>
    </>
  );
}
