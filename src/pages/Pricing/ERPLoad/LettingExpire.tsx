import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../../components/loader";

import BasicTables from "../../Tables/BasicTables";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import ERPLOadData from "../ERPLoadData";
import Pagination from "../../../components/Pagination";

export default function LettingExpire() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
 const columns = [
    { header: "Task Id", accessor: "TaskId" },
    { header: "Task Type", accessor: "TaskTypeName" },
    { header: "PL Name", accessor: "Name" },
    { header: "PL Desc", accessor: "Description" },
    { header: "PL Comment", accessor: "Comments" },
    { header: "New PL Start Date", accessor: "StartDate" },
    { header: "# Items", accessor: "ItemCount" },
    { header: "Qualifiers", accessor: "Active" },
    { header: "Status", accessor: "LoadStatus" },
    //{ header: "Action", accessor: "YRSalesTracing" },
  ];


  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    console.log(start, end);
    fetchData(start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
    setPageChange(1, recordsPerPage);
  };


 const fetchData = async (start: number, end: number) => {
    //console.log(arg);
    //setActiveTab(arg);
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 4)`,
        firstRow: start,
        lastRow: end,
        sortBy: "TaskId",
        sortByDirection: "asc",
        filter: `AND (  1 <> 1  OR LoadStatus = 4 )`,
        fieldList: "*",
        timeout: 0
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

  const fetchCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 4)`,
        filter: ` AND (  1 <> 1  OR LoadStatus = 4 ) `
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCount();
    fetchData(1, user.gridPageSize);
  }, []);
  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
  }, [recordsPerPage, totalRecords]);
  const navigate = useNavigate();

  return (
    <>
    <Loader isLoad={loading} />
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span className="font-medium" onClick={()=>{navigate('/pricingDashBoard')}}>Pricing</span> /
          <span className="text-gray-500 font-medium">&nbsp;ERP Load - Completed Tasks</span>
        </nav>
      <PageMeta
        title="Pricing Tool"
        description=""
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <ERPLOadData/>
        </div>
        <div className="col-span-12">
          
          <BasicTables page={'Pricing - ERP Load - Letting Expire'} inboxData={inboxData} columns={columns} 
            />
        </div>
<div className="col-span-12">
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
