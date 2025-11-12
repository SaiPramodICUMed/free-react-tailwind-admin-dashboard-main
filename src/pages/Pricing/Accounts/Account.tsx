import axios from "axios";
import PageMeta from "../../../components/common/PageMeta";
import BasicTables from "../../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/loader";
import AccountsData from "../AccountsData";
import { useNavigate } from "react-router";
import { resetRecords } from "../../../store/userSlice";
import Pagination from "../../../components/Pagination";

export default function Account() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
   const taskCount = useSelector((state: any) => state.user.taskCount);
  const [totalRecords] = useState(taskCount.inProgress);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );
    const dispatch = useDispatch();
  const columns = [
    { header: "Account Name", accessor: "AccountName" },
    { header: "Account Number", accessor: "AccountNumber" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Customer Type", accessor: "Type" },
    { header: "Corporate Name", accessor: "ParentCompany" },
    { header: "Sales ChannelCode", accessor: "SalesChannelCode" },
    { header: "City", accessor: "City" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "1 YR Sales (traced)", accessor: "GrossSalesTracing" },
    { header: "Country", accessor: "CountryName" },
  ];

  const navigate = useNavigate();
  

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
    
    const newCustomer = () => {
      
     navigate("/confirmSelectionAccount");
      
    };

    const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    // console.log(start, end);
    fetchData(start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    // console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  const fetchData = async (start: number, end: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: "vw_Accounts",
        firstRow: start,
        lastRow: end,
        sortBy: "AccountName",
        sortByDirection: "asc",
        filter: `AND UserId = ${user.userId}`,
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

  useEffect(() => {
    fetchData(1, user.gridPageSize);
  }, []);

  return (
    <>
    <Loader isLoad={loading} />
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span className="font-medium" onClick={()=>{navigate('/pricingDashBoard')}}>Pricing</span> /
          <span className="text-gray-500 font-medium">&nbsp;Accounts - Account</span>
        </nav>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <AccountsData/>
        </div>
        <div className="col-span-12 mt-8">
          <div className="flex justify-end p-0">
            <button
              onClick={newCustomer}
              className="bg-blue-800 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors"
            >
              Create New Customer
            </button>
            <button
              onClick={selected}
              className="bg-blue-800 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors ml-10"
            >
              Create +
            </button>
          </div>
          <BasicTables page={'Pricing - Account'} inboxData={inboxData} columns={columns} checkBox={true}
            setSelectedRows={setSelectedRows}/>
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
