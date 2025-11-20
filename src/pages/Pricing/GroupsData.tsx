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
  const [loading, setLoading] = useState(false);
  const [userApprovals, setUserApprovals] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [groupAccounts, setGroupAccounts] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // CLEAR selected data when component loads
  useEffect(() => {
    dispatch(resetRecords([]));
  }, []);

  const columns = [
    { header: "Group Name", accessor: "GroupName" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Accounts", accessor: "AccountsCount" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Country", accessor: "CountryName" },
  ];

  // Fetch Main Grid
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
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Fetch Approval Rights
  const fetchUserApprovalRoles = async () => {
    try {
      const payload = {
        userId: user.userId,
        countryId: user.activeCountryId,
        taskId: null,
      };
      console.log('approval payload',payload);
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetUserApprovalRoles`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('user approvals', response.data);
      setUserApprovals(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // VIEW DETAILS for Popup
  const handleViewDetails = (row: any) => {
    getAccountDetails(row);
  };

  // ⭐ CREATE BUTTON inside each row
  const handleCreate = (row: any) => {
    console.log("Selected row for Create:", row);

    // Check approval permission
    // if (!userApprovals || userApprovals.length === 0) {
    //   alert("You don't have approval rights to create task!");
    //   return;
    // }

    // Store approval rights
    dispatch(userApprovalRecord(userApprovals));

    // Store selected row in redux
    dispatch(resetRecords([row]));

    // Redirect
    navigate("/groupConfirmSelection");
  };

  // Fetch Count
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
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Pagination
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

  // POPUP — GET GROUP ACCOUNTS
  const getAccountDetails = async (row: any) => {
    try {
      setLoading(true);

      const url = `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetGroupAccounts?bgPartyId=${row.BgPartyID}&countryId=${row.CountryId}`;

      const response = await axios.get(url);

      setGroupAccounts(response.data);
      setShowPopup(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Loader isLoad={loading} />

      {/* Header */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span
          className="font-medium cursor-pointer"
          onClick={() => navigate("/pricingDashBoard")}
        >
          Pricing
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;Groups</span>
      </nav>

      <div className="grid grid-cols-6 gap-4 md:gap-3">

        {/* TABLE ONLY (Create+ Button removed!) */}
        <div className="col-span-12">
          <BasicTables
            page={"Pricing - Groups"}
            inboxData={inboxData}
            columns={columns}
            checkBox={false}
            handleViewDetails={handleViewDetails}
            viewDetails={true}
            handleCreate={handleCreate}   // ⭐ NEW ROW-LEVEL CREATE
            createOption={true}
          />
        </div>

        {/* Pagination */}
        <div className="col-span-12 mt-8">
          {inboxData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setPageChange}
              onRecordsPerPageChange={(v) => changeRecordsPerPage(v)}
            />
          )}
        </div>
      </div>

      {/* POPUP - Group Account Details */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999999]">
          <div className="bg-white rounded-xl shadow-2xl w-[750px] max-h-[80vh] overflow-hidden animate-[zoomIn_0.2s_ease]">
            <div className="flex justify-between items-center px-5 py-4 bg-gray-200 border-b">
              <h2 className="font-semibold text-lg text-gray-800">Group Accounts</h2>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setShowPopup(false)}>✕</button>
            </div>

            <div className="overflow-y-auto max-h-[65vh]">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 border">Accounts</th>
                    <th className="px-4 py-2 border">1 Yr Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {groupAccounts.map((acc: any, i: number) => (
                    <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
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
