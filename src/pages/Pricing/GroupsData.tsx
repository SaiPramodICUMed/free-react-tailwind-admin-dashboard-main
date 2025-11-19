import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";

export default function GroupsData() {
  const user = useSelector((state: any) => state.user.users);

  const [inboxData, setInboxData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleViewDetails = (row:any) => {
  console.log("Parent received:", row);
  getAccountDetails(row);
};
const handleCreate = (row:any) => {
    console.log("Parent received:", row);
}

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
  }, []);

  useEffect(() => {
    setSelectedRows([]);
  }, []);

  const navigate = useNavigate();

  const isAnyRowSelected = selectedRows.some((r: any) => r.checked);

  // --------------------------------------
  // 🔥 Get Account Details Handler
  // --------------------------------------
  const getAccountDetails = async (arg:any) => {
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
              onClick={getAccountDetails}
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
             handleCreate={handleCreate} createOption={false}
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
  <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white rounded-md shadow-lg w-[700px] max-h-[80vh] overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-100">
        <h2 className="font-semibold text-lg">Group Accounts</h2>
        <button
          className="text-gray-600 hover:text-red-500 text-xl"
          onClick={() => setShowPopup(false)}
        >
          ✕
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-y-auto max-h-[65vh]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-200 text-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2 border">Accounts</th>
              <th className="px-4 py-2 border">1 Yr Sales (in Group)</th>
            </tr>
          </thead>

          <tbody>
            {groupAccounts.map((acc: any, idx: number) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="px-4 py-2 border">
                  {acc.accountName}
                </td>
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
