import React, { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import Pagination from "../../components/Pagination";
import axios from "axios";
import Loader from "../../components/loader";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BasicTables from "../Tables/BasicTables";

const Templates: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const navigate = useNavigate();
  const columns = [
    { header: "Name", accessor: "Name" },
    { header: "File", accessor: "Name" },
    { header: "Upload Date", accessor: "UploadDate" },
    { header: "User", accessor: "UserID" },
    { header: "Format", accessor: "Format" },
    { header: "Fields", accessor: "StrategyTabAccess" },
  ];

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    console.log(start, end);
    fetchData(start, end, user.activeCountryId);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
    setPageChange(1, recordsPerPage);
  };
  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };
  const fetchData = async (start: number, end: number, country: number) => {
    //console.log(arg);
    //setActiveTab(arg);
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.f_vw_Templates(${country})`,
        firstRow: start,
        lastRow: end,
        sortBy: "UserId",
        sortByDirection: "asc",
        filter: ``,
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

  const fetchCount = async (country: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.f_vw_Templates(${country})`,
        filter: ``
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Promo Count", response.data);
      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCount(user.activeCountryId);
    fetchData(1, user.gridPageSize, user.activeCountryId);
  }, []);
  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
  }, [recordsPerPage, totalRecords]);
  useEffect(() => {
    fetchCount(selectedValue);
    fetchData(1, user.gridPageSize, selectedValue);
  }, [selectedValue]);
  return (
    <div className="bg-white p-6">
      <Loader isLoad={loading} />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          {/* <FaHome className="text-blue-600" /> */}
          <span className="font-medium">
            Admin
          </span>
          {/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          {/* <span className="font-medium hover:text-blue-700 cursor-pointer">Inbox</span> */}
          /{/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          <span className="text-gray-500 font-medium">&nbsp;Templates</span>
        </nav>

        <div className=" top-0 right-0">
          <select id="fruit-select" value={selectedValue} onChange={handleChange}
            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
            {countries.map((option: any) => (
              <option key={option.countryId} value={option.countryId}>
                {option.countryName}
              </option>
            ))}
          </select>
        </div>

        {/* <h2 className="text-xl font-semibold text-blue-700">User Details</h2> */}

      </div>
      {/* Responsive Table inside the same container */}
      <div className="w-full">
        <BasicTables page="Admin-Templates" inboxData={inboxData} columns={columns} />
      </div>
      {inboxData?.length !== 0 && (
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
  );
};

export default Templates;
