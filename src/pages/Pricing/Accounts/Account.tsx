import axios from "axios";
import PageMeta from "../../../components/common/PageMeta";
import BasicTables from "../../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/loader";
import { useNavigate, Link } from "react-router-dom";
import { resetRecords } from "../../../store/userSlice";
import Pagination from "../../../components/Pagination";

export default function Account() {
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const fetchData = async (start: number, end: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_Accounts",
        firstRow: start,
        lastRow: end,
        sortBy: "AccountName",
        sortByDirection: "asc",
        filter: `AND UserId = ${user.userId}`,
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
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setLoading(false);
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
      setTotalRecords(response.data.count);
      return response.data.count;
    } catch (error: any) {
      console.error("Error fetching account count:", error.message);
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
      return response.data.count;
    } catch (error: any) {
      console.error("Error fetching site count:", error.message);
      return 0;
    }
  };

  const selected = () => {
    const selected = selectedRows.filter((row: any) => row.checked);
    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    } else {
      dispatch(resetRecords(selected));
      navigate("/confirmSelectionAccount");
    }
  };

  const newCustomer = () => {
    navigate("/newCustomer");
  };

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber === 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber === 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    fetchData(start, end);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  // 🔹 Animated counter logic
  const animateValue = (setter: any, start: number, end: number, duration: number) => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setter(value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ✅ Fetch counts first, then animate them
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

    fetchData(1, user.gridPageSize);
    loadData();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span
          className="font-medium cursor-pointer"
          onClick={() => navigate("/pricingDashBoard")}
        >
          Pricing
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;Accounts - Account</span>
      </nav>

      <PageMeta
        title="Pricing Tool"
        description=""
      />

      {/* 🔹 Tiles and buttons in one compact responsive row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Left - Tiles */}
        <div className="flex flex-wrap gap-4">
          {/* Account Tile */}
          <Link
            to="../pricingAccount"
            className="flex items-center justify-center w-[160px] h-[80px] rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">Account</span>
              <span className="block text-green-500 font-bold text-xl transition-all">
                {accountCount.toLocaleString()}
              </span>
            </div>
          </Link>

          {/* Site Tile */}
          <Link
            to="../pricingSite"
            className="flex items-center justify-center w-[160px] h-[80px] rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="text-center">
              <span className="block text-sm font-medium text-gray-700">Site</span>
              <span className="block text-green-500 font-bold text-xl transition-all">
                {siteCount.toLocaleString()}
              </span>
            </div>
          </Link>
        </div>

        {/* Right - Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={newCustomer}
            className="bg-blue-800 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Create New Customer
          </button>
          <button
            onClick={selected}
            className="bg-blue-800 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Create +
          </button>
        </div>
      </div>

      {/* 🔹 Table section */}
      <div className="col-span-12">
        <BasicTables
          page={"Pricing - Account"}
          inboxData={inboxData}
          columns={columns}
          checkBox={true}
          setSelectedRows={setSelectedRows}
        />
      </div>

      {/* 🔹 Pagination */}
      <div className="col-span-12 mt-6">
        {inboxData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setPageChange}
            onRecordsPerPageChange={(val) => {
              changeRecordsPerPage(val);
            }}
          />
        )}
      </div>
    </>
  );
}
