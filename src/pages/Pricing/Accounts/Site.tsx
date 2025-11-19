import axios from "axios";
import PageMeta from "../../../components/common/PageMeta";
import BasicTables from "../../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/loader";
import { Link, useNavigate } from "react-router";
import Pagination from "../../../components/Pagination";
import { resetRecords, userApprovalRecord } from "../../../store/userSlice";

export default function Site() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [accountCount, setAccountCount] = useState(0);
  const [siteCount, setSiteCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  const [userApprovals, setUserApprovals] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(resetRecords([]));   // Clear Redux
    setSelectedRows([]);          // Clear component state
  }, []);

  const columns = [
    { header: "Site use Code", accessor: "SiteUseCode" },
    { header: "Site Number", accessor: "PartySiteNumber" },
    { header: "Account Number", accessor: "AccountNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Customer Type", accessor: "Type" },
    { header: "Corporate Name", accessor: "ParentCompany" },
    { header: "Address", accessor: "Address1" },
    { header: "Postal Code", accessor: "PostalCode" },
    { header: "City", accessor: "SiteCity" },
    { header: "Province", accessor: "Province" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Country", accessor: "CountryName" },
  ];

  const fetchData = async (start: number, end: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_Sites",
        firstRow: start,
        lastRow: end,
        sortBy: "AccountName",
        sortByDirection: "asc",
        filter: `AND UserId = ${user.userId}`,
        fieldList: "*",
        timeout: 0
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch {
      return null;
    }
  };
  const fetchUserApprovalRoles = async () => {
    try {
      const payload = {
        userId: user.userId,
        countryId: user.activeCountryId,
        taskId: null
      };

      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetUserApprovalRoles`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setUserApprovals(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching User Approval Roles:", error.message);
      return null;
    }
  };
  const fetchAccountsCount = async () => {
    try {
      const payload = {
        viewName: `vw_Accounts`,
        filter: `AND UserId = ${user.userId}`,
      };
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.count;
    } catch {
      return 0;
    }
  };

  const fetchSitesCount = async () => {
    try {
      const payload = {
        viewName: `vw_Sites`,
        filter: `AND UserId = ${user.userId}`,
      };
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setTotalRecords(response.data.count);
      return response.data.count;
    } catch {
      return 0;
    }
  };

  // 🔹 SAME LOGIC AS ACCOUNT.TSX
  const selected = () => {
    const selected = selectedRows.filter((row: any) => row.checked);
    console.log('selected row', selected);
    if (userApprovals.length === 0 || userApprovals == null) {
      alert("You don't have approval rights to create task!");
      return;
    }

    dispatch(userApprovalRecord(userApprovals));

    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    }

    dispatch(resetRecords(selected));

    if (selected.length > 1) {
      navigate("/confirmSelectionMultiple");
    } else {
      navigate("/confirmSelectionAccount");
    }
  };

  const newCustomer = () => navigate("/newCustomer");

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber === 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end = pageNumber === 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    fetchData(start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  const animateValue = (setter: any, start: number, end: number, duration: number) => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [accounts, sites] = await Promise.all([
        fetchAccountsCount(),
        fetchSitesCount(),
      ]);

      setLoading(false);

      animateValue(setAccountCount, 0, accounts, 1200);
      animateValue(setSiteCount, 0, sites, 1200);
    };
    fetchUserApprovalRoles();
    fetchData(1, user.gridPageSize);
    loadData();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // ✅ Enable Create+ only when rows selected
  const isAnyRowSelected = selectedRows.some((row: any) => row.checked);

  return (
    <>
      <Loader isLoad={loading} />

      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate('/pricingDashBoard')}>
          Pricing
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;Accounts - Site</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      {/* Tiles + Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

        {/* Tiles */}
        <div className="flex flex-wrap gap-4">

          <Link
            to="../pricingAccount"
            className="flex items-center justify-center w-[160px] h-[80px] rounded-xl 
              border border-gray-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] 
              transition-all cursor-pointer"
          >
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">Account</span>
              <span className="block text-green-500 font-bold text-xl">
                {accountCount.toLocaleString()}
              </span>
            </div>
          </Link>

          <Link
            to="../pricingSite"
            className="flex items-center justify-center w-[160px] h-[80px] rounded-xl 
              border border-gray-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] 
              transition-all cursor-pointer"
          >
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">Site</span>
              <span className="block text-green-500 font-bold text-xl">
                {siteCount.toLocaleString()}
              </span>
            </div>
          </Link>

        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Always enabled */}
          <button
            onClick={newCustomer}
            className="px-4 py-1.5 rounded bg-blue-600 text-white"
          >
            Create New Customer
          </button>

          {/* Enabled only when rows selected */}
          <button
            onClick={selected}
            disabled={!isAnyRowSelected}
            className={`px-4 py-1.5 rounded text-white 
              ${isAnyRowSelected ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Create +
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="col-span-12">
        <BasicTables
          page={"Pricing - Site"}
          inboxData={inboxData}
          columns={columns}
          checkBox={true}
          setSelectedRows={setSelectedRows}
        />
      </div>

      {/* Pagination */}
      <div className="col-span-12 mt-6">
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
