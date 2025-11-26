import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTaskCount, addCountries } from "../../store/userSlice";
import Loader from "../../components/loader";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState<number>(taskCount.inProgress || 0);
  const [totalPages, setTotalPages] = useState<number>(
    Math.max(1, Math.ceil((taskCount.inProgress || 0) / user.gridPageSize))
  );
  const [chartOpen, setChartOpen] = useState(false);
  const [animatedTaskCount, setAnimatedTaskCount] = useState(taskCount);

  // filter metadata lists
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [nextValues, setNextValues] = useState<string[]>([]);
  const [countryValues, setCountryValues] = useState<string[]>([]);
  const [itemRangeValues, setItemRangeValues] = useState<any>({});
  const [originalValues, setOriginalValues] = useState<any>({});
  const [floorBreaksValues, setFloorBreaksValues] = useState<any>({});
  const [creatorValues, setCreatorValues] = useState<string[]>([]);

  // state that holds the current filters (object) and SQL filter string
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  const [filterString, setFilterString] = useState<string>(
    `AND (1 <> 1 OR tab = 'Inbox') AND tab = 'Inbox'`
  );

  // columns (includes Due)
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
    { header: "Due", accessor: "Due", filterType: "dateRange" },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countryValues },
  ];

  // -------------------------
  // Helpers
  // -------------------------
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  // Format JS Date -> M/D/YYYY HH:MM:SS (user's required format)
  const formatDateForSql = (d: Date | string, endOfDay = false) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    const mm = dt.getMonth() + 1;
    const dd = dt.getDate();
    const yyyy = dt.getFullYear();
    const HH = endOfDay ? "23" : "00";
    const MM = endOfDay ? "59" : "00";
    const SS = endOfDay ? "59" : "00";
    return `${mm}/${dd}/${yyyy} ${HH}:${MM}:${SS}`;
  };

  // Build SQL filter string from filter object (same rules as InProgress)
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND (1 <> 1 OR tab = 'Inbox')`;

    for (const rawKey of Object.keys(obj)) {
      const val = obj[rawKey];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) continue;

      const key = rawKey;
      // skip preset keys here; they'll be handled when base field encountered
      if (key.endsWith("_preset")) continue;

      // handle date arrays (custom) or presets (via <field>_preset)
      const presetKey = `${key}_preset`;
      if (obj[presetKey]) {
        const preset = obj[presetKey];
        if (preset === "All") {
          continue; // no clause
        }
        if (preset === "Custom") {
          if (Array.isArray(val) && val[0] && val[1]) {
            const s = val[0] instanceof Date ? val[0] : new Date(val[0]);
            const e = val[1] instanceof Date ? val[1] : new Date(val[1]);
            clauses.push(`(${key} >= '${formatDateForSql(s, false)}' AND ${key} <= '${formatDateForSql(e, true)}')`);
          }
          continue;
        }
        // preset like "3 Months", "6 Months", "1 Year", etc.
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

      // direct date array without preset (custom)
      if (Array.isArray(val) && val.length === 2 && (val[0] instanceof Date || val[1] instanceof Date || (val[0] && val[1]))) {
        const s = val[0] instanceof Date ? val[0] : new Date(val[0]);
        const e = val[1] instanceof Date ? val[1] : new Date(val[1]);
        clauses.push(`(${key} >= '${formatDateForSql(s, false)}' AND ${key} <= '${formatDateForSql(e, true)}')`);
        continue;
      }

      // numeric ranges
      if (Array.isArray(val) && val.length === 2 && (typeof val[0] === "number" || typeof val[1] === "number")) {
        let dbField = key;
        if (key === "OriginalValue") dbField = "Value";
        clauses.push(`(${dbField} >= ${Number(val[0])} AND ${dbField} <= ${Number(val[1])})`);
        continue;
      }

      // multi-select arrays of strings
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        const parts = val.map((v: string) => `${key} = '${escapeSql(v)}'`);
        clauses.push(`(${parts.join(" OR ")})`);
        continue;
      }

      // text -> LIKE
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
        continue;
      }
    }

    const combined = [base, ...(clauses.length ? clauses.map(c => `AND ${c}`) : []), "AND tab = 'Inbox'"].join(" ");
    return combined;
  };

  // -------------------------
  // Data fetching
  // -------------------------
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
    } catch (error: any) {
      console.error("Error fetching inbox data:", error.message);
      setLoading(false);
    }
  };

  // fetch total count for pagination (with provided SQL filter)
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

      const count = Number(resp.data?.count ?? 0);
      setTotalRecords(count);
      setTotalPages(Math.max(1, Math.ceil(count / recordsPerPage)));
    } catch (err) {
      console.error("Error fetching total count", err);
    }
  };

  // -------------------------
  // When table emits filters object
  // -------------------------
  const onFiltersFromTable = (filtersObj: Record<string, any>) => {
    const obj = filtersObj || {};
    setFiltersState(obj);
    const sql = buildFilterStringFromObject(obj);
    setFilterString(sql);

    // update total count & fetch first page
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // searchData passed to BasicTables (it calls with filters object)
  const searchData = (filtersObj: any) => {
    // keep existing small behaviour if you rely on Name/Owner to update suggestion inputs
    if (filtersObj?.Name) {
      // nothing else here; BasicTables manages suggestions via its own API calls
    }
    if (filtersObj?.Owner) {
      // nothing else here
    }

    onFiltersFromTable(filtersObj || {});
  };

  // -------------------------
  // Filter metadata (suggestions) loading
  // -------------------------
  const fetchMeta = async () => {
    const id = user.userId;
    const api = async (field: string, special = false) => {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload = {
        viewName: `dbo.Inbox_Tasks(${id})`,
        filter: `AND (1 <> 1 OR tab = 'Inbox')`,
        fieldName: field,
      };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

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
      console.error("Error loading filter metadata", err);
    }
  };

  // -------------------------
  // Pagination helpers
  // -------------------------
  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    // fetch current filterString (already set) - fetchData will use filterString state
    fetchData(start, end);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(totalRecords / size)));
    // fetch first page with new page size
    fetchData(1, size);
  };

  // -------------------------
  // Initial load
  // -------------------------
  useEffect(() => {
    // initial data + metadata
    fetchData(1, recordsPerPage);
    fetchTotalCount(filterString); // initial count for Inbox
    fetchMeta();
    fetchTasksCount(); // updates animatedTaskCount and global task counts in redux
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(totalRecords / recordsPerPage)));
  }, [recordsPerPage, totalRecords]);

  // fetchTasksCount & fetchCountries definitions (kept same behaviour)
  async function fetchTasksCount() {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Inbox/taskCounts/${user.userId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(addTaskCount(response.data));
      setAnimatedTaskCount(response.data);
    } catch (error: any) {
      console.error("Error fetching task count:", error.message);
    }
  }

  async function fetchCountries() {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getUsersCountries/${user.userId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      dispatch(addCountries(response.data));
    } catch (error: any) {
      console.error("Error fetching countries:", error.message);
    }
  }

  const handleViewDetails = (row: any) => {
    navigate(`/pricingTable/${row.TaskId}`);
  };

  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>{" "}
        /{" "}
        <span className="text-gray-500 font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Dashboard
        </span>{" "}
        -{" "}
        <span className="text-gray-500 font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>
      </nav>

      <PageMeta
        title="Pricing Tool"
        description=""
      />
      <div className="space-y-3">
        {/* Metrics */}
        <EcommerceMetrics taskCount={animatedTaskCount} />

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
              <MonthlySalesChart page={"Inbox"} />
            </div>
          )}
        </div>

        {/* Table - pass searchData so BasicTables/SmartFilterTable can emit filter objects */}
        <BasicTables
          page={"Inbox"}
          inboxData={inboxData}
          columns={columns}
          checkBox={false}
          searchData={searchData}              // <-- receives filters object
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
