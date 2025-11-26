import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function All() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const navigate = useNavigate();

  // grid / data
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [chartOpen, setChartOpen] = useState(false);

  // filter metadata for suggestions / ranges
  const [taskNames, setTaskNames] = useState<string[]>([]);
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [nextValues, setNextValues] = useState<string[]>([]);
  const [countryValues, setCountryValues] = useState<string[]>([]);
  const [creatorValues, setCreatorValues] = useState<string[]>([]);
  const [itemRangeValues, setItemRangeValues] = useState<any>({});
  const [originalValues, setOriginalValues] = useState<any>({});
  const [floorBreaksValues, setFloorBreaksValues] = useState<any>({});

  // filter object (kept for debugging / potential future use)
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  // SQL filter string used for fetches
  const [filterString, setFilterString] = useState<string>(
    `AND (1 <> 1 OR tab <> 'Inbox') AND tab <> 'Inbox'`
  );

  // -------------------------
  // Helpers
  // -------------------------
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  const formatDateForSql = (d: Date, endOfDay = false) => {
    if (!d) return "";
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const yyyy = d.getFullYear();
    const HH = endOfDay ? "23" : "00";
    const MM = endOfDay ? "59" : "00";
    const SS = endOfDay ? "59" : "00";
    return `${mm}/${dd}/${yyyy} ${HH}:${MM}:${SS}`;
  };

  // Build SQL filter string from filter object (same logic as InProgress)
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND (1 <> 1 OR tab <> 'Inbox')`;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val == null || val === "") continue;

      const presetKey = `${key}_preset`;
      if (obj[presetKey]) {
        const preset = obj[presetKey];

        if (preset === "All") continue;

        if (preset === "Custom") {
          if (Array.isArray(val) && val[0] && val[1]) {
            clauses.push(
              `(${key} >= '${formatDateForSql(val[0])}' AND ${key} <= '${formatDateForSql(
                val[1],
                true
              )}')`
            );
          }
          continue;
        }

        let months = 0;
        if (preset.includes("Month")) months = Number(preset.split(" ")[0]);
        if (preset.includes("Year")) months = Number(preset.split(" ")[0]) * 12;

        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - months);

        clauses.push(
          `(${key} >= '${formatDateForSql(start)}' AND ${key} <= '${formatDateForSql(
            end,
            true
          )}')`
        );
        continue;
      }

      // numeric ranges
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === "number") {
        const dbField = key === "OriginalValue" ? "Value" : key;
        clauses.push(`(${dbField} >= ${val[0]} AND ${dbField} <= ${val[1]})`);
        continue;
      }

      // multi-select arrays of strings
      if (Array.isArray(val) && typeof val[0] === "string") {
        clauses.push(
          "(" + val.map((v: string) => `${key} = '${escapeSql(v)}'`).join(" OR ") + ")"
        );
        continue;
      }

      // text search
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    return [
      base,
      ...clauses.map((c) => `AND ${c}`),
      "AND tab <> 'Inbox'",
    ].join(" ");
  };

  // -------------------------
  // Server interactions
  // -------------------------
  // Fetch total rows matching filter
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

      setTotalRecords(resp.data.count);
      setTotalPages(Math.ceil(resp.data.count / recordsPerPage));
    } catch (err) {
      console.error("Error fetching total count", err);
    }
  };

  // Fetch grid rows (supports providing a filterOverride)
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
      console.error("Error fetching All data:", error.message);
      setLoading(false);
    }
  };

  // When SmartFilterTable sends filters
  const onFiltersFromTable = (filtersObj: any) => {
    setFiltersState(filtersObj || {});
    const sql = buildFilterStringFromObject(filtersObj || {});
    setFilterString(sql);

    // update counts & fetch page 1
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  const searchData = (filtersObj: any) => {
    onFiltersFromTable(filtersObj || {});
  };

  // Pagination helpers
  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);

    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    // use current filter string
    fetchData(start, end);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalRecords / size));
    fetchData(1, size);
  };

  // -------------------------
  // Suggestion / metadata fetching (filter options + min/max)
  // -------------------------
  const fetchMeta = async () => {
    const id = user.userId;

    const api = async (field: string, special = false) => {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload = {
        viewName: `dbo.Inbox_Tasks(${id})`,
        // use same base filter that excludes Inbox
        filter: `AND (1 <> 1 OR tab <> 'Inbox')`,
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
      console.error("Error fetching filter metadata", err);
    }
  };

  // -------------------------
  // Columns (with filterType for SmartFilterTable)
  // As you confirmed: same filters as InProgress
  // -------------------------
  const columns = [
    { header: "Task Name", accessor: "Name", filterType: "autocomplete", filterOptions: taskNames },
    { header: "Task Type", accessor: "TaskType", filterType: "multiSelect", filterOptions: taskTypes },
    { header: "Status", accessor: "TaskStatus", filterType: "multiSelect", filterOptions: statusValues },
    { header: "Account Names", accessor: "AccountNames" }, // no filter requested
    { header: "Buying Group Names", accessor: "BuyingGroupNames" }, // no filter requested
    { header: "Creator", accessor: "Owner", filterType: "autocomplete", filterOptions: creatorValues },
    { header: "Created", accessor: "Created", filterType: "dateRange" },
    { header: "Last Modified", accessor: "LastModified", filterType: "dateRange" },
    {
      header: "Items",
      accessor: "ItemCount",
      filterType: "range",
      min: itemRangeValues.minimum,
      max: itemRangeValues.maximum,
    },
    {
      header: "Value",
      accessor: "OriginalValue",
      filterType: "range",
      min: originalValues.minimum,
      max: originalValues.maximum,
    },
    {
      header: "Floor Breaks",
      accessor: "FloorBreaks",
      filterType: "range",
      min: floorBreaksValues.minimum,
      max: floorBreaksValues.maximum,
    },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countryValues },
  ];

  // -------------------------
  // Initial load
  // -------------------------
  useEffect(() => {
    // load page 1 with default filter
    fetchData(1, recordsPerPage);
    // load count for pagination
    fetchTotalCount(filterString);
    // load metadata for suggestions
    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  return (
    <>
      <Loader isLoad={loading} />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>{" "}
        /{" "}
        <span className="text-gray-500 font-medium cursor-pointer">All</span>
      </nav>

      <PageMeta
        title="Pricing Tool"
        description=""
      />

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
              <MonthlySalesChart page={"All"} />
            </div>
          )}
        </div>

        {/* Table with Smart filters */}
        <BasicTables
          page={"All"}
          inboxData={inboxData}
          columns={columns}
          checkBox={false}
          searchData={searchData}               // table will call this with the filter object
          viewDetails={true}
          createOption={false}
          handleViewDetails={(row: any) => navigate(`/pricingTable/${row.TaskId}`)}
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
