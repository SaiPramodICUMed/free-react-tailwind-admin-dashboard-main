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

  // GRID STATE
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Approval
  const [userApprovals, setUserApprovals] = useState<any[]>([]);

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [groupAccounts, setGroupAccounts] = useState<any[]>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // CLEAR Redux on load
  useEffect(() => {
    dispatch(resetRecords([]));
  }, []);

  // ---------------------------------------------------------------------
  // FILTER STATE
  // ---------------------------------------------------------------------
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [partyNumbers, setPartyNumbers] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [accountsRange, setAccountsRange] = useState<any>({ minimum: 0, maximum: 0 });
  const [yrSalesRange, setYrSalesRange] = useState<any>({ minimum: 0, maximum: 0 });

  const [filtersState, setFiltersState] = useState<Record<string, any>>({});

  // ---------------------------------------------------------------------
  // COLUMN DEFINITIONS + FILTER CONFIG
  // ---------------------------------------------------------------------
  const columns = [
    { header: "Group Name", accessor: "GroupName", filterType: "autocomplete", filterOptions: groupNames },
    { header: "Party Number", accessor: "PartyNumber", filterType: "autocomplete", filterOptions: partyNumbers },
    { header: "Customer Segment", accessor: "SegmentName", filterType: "multiSelect", filterOptions: segments },
    {
      header: "Accounts",
      accessor: "AccountsCount",
      filterType: "range",
      min: accountsRange.minimum,
      max: accountsRange.maximum,
    },
    {
      header: "1 YR Sales",
      accessor: "YRSales",
      filterType: "range",
      min: yrSalesRange.minimum,
      max: yrSalesRange.maximum,
    },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countries },
  ];

  // ---------------------------------------------------------------------
  // UTILITY
  // ---------------------------------------------------------------------
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];

    for (const rawKey of Object.keys(obj)) {
      const val = obj[rawKey];
      if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) continue;

      // RANGE
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === "number") {
        clauses.push(`(${rawKey} >= ${val[0]} AND ${rawKey} <= ${val[1]})`);
        continue;
      }

      // MULTISELECT
      if (Array.isArray(val) && typeof val[0] === "string") {
        const parts = val.map((v) => `${rawKey} = '${escapeSql(v)}'`);
        clauses.push(`(${parts.join(" OR ")})`);
        continue;
      }

      // AUTOCOMPLETE
      if (typeof val === "string") {
        clauses.push(`(${rawKey} LIKE N'%${escapeSql(val)}%')`);
        continue;
      }
    }

    return `${clauses.map((c) => `AND ${c}`).join(" ")} AND UserId = ${user.userId}`;
  };

  // ---------------------------------------------------------------------
  // DATA FETCHERS
  // ---------------------------------------------------------------------
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_BuyingGroups",
        firstRow: start,
        lastRow: end,
        sortBy: "GroupName",
        sortByDirection: "asc",
        filter: filterOverride ?? `AND UserId = ${user.userId}`,
        fieldList: "*",
        timeout: 0,
      };

      const resp = await axios.post(`https://10.2.6.130:5000/api/Metadata/getData`, payload);
      setInboxData(resp.data);
    } catch (e) {
      console.error("Error fetching group data", e);
    }
    setLoading(false);
  };

  const fetchTotalCount = async (filter: string) => {
    try {
      const payload = {
        viewName: "vw_BuyingGroups",
        filter: filter,
      };

      const res = await axios.post(`https://10.2.6.130:5000/api/Metadata/getViewCount`, payload);
      setTotalRecords(res.data.count);
      setTotalPages(Math.ceil(res.data.count / recordsPerPage));
    } catch (err) {
      console.error("Count error", err);
    }
  };

  // ---------------------------------------------------------------------
  // SUGGESTION APIS
  // ---------------------------------------------------------------------
  const suggestionApi = async (field: string, searchTerm = "", isRange = false) => {
    try {
      const url = isRange
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload: any = {
        viewName: "vw_BuyingGroups",
        fieldName: field,
        filter: `AND UserId = ${user.userId}`,
      };

      if (!isRange && searchTerm) {
        payload.filter = `AND ( ${field} LIKE N'%${escapeSql(searchTerm)}%' ) AND UserId = ${user.userId}`;
      }

      const res = await axios.post(url, payload);
      return res.data;
    } catch (e) {
      return isRange ? { minimum: 0, maximum: 0 } : [];
    }
  };

  const fetchFilterMetadata = async () => {
    try {
      setGroupNames(await suggestionApi("GroupName"));
      setPartyNumbers(await suggestionApi("PartyNumber"));

      // SegmentName list
      const seg = await suggestionApi("SegmentName");

if (Array.isArray(seg)) {
  const mappedSegments = seg
    .filter((s: any) => s?.id)
    .map((s: any) => ({
      value: s.id,
      label: s.id,
    }));

  setSegments(mappedSegments);
} else {
  setSegments([]);
}


      const ctry = await suggestionApi("CountryName");

if (Array.isArray(ctry)) {
  const mappedCountries = ctry
    .filter((c: any) => c?.id)
    .map((c: any) => ({
      value: c.id,
      label: c.id,
    }));

  setCountries(mappedCountries);
} else {
  setCountries([]);
}


      const accRange = await suggestionApi("AccountsCount", "", true);
      const yrRange = await suggestionApi("YRSales", "", true);

      setAccountsRange(accRange);
      setYrSalesRange(yrRange);
    } catch (e) {
      console.error("Metadata fetch error", e);
    }
  };

  // ---------------------------------------------------------------------
  // HANDLE FILTERS SENT FROM SmartFilterTable
  // ---------------------------------------------------------------------
  const searchData = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj);

    const sql = buildFilterStringFromObject(filtersObj);
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);

    setCurrentPage(1);
  };

  // ---------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------
  const setPageChange = (page: number, perPage?: number) => {
    const size = perPage ?? recordsPerPage;
    setCurrentPage(page);

    const sql = buildFilterStringFromObject(filtersState);

    const start = (page - 1) * size + 1;
    const end = page * size;

    fetchData(start, end, sql);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);

    const sql = buildFilterStringFromObject(filtersState);
    fetchData(1, size, sql);

    setTotalPages(Math.ceil(totalRecords / size));
  };

  // ---------------------------------------------------------------------
  // Approval + Popup logic (unchanged)
  // ---------------------------------------------------------------------
  const fetchUserApprovalRoles = async () => {
    try {
      const payload = {
        userId: user.userId,
        countryId: user.activeCountryId,
        taskId: null,
      };

      const res = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetUserApprovalRoles`,
        payload
      );

      setUserApprovals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = (row: any) => getAccountDetails(row);

  const handleCreate = (row: any) => {
    dispatch(userApprovalRecord(userApprovals));
    dispatch(resetRecords([row]));
    navigate("/groupConfirmSelection");
  };

  const getAccountDetails = async (row: any) => {
    try {
      setLoading(true);

      const url = `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetGroupAccounts?bgPartyId=${row.BgPartyID}&countryId=${row.CountryId}`;
      const resp = await axios.get(url);

      setGroupAccounts(resp.data);
      setShowPopup(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------
  // Initial Load
  // ---------------------------------------------------------------------
  useEffect(() => {
    fetchFilterMetadata();
    fetchUserApprovalRoles();

    fetchTotalCount(`AND UserId = ${user.userId}`);
    fetchData(1, user.gridPageSize);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // ---------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------
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
        <span className="text-gray-500 font-medium">&nbsp;Groups</span>
      </nav>

      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-12">
          <BasicTables
            page={"Pricing - Groups"}
            inboxData={inboxData}
            columns={columns}
            checkBox={false}
            handleViewDetails={handleViewDetails}
            viewDetails={true}
            handleCreate={handleCreate}
            createOption={true}
            searchData={searchData}
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
              onRecordsPerPageChange={(v) => changeRecordsPerPage(v)}
            />
          )}
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999999]">
          <div className="bg-white rounded-xl shadow-2xl w-[750px] max-h-[80vh] overflow-hidden animate-[zoomIn_0.2s_ease]">
            <div className="flex justify-between items-center px-5 py-4 bg-gray-200 border-b">
              <h2 className="font-semibold text-lg text-gray-800">Group Accounts</h2>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>
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
