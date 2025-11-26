import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Drafts() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const navigate = useNavigate();

  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);

  // FILTER METADATA
  const [taskNames, setTaskNames] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [creatorValues, setCreatorValues] = useState([]);
  const [countryValues, setCountryValues] = useState([]);
  const [itemRangeValues, setItemRangeValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [floorBreaksValues, setFloorBreaksValues] = useState({});

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(taskCount.draft || 0);
  const [totalPages, setTotalPages] = useState(
    Math.ceil((taskCount.draft || 0) / user.gridPageSize)
  );

  const [chartOpen, setChartOpen] = useState(false);

  // FILTER STATE
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  const [filterString, setFilterString] = useState<string>(
    `AND (1 <> 1 OR tab = 'Draft') AND tab = 'Draft'`
  );

  // Escape SQL
  const escapeSql = (s: string) =>
    s == null ? "" : String(s).replace(/'/g, "''");

  // Format JS Date → SQL
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

  // Build SQL filter
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND (1 <> 1 OR tab = 'Draft')`;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (!val && val !== 0) continue;

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

        // Months or Years
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

      // Numeric range
      if (Array.isArray(val) && val.length === 2 && typeof val[0] === "number") {
        const dbField = key === "OriginalValue" ? "Value" : key;
        clauses.push(`(${dbField} >= ${val[0]} AND ${dbField} <= ${val[1]})`);
        continue;
      }

      // Multi-select string
      if (Array.isArray(val) && typeof val[0] === "string") {
        clauses.push(
          "(" + val.map((v: string) => `${key} = '${escapeSql(v)}'`).join(" OR ") + ")"
        );
        continue;
      }

      // LIKE text search
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    return [base, ...clauses.map((c) => `AND ${c}`), "AND tab = 'Draft'"].join(
      " "
    );
  };

  // Fetch total count
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

  // Fetch paginated records
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        firstRow: start,
        lastRow: end,
        sortBy: "Created",
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
      console.error("Error fetching Drafts", error.message);
      setLoading(false);
    }
  };

  // When SmartFilterTable sends filters
  const searchData = (filtersObj: any) => {
    setFiltersState(filtersObj);
    const sql = buildFilterStringFromObject(filtersObj);
    setFilterString(sql);

    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // Pagination actions
  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);

    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    fetchData(start, end);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalRecords / size));
    fetchData(1, size);
  };

  // Metadata fetch
  const fetchMeta = async () => {
    const id = user.userId;

    const api = async (field: string, special = false) => {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload = {
        viewName: `dbo.Inbox_Tasks(${id})`,
        filter: `AND (1 <> 1 OR tab = 'Draft')`,
        fieldName: field,
      };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      return res.data;
    };

    setTaskNames(await api("Name"));
    setTaskTypes(await api("TaskType"));
    setStatusValues(await api("Status"));
    setCreatorValues(await api("Owner"));
    setCountryValues(await api("CountryName"));

    setItemRangeValues(await api("ItemCount", true));
    setOriginalValues(await api("Value", true));
    setFloorBreaksValues(await api("FloorBreaks", true));
  };

  // Initial load
  useEffect(() => {
    fetchMeta();
    fetchData(1, recordsPerPage);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // Columns with filters (EXACT same as InProgress except no Due)
  const columns = [
    { header: "Task Name", accessor: "Name", filterType: "autocomplete", filterOptions: taskNames },
    { header: "Task Type", accessor: "TaskType", filterType: "multiSelect", filterOptions: taskTypes },
    { header: "Status", accessor: "TaskStatus", filterType: "multiSelect", filterOptions: statusValues },
    { header: "Account Names", accessor: "AccountNames" },
    { header: "Buying Group Names", accessor: "BuyingGroupNames" },
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

  return (
    <>
      <Loader isLoad={loading} />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium cursor-pointer" onClick={() => navigate("/home")}>
          Inbox
        </span>{" "}
        /{" "}
        <span className="text-gray-500 font-medium cursor-pointer">Drafts</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      <div className="space-y-3">
        <EcommerceMetrics taskCount={taskCount} />

        {/* Summary */}
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
              <MonthlySalesChart page={"Drafts"} />
            </div>
          )}
        </div>

        {/* Table */}
        <BasicTables
          page={"Drafts"}
          inboxData={inboxData}
          columns={columns}
          checkBox={false}
          searchData={searchData}
          viewDetails={true}
          createOption={false}
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
