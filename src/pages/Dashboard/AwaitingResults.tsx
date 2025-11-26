// AwaitingResults.tsx
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { addCountries, addTaskCount } from "../../store/userSlice";

export default function AwaitingResults() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inboxData, setInboxData] = useState<any[]>([]);
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [nextValues, setNextValues] = useState<string[]>([]);
  const [countryValues, setCountryValues] = useState<string[]>([]);
  const [itemRangeValues, setItemRangeValues] = useState<any>({});
  const [originalValues, setOriginalValues] = useState<any>({});
  const [floorBreaksValues, setFloorBreaksValues] = useState<any>({});
  const [creatorValues, setCreatorValues] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(user.gridPageSize);

  const [totalRecords, setTotalRecords] = useState<number>(taskCount.awaitingResults || 0);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil((taskCount.awaitingResults || 0) / user.gridPageSize));

  const [chartOpen, setChartOpen] = useState(false);

  // filters state (kept for potential debugging or downstream use)
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  const [filterString, setFilterString] = useState<string>(`AND (1 <> 1 OR tab = 'AwaitingResults') AND tab = 'AwaitingResults'`);

  // Helper: escape single quotes for SQL
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  // Helper: format JS Date to M/D/YYYY HH:MM:SS (user wanted this format)
  const formatDateForSql = (d: Date, endOfDay = false) => {
    if (!d) return "";
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hh = endOfDay ? "23" : "00";
    const mm = "00";
    const ss = endOfDay ? "59" : "00";
    return `${month}/${day}/${year} ${hh}:${mm}:${ss}`;
  };

  // Build SQL filter string from filters object
  // Mirror behavior used in InProgress: supports date presets, custom ranges, numeric ranges, multi-selects, and text (LIKE)
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const base = `AND (1 <> 1 OR tab = 'AwaitingResults')`;
    const clauses: string[] = [];

    for (const rawKey of Object.keys(obj)) {
      const val = obj[rawKey];
      if (val === undefined || val === null || val === "") continue;

      const key = rawKey; // accessor name
      // skip preset keys here (we'll handle with the main field)
      if (key.endsWith("_preset")) continue;

      const presetKey = `${key}_preset`;
      // handle presets if present
      if (obj[presetKey]) {
        const preset = obj[presetKey];
        if (!preset || preset === "All") {
          // no clause
          continue;
        }
        if (preset === "Custom") {
          if (Array.isArray(val) && val[0] && val[1]) {
            const s = val[0] instanceof Date ? val[0] : new Date(val[0]);
            const e = val[1] instanceof Date ? val[1] : new Date(val[1]);
            clauses.push(`(${key} >= '${formatDateForSql(s, false)}' AND ${key} <= '${formatDateForSql(e, true)}')`);
          }
          continue;
        }
        // convert preset like "3 Months", "1 Year", "2 Years" into months
        let monthsBack = 0;
        if (preset.includes("Month")) monthsBack = Number(preset.split(" ")[0]);
        if (preset.includes("Year")) monthsBack = Number(preset.split(" ")[0]) * 12;
        if (monthsBack > 0) {
          const end = new Date();
          const start = new Date();
          start.setMonth(end.getMonth() - monthsBack);
          clauses.push(`(${key} >= '${formatDateForSql(start, false)}' AND ${key} <= '${formatDateForSql(end, true)}')`);
        }
        continue;
      }

      // If val is an array of two JS Dates OR ISO strings and field looks like a date (Created/LastModified/etc.)
      if (Array.isArray(val) && val.length === 2 && (val[0] instanceof Date || val[1] instanceof Date || key.toLowerCase().includes("created") || key.toLowerCase().includes("modified") || key.toLowerCase().includes("date"))) {
        const s = val[0] ? (val[0] instanceof Date ? val[0] : new Date(val[0])) : null;
        const e = val[1] ? (val[1] instanceof Date ? val[1] : new Date(val[1])) : null;
        if (s && e) {
          clauses.push(`(${key} >= '${formatDateForSql(s, false)}' AND ${key} <= '${formatDateForSql(e, true)}')`);
        }
        continue;
      }

      // Numeric ranges like [min,max]
      if (Array.isArray(val) && val.length === 2 && (typeof val[0] === "number" || typeof val[1] === "number")) {
        const dbField = key === "OriginalValue" ? "Value" : key;
        clauses.push(`(${dbField} >= ${Number(val[0])} AND ${dbField} <= ${Number(val[1])})`);
        continue;
      }

      // Multi-select arrays of strings
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        const parts = val.map((v: string) => `${key} = '${escapeSql(v)}'`);
        clauses.push(`(${parts.join(" OR ")})`);
        continue;
      }

      // Plain text -> LIKE
      if (typeof val === "string" && val.trim() !== "") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
        continue;
      }
    }

    const combined = [base, ...(clauses.length ? clauses.map((c) => `AND ${c}`) : []), `AND tab = 'AwaitingResults'`].join(" ");
    return combined;
  };

  // Fetch total count for current SQL filter (so pagination is accurate)
  const fetchTotalCount = async (sqlFilter: string) => {
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        filter: sqlFilter,
      };
      const resp = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const cnt = resp?.data?.count ?? 0;
      setTotalRecords(cnt);
      setTotalPages(Math.ceil(cnt / recordsPerPage));
      // keep global taskCount in sync if desired (non-destructive)
      // dispatch(addTaskCount({ ...taskCount }));
      return cnt;
    } catch (err) {
      console.error("Error fetching total count", err);
      return 0;
    }
  };

  // Fetch grid data (with optional filter override)
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        firstRow: start,
        lastRow: end,
        sortBy: "DeadlineOrdered",
        sortByDirection: "desc",
        filter: filterOverride ?? filterString,
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
      console.error("Error fetching AwaitingResults data:", error.message);
      setLoading(false);
      return null;
    }
  };

  // Called when BasicTables/SmartFilterTable sends a filters object
  const onFiltersFromTable = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj ?? {});
    const sql = buildFilterStringFromObject(filtersObj ?? {});
    setFilterString(sql);

    // update total count and first page
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // wrapper expected by BasicTables (keeps older contract)
  const searchData = (filtersObj: any) => {
    onFiltersFromTable(filtersObj || {});
  };

  // Pagination helpers
  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;
    // use current filterString
    fetchData(start, end, filterString);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalRecords / size));
    fetchData(1, size, filterString);
  };

  // Load suggestion/meta data for filters (autosuggest lists and min/max)
  const fetchMeta = async () => {
    const id = user.userId;
    const api = async (field: string, special = false) => {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload = {
        viewName: `dbo.Inbox_Tasks(${id})`,
        filter: `AND (1 <> 1 OR tab = 'AwaitingResults')`,
        fieldName: field,
      };

      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      return res.data;
    };

    try {
      setTaskNames(await api("Name"));
      setTaskTypes(await api("TaskType"));
      setStatusValues(await api("Status"));
      setNextValues(await api("FAO"));
      setCreatorValues(await api("Owner"));
      setCountryValues(await api("CountryName"));

      setItemRangeValues(await api("ItemCount", true));
      setOriginalValues(await api("Value", true));
      setFloorBreaksValues(await api("FloorBreaks", true));
    } catch (err) {
      console.error("Error fetching filter metadata", err);
    }
  };

  useEffect(() => {
    // initial data/load
    fetchData(1, recordsPerPage);
    fetchTotalCount(`AND (1 <> 1 OR tab = 'AwaitingResults') AND tab = 'AwaitingResults'`);
    fetchMeta();
    // optionally fetch countries globally (if your app wants to store them in redux)
    // fetchCountries(); // not needed here unless you use dispatch(addCountries(...))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  const handleViewDetails = (row: any) => {
    navigate(`/pricingTable/${row.TaskId}`);
  };

  // Columns - same as InProgress but WITHOUT the "Due" column (user requested)
  const columns = [
    { header: "Task Name", accessor: "Name", filterType: "autocomplete", filterOptions: taskNames },
    { header: "Task Type", accessor: "TaskType", filterType: "multiSelect", filterOptions: taskTypes },
    { header: "Status", accessor: "TaskStatus", filterType: "multiSelect", filterOptions: statusValues },
    { header: "Account Names", accessor: "AccountNames" },
    { header: "Buying Group Names", accessor: "BuyingGroupNames" },
    { header: "Next", accessor: "FAO", filterType: "multiSelect", filterOptions: nextValues },
    { header: "Creator", accessor: "Owner", filterType: "autocomplete", filterOptions: creatorValues },
    { header: "Created", accessor: "Created", filterType: "dateRange" },
    { header: "Last Modified", accessor: "LastModified", filterType: "dateRange" },
    { header: "Items", accessor: "ItemCount", filterType: "range", min: itemRangeValues.minimum, max: itemRangeValues.maximum },
    { header: "Value", accessor: "OriginalValue", filterType: "range", min: originalValues.minimum, max: originalValues.maximum },
    { header: "Floor Breaks", accessor: "FloorBreaks", filterType: "range", min: floorBreaksValues.minimum, max: floorBreaksValues.maximum },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countryValues },
  ];

  return (
    <>
      <Loader isLoad={loading} />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>{" "}
        /{" "}
        <span className="text-gray-500 font-medium cursor-pointer">Awaiting Results</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      <div className="space-y-3">
        {/* Metrics */}
        <EcommerceMetrics taskCount={taskCount} />

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setChartOpen(!chartOpen)}
            className="flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <span>📊 Summary</span>
            {chartOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {chartOpen && (
            <div className="p-3 border-t border-gray-100">
              <MonthlySalesChart page={"Awaiting Results"} />
            </div>
          )}
        </div>

        {/* Table */}
        <BasicTables
          page={"Awaiting Results"}
          inboxData={inboxData}
          columns={columns}
          checkBox={false}
          searchData={searchData}
          viewDetails={true}
          createOption={false}
          handleViewDetails={handleViewDetails}
        />

        {/* Pagination */}
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
