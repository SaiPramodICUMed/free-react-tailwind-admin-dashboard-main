import axios from "axios";
import PageMeta from "../../../components/common/PageMeta";
import BasicTables from "../../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../../components/loader";
import { useNavigate, Link } from "react-router-dom";
import { resetRecords, userApprovalRecord } from "../../../store/userSlice";
import Pagination from "../../../components/Pagination";

export default function Account() {
  const user = useSelector((state: any) => state.user.users);

  // grid / counts / selection
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [accountCount, setAccountCount] = useState(0);
  const [siteCount, setSiteCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(1);
  const [userApprovals, setUserApprovals] = useState<any[]>([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetRecords([])); // Clear Redux
    setSelectedRows([]); // Clear component state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Filter metadata states
  // -------------------------
  const [accountNames, setAccountNames] = useState<string[]>([]);
  const [accountNumbers, setAccountNumbers] = useState<string[]>([]);
  const [partyNumbers, setPartyNumbers] = useState<string[]>([]);
  const [segments, setSegments] = useState<{ value: any; label: string }[]>([]);

  const [types, setTypes] = useState<string[]>([]);
  const [parents, setParents] = useState<string[]>([]);
  const [salesChannels, setSalesChannels] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [yrSalesRange, setYrSalesRange] = useState<any>({ minimum: 0, maximum: 0 });
  const [grossSalesRange, setGrossSalesRange] = useState<any>({ minimum: 0, maximum: 0 });

  // filters state (SmartFilterTable will manage UI and call searchData)
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});

  // -------------------------
  // Columns (kept same order)
  // Add filterType/filterOptions on relevant columns so BasicTables -> SmartFilterTable shows filters
  // -------------------------
  const columns = [
    { header: "Account Name", accessor: "AccountName", filterType: "autocomplete", filterOptions: accountNames },
    { header: "Account Number", accessor: "AccountNumber", filterType: "autocomplete", filterOptions: accountNumbers },
    { header: "Party Number", accessor: "PartyNumber", filterType: "autocomplete", filterOptions: partyNumbers },
    { header: "Customer Segment", accessor: "SegmentName", filterType: "multiSelect", filterOptions: segments },
    { header: "Customer Type", accessor: "Type", filterType: "autocomplete", filterOptions: types },
    { header: "Corporate Name", accessor: "ParentCompany", filterType: "autocomplete", filterOptions: parents },
    { header: "Sales ChannelCode", accessor: "SalesChannelCode", filterType: "autocomplete", filterOptions: salesChannels },
    { header: "City", accessor: "City", filterType: "autocomplete", filterOptions: cities },
    { header: "1 YR Sales", accessor: "YRSales", filterType: "range", min: yrSalesRange.minimum, max: yrSalesRange.maximum },
    { header: "1 YR Sales (traced)", accessor: "GrossSalesTracing", filterType: "range", min: grossSalesRange.minimum, max: grossSalesRange.maximum },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countries },
  ];

  // -------------------------
  // Utility helpers
  // -------------------------
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  // Build SQL Filter string from filters object (same style as InProgress)
  // Expects keys equal to accessor names from columns. Also supports <field>_preset and <field> arrays for ranges
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = ""; // we will always append the UserId clause at the end

    for (const rawKey of Object.keys(obj)) {
      const val = obj[rawKey];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) continue;

      const key = rawKey;
      const presetKey = `${key}_preset`;

      // Handle date presets if any in future (not used here) - omitted for accounts

      // Numeric ranges: arrays like [min, max]
      if (Array.isArray(val) && val.length === 2 && (typeof val[0] === "number" || typeof val[1] === "number")) {
        clauses.push(`(${key} >= ${Number(val[0])} AND ${key} <= ${Number(val[1])})`);
        continue;
      }

      // Multi-select arrays of strings
      // Multiselect for SegmentName (value = ID)
      if (key === "SegmentName" && Array.isArray(val) && val.length > 0) {
        const parts = val.map((v: any) => `SegmentID = ${v.value}`);
        clauses.push(`(${parts.join(" OR ")})`);
        continue;
      }


      // Text / autocomplete (string)
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
        continue;
      }
    }

    // Always include user filter
    const combined = [base, ...(clauses.length ? clauses.map((c) => `AND ${c}`) : []), `AND UserId = ${user.userId}`].join(" ");
    return combined;
  };

  // -------------------------
  // DATA fetchers
  // -------------------------
  // fetch grid data (supports optional filterOverride)
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_Accounts",
        firstRow: start,
        lastRow: end,
        sortBy: "AccountName",
        sortByDirection: "asc",
        filter: filterOverride ?? `AND UserId = ${user.userId}`,
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
      console.error("Error fetching accounts data:", error.message);
      setLoading(false);
      return null;
    }
  };

  // fetch total count for current filter
  const fetchTotalCount = async (sqlFilter: string) => {
    try {
      const payload = {
        viewName: `vw_Accounts`,
        filter: sqlFilter,
      };

      const resp = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setTotalRecords(resp.data.count);
      setTotalPages(Math.ceil(resp.data.count / recordsPerPage));
    } catch (err) {
      console.error("Error fetching accounts total count", err);
    }
  };

  // -------------------------
  // Suggestion / minmax loaders for filter UI
  // (APIs you provided)
  // -------------------------
  const suggestionApi = async (field: string, searchTerm = "", special = false) => {
    try {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload: any = {
        viewName: "vw_Accounts",
        fieldName: field,
        filter: `AND UserId = ${user.userId}`,
      };

      // For single-field autocompletes, if searchTerm provided, plug into filter
      if (!special && searchTerm) {
        // fieldName already set
        payload.filter = `AND ( ${field} LIKE N'%${escapeSql(searchTerm)}%' ) AND UserId = ${user.userId}`;
      }

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      return res.data;
    } catch (err) {
      console.error("Suggestion API error", err);
      return special ? { minimum: 0, maximum: 0 } : [];
    }
  };

  const fetchFilterMetadata = async () => {
    // load options and min/max
    try {
      setAccountNames(await suggestionApi("AccountName"));
      setAccountNumbers(await suggestionApi("AccountNumber"));
      setPartyNumbers(await suggestionApi("PartyNumber"));
      // SegmentID, SegmentName is returned as pairs; you can display SegmentName in multiselect
      // Load SegmentID + SegmentName properly for multiselect
      const seg = await suggestionApi("SegmentName");

      if (Array.isArray(seg)) {
        const segNames = seg.map(
          (s: any) => s.SegmentName ?? s.segmentname ?? String(s)
        );

        // Remove duplicates
        setSegments(Array.from(new Set(segNames)));
      } else {
        setSegments([]);
      }

      setTypes(await suggestionApi("Type"));
      setParents(await suggestionApi("ParentCompany"));
      setSalesChannels(await suggestionApi("SalesChannelCode"));
      setCities(await suggestionApi("City"));
      setCountries(await suggestionApi("CountryName"));

      setYrSalesRange(await suggestionApi("YRSales", "", true));
      setGrossSalesRange(await suggestionApi("GrossSalesTracing", "", true));
    } catch (err) {
      console.error("Error loading filter metadata", err);
    }
  };

  // -------------------------
  // searchData - called by SmartFilterTable (BasicTables)
  // filtersObj shape = { AccountName: 'abc', SegmentName: ['A','B'], YRSales: [min,max], ... }
  // -------------------------
  const onFiltersFromTable = (filtersObj: Record<string, any>) => {
    // Save filters locally (optional)
    setFiltersState(filtersObj || {});

    // Build SQL filter
    const sql = buildFilterStringFromObject(filtersObj || {});

    // fetch count and first page
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  const searchData = (filtersObj: Record<string, any>) => {
    onFiltersFromTable(filtersObj || {});
  };

  // -------------------------
  // Pagination handlers
  // -------------------------
  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * noOfrecordsPerPage + 1;
    const end = pageNumber * noOfrecordsPerPage;
    // Use current filtersState if any
    const sql = buildFilterStringFromObject(filtersState || {});
    fetchData(start, end, sql);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalRecords / size));
    const sql = buildFilterStringFromObject(filtersState || {});
    fetchData(1, size, sql);
  };

  // -------------------------
  // existing fetch helpers preserved
  // -------------------------
  const fetchUserApprovalRoles = async () => {
    try {
      const payload = {
        userId: user.userId,
        countryId: user.activeCountryId,
        taskId: null,
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
      setTotalRecords(response.data.count);
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
      return response.data.count;
    } catch {
      return 0;
    }
  };

  // -------------------------
  // Actions (Create+, New Customer)
  // -------------------------
  const selected = () => {
    const selectedItems = selectedRows.filter((row: any) => row.checked);

    if (userApprovals.length === 0 || userApprovals == null) {
      alert("You don't have approval rights to create task!");
      return;
    }

    dispatch(userApprovalRecord(userApprovals));

    if (selectedItems.length === 0) {
      alert("Please select at least one record");
      return;
    }

    dispatch(resetRecords(selectedItems));

    if (selectedItems.length > 1) {
      navigate("/confirmSelectionMultiple");
    } else {
      navigate("/confirmSelectionAccount");
    }
  };

  const newCustomer = () => {
    navigate("/newCustomer");
  };

  // -------------------------
  // Animation helper for tiles (kept)
  // -------------------------
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

  // -------------------------
  // Initial load
  // -------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [accounts, sites] = await Promise.all([fetchAccountsCount(), fetchSitesCount()]);
      setLoading(false);

      animateValue(setAccountCount, 0, accounts, 1200);
      animateValue(setSiteCount, 0, sites, 1200);
    };

    // existing
    fetchUserApprovalRoles();
    // initial grid (first page) - no filters
    fetchData(1, user.gridPageSize);
    // counts + tiles
    loadData();
    // load filter metadata
    fetchFilterMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // detect selected rows
  const isAnyRowSelected = selectedRows.some((row: any) => row.checked);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/pricingDashBoard")}>
          Pricing
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;Accounts - Account</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      {/* 🔹 Tiles + Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-4">
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

        {/* Right Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Create New Customer (always enabled) */}
          <button onClick={newCustomer} className="px-4 py-1.5 rounded bg-blue-600 text-white">
            Create New Customer
          </button>

          {/* Create + (enabled only if a row is selected) */}
          <button
            onClick={selected}
            disabled={!isAnyRowSelected}
            className={`px-4 py-1.5 rounded text-white ${isAnyRowSelected ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Create +
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="col-span-12">
        <BasicTables
          page={"Pricing - Account"}
          inboxData={inboxData}
          columns={columns}
          checkBox={true}
          setSelectedRows={setSelectedRows}
          // SmartFilterTable will call searchData(filtersObj)
          searchData={searchData}
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
            onRecordsPerPageChange={(val) => {
              changeRecordsPerPage(val);
            }}
          />
        )}
      </div>
    </>
  );
}
