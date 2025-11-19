import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { resetRecords, userApprovalRecord } from "../../store/userSlice";

export default function GroupsData() {
  const user = useSelector((state: any) => state.user.users);

  const [inboxData, setInboxData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userApprovals, setUserApprovals] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetRecords([]));   // Clear Redux
    setSelectedRows([]);          // Clear component state
  }, []);

  // 🔥 Popup State
  const [showPopup, setShowPopup] = useState(false);
  const [groupAccounts, setGroupAccounts] = useState([]);

  const columns = [
    { header: "Group Name", accessor: "GroupName" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Accounts", accessor: "AccountsCount" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Country", accessor: "CountryName" },
  ];

  // --------------------------------------
  // Fetch Main Grid
  // --------------------------------------
  const fetchData = async (start: number, end: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_BuyingGroups",
        firstRow: start,
        lastRow: end,
        sortBy: "GroupName",
        sortByDirection: "asc",
        filter: `AND UserId = ${user.userId}`,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload
      );

      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching grid:", error.message);
      setLoading(false);
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

  const handleViewDetails = (row: any) => {
    console.log("Parent received:", row);
    getAccountDetails(row);
  };

  const fetchCount = async () => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_BuyingGroups`,
        filter: `AND UserId = ${user.userId}`,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload
      );

      setTotalRecords(response.data.count);
      setLoading(false);

      return response.data;
    } catch (error: any) {
      console.error("Error fetching count:", error.message);
      setLoading(false);
      return null;
    }
  };

  const selected = () => {
    const selected = selectedRows.filter((row: any) => row.checked);
    console.log('userApprovals', userApprovals);
    if (userApprovals.length === 0 || userApprovals == null) {
      alert("You don't have approval rights to create task!");
      return;
    }

    dispatch(userApprovalRecord(userApprovals));

    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    }
    console.log('selected row',selected);
    dispatch(resetRecords(selected));

    
      navigate("/groupConfirmSelection");
    
  };

  const setPageChange = (pageNumber: number, perPage?: number) => {
    const size = perPage ? perPage : recordsPerPage;
    setCurrentPage(pageNumber);

    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    fetchData(start, end);
  };

  const changeRecordsPerPage = (count: number) => {
    setRecordsPerPage(count);
    setTotalPages(Math.ceil(totalRecords / count));
    setPageChange(1, count);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [totalRecords, recordsPerPage]);

  useEffect(() => {
    fetchCount();
    fetchData(1, user.gridPageSize);
    fetchUserApprovalRoles();
  }, []);

  useEffect(() => {
    setSelectedRows([]);
  }, []);

  const navigate = useNavigate();

  const isAnyRowSelected = selectedRows.some((r: any) => r.checked);

  // --------------------------------------
  // 🔥 Get Account Details Handler
  // --------------------------------------
  const getAccountDetails = async (arg: any) => {
    //const selected = selectedRows.filter((r: any) => r.checked);

    // if (selected.length === 0) {
    //   alert("Please select at least one group");
    //   return;
    // }

    //const group = selected[0]; // take first selected row
    const bgPartyId = arg.BgPartyID;
    const countryId = arg.CountryId;

    try {
      setLoading(true);

      const url = `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetGroupAccounts?bgPartyId=${bgPartyId}&countryId=${countryId}`;

      const response = await axios.get(url);
      console.log('res', response.data);
      setGroupAccounts(response.data);
      setShowPopup(true);
      setLoading(false);
    } catch (err) {
      console.error("GetGroupAccounts ERROR", err);
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoad={loading} />

      {/* PAGE HEADER */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate('/pricingDashBoard')}>Pricing</span> /
        <span className="text-gray-500 font-medium">&nbsp;Groups</span>
      </nav>

      {/* BUTTON + TABLE */}
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
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

        <div className="col-span-12">
          <BasicTables
            page={"Pricing - Groups"}
            inboxData={inboxData}
            columns={columns}
            checkBox={true}
            setSelectedRows={setSelectedRows}
            handleViewDetails={handleViewDetails} viewDetails={true}
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
              onRecordsPerPageChange={(val) => changeRecordsPerPage(val)}
            />
          )}
        </div>
      </div>

      {/* --------------------------------------
          🔥 POPUP MODAL — Group Account Details
      ----------------------------------------- */}
      {showPopup && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center !z-[999999]">

    <div className="bg-white rounded-xl shadow-2xl w-[750px] max-h-[80vh] overflow-hidden
                    animate-[zoomIn_0.2s_ease]">

      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 
                      bg-gradient-to-r from-slate-100 to-slate-200 border-b">
        <h2 className="font-semibold text-lg text-gray-800">Group Accounts</h2>

        <button
          className="text-gray-500 hover:text-gray-800 transition"
          onClick={() => setShowPopup(false)}
        >
          ✕
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-y-auto max-h-[65vh]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 shadow">
            <tr>
              <th className="px-4 py-2 border">Accounts</th>
              <th className="px-4 py-2 border">1 Yr Sales (in Group)</th>
            </tr>
          </thead>

          <tbody>
            {groupAccounts.map((acc: any, idx: number) => (
              <tr
                key={idx}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50/60 transition`}
              >
                <td className="px-4 py-2 border">{acc.accountName}</td>
                <td className="px-4 py-2 border">
                  {acc.yrSales ? `$ ${acc.yrSales.toLocaleString()}` : "$ 0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
)}


    </>
  );
}
