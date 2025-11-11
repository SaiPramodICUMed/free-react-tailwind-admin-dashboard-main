import React, { useEffect, useState } from "react";
//import Pagination from "../../components/PageNation";
import axios from "axios";
import Loader from "../../components/loader";
import { useSelector } from "react-redux";
import BasicTables from "../Tables/BasicTables";

const ApprovalControls: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalRecords, setTotalRecords] = useState(1);
//   const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
//   const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
  const columns = [
    { header: "Approval Name", accessor: "approvalName" },
    { header: "Approval Control Name", accessor: "approvalControl" },
    { header: "Task Type", accessor: "hasTaskType" },
    { header: "Parameter", accessor: "parameter" },
    { header: "Approval Level", accessor: "approvalLevel" },
    { header: "Country", accessor: "countryName" },
  ];

//   const setPageChange = (pageNumber: any, listPerPage?: any) => {
//     const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage
//     setCurrentPage(pageNumber);
//     let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
//     let end =
//       pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
//     console.log(start, end);
//     fetchData(start, end);
//   };

//   const changeRecordsPerPage = (recordsPerPage: any) => {
//     console.log("on count change", recordsPerPage);
//     setRecordsPerPage(recordsPerPage);
//     setTotalPages(Math.ceil(totalRecords / recordsPerPage))
//     setPageChange(1, recordsPerPage);
//   };

  const fetchData = async (country:number) => {
    //console.log(arg);
    //setActiveTab(arg);
    setLoading(true);
    try {
      

      // 👈 second argument is the body (data)
      const response = await axios.get(
        `https://10.2.6.130:5000/api/Strategy/getRules/${country}`,
        
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

  

  useEffect(() => {
    
    fetchData(user.activeCountryId);
  }, []);
  
  return (
    <div className="bg-white p-6">
      <Loader isLoad={loading} />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          {/* <FaHome className="text-blue-600" /> */}
          <span className="font-medium">
            Strategy
          </span>
          {/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          {/* <span className="font-medium hover:text-blue-700 cursor-pointer">Inbox</span> */}
          /{/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          <span className="text-gray-500 font-medium">&nbsp;Approval Controls</span>
        </nav>

        {/* <h2 className="text-xl font-semibold text-blue-700">User Details</h2> */}

      </div>
      {/* Responsive Table inside the same container */}
      <div className="w-full">
              <BasicTables page="Segmentation-Approval Controls" inboxData={inboxData} columns={columns} />
            </div>  
      {/* {inboxData?.length !== 0 && (
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
      )} */}
    </div>
  );
};

export default ApprovalControls;
