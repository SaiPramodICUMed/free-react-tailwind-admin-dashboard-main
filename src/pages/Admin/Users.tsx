import React, { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import Pagination from "../../components/Pagination";
import axios from "axios";
import Loader from "../../components/loader";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BasicTables from "../Tables/BasicTables";
import PageMeta from "../../components/common/PageMeta";

const Users: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [columnRoles, setColumnRoles] = useState([]);
  const [columnRolesCount, setColumnRolesCount] = useState([]);
  const [approvalRoles, setApprovalRoles] = useState([]);
  const [approvalRolesCount, setApprovalRolesCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const navigate = useNavigate();
  const columns = [
    { header: "Name", accessor: "UserName" },
    { header: "Email", accessor: "Email" },
    { header: "Employee Number", accessor: "EmployeeNumber" },
    { header: "Approval Role", accessor: "ApprovalRoleId" },
    { header: "Restrictions", accessor: "ColumnRoleName" },
    { header: "Strategy?", accessor: "StrategyTabAccess" },
    { header: "SpotCodes Restrictions?", accessor: "ViewAllSpotCodes" },
    { header: "User Links Restrictions?", accessor: "ViewAllUsers" },
    { header: "Emails", accessor: "EnableEmail" },
    { header: "User Links", accessor: "Links" },
    { header: "Validate", accessor: "PromoLimit2" },
    { header: "Commands", accessor: "PromoLimit3" },
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
        viewName: `vw_Users`,
        firstRow: start,
        lastRow: end,
        sortBy: "UserId",
        sortByDirection: "asc",
        filter: `AND CountryId = '${country}'`,
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
        viewName: `vw_Users`,
        filter: `AND CountryId = '${country}'`
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Promo Count", response.data.count);
      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchColumnRoles = async (country: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/getColumnRoles/${country}`,
        
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Column Roles", response.data);
      setColumnRoles(response.data);
      setColumnRolesCount(response.data.length);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchApprovalRoles = async (country: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/getApprovalRoles/${user.userId}/${country}`,
        
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Approval Roles", response.data);
      setApprovalRoles(response.data);
      setApprovalRolesCount(response.data.length);
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
    fetchColumnRoles(user.activeCountryId);
    fetchApprovalRoles(user.activeCountryId);
  }, []);
  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage))
  }, [recordsPerPage, totalRecords]);
  useEffect(() => {
    fetchCount(selectedValue);
    fetchData(1, user.gridPageSize, selectedValue);
    fetchColumnRoles(selectedValue);
    fetchApprovalRoles(selectedValue);
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
          /
          <span className="text-gray-500 font-medium">&nbsp;Users</span>
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
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <span className="font-medium">
            Approval Roles : {columnRolesCount} roles  <button className="text-sky-600 underline" onClick={()=>navigate('/editApprovalRoles')}>Edit</button>
          </span>
           <span className="font-medium">
            Restriction Profiles:  {approvalRolesCount} profiles <button className="text-sky-600 underline" onClick={()=>navigate('/editColumnPermissions')}>Edit</button>
          </span>
        
      </div>


      {/* Responsive Table inside the same container */}
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-12 mt-8">
          <BasicTables page="Admin-Users" inboxData={inboxData} columns={columns} />
        </div>
        <div className="col-span-12 mt-8">
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
      </div>
    </div>
  );
};

export default Users;
