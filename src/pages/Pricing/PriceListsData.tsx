import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";

import BasicTables from "../Tables/BasicTables";
import { useNavigate } from "react-router";
import Pagination from "../../components/Pagination";

export default function PriceListsData() {
  const user = useSelector((state: any) => state.user.users);
    const [inboxData, setInboxData] = useState([]);
    const [loading,setLoading]=useState(false);
    const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
  const columns = [   
    { header: "Name", accessor: "Name" },
    { header: "Description", accessor: "Description" },
    { header: "Type", accessor: "Type" },
    { header: "Header Id", accessor: "Id" },
    { header: "Contract ID", accessor: "ContractID" },
    { header: "Start Date", accessor: "StartDate" },
    { header: "End Date", accessor: "EndDate" },
    { header: "Active", accessor: "Active" },
    { header: "1 YR Sales", accessor: "LastYearSales" },
    { header: "1 YR Sales (traced)", accessor: "YRSalesTracing" },
    { header: "Last Sale Date", accessor: "LastSaleDate" },
    { header: "Items On Price List", accessor: "ItemCount" },
    { header: "Country", accessor: "CountryName" },
  ];

 const fetchData = async (start: number, end: number) => {
  //console.log(arg);
  setLoading(true);
  //setActiveTab(arg);
  try {
    const payload = {
      viewName: "vw_PriceLists",
      firstRow: start,
      lastRow: end,
      sortBy: "Id",
      sortByDirection: "asc",
      filter: `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`,
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
        viewName: `vw_PriceLists`,
        filter: `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`
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
    useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
  }, [recordsPerPage, totalRecords]);

  const navigate = useNavigate();

  return (
    <>
    <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span className="font-medium" onClick={()=>{navigate('/pricingDashBoard')}}>Pricing</span> /
          <span className="text-gray-500 font-medium">&nbsp;Price Lists</span>
        </nav>
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        
        <div className="col-span-12 mt-8">
          <BasicTables page={'Pricing - Price Lists'} inboxData={inboxData} columns={columns} />
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
