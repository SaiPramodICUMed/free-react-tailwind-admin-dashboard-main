import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTaskCount, addCountries } from "../../store/userSlice";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function InProgress() {
  const user = useSelector((state: any) => state.user.users);
  const taskCount = useSelector((state: any) => state.user.taskCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inboxData, setInboxData] = useState([]);
  const [taskNames, setTaskNames] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [nextValues, setNextValues] = useState([]);
  const [countryValues, setCountryValues] = useState([]);
  const [itemRangeValues, setItemRangeValues] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [floorBreaksValues, setFloorBreaksValues] = useState({});
  const [creatorValues, setCreatorValues] = useState([]);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);

  const [totalRecords, setTotalRecords] = useState(taskCount.inProgress || 0);
  const [totalPages, setTotalPages] = useState(
    Math.ceil((taskCount.inProgress || 0) / user.gridPageSize)
  );

  const [chartOpen, setChartOpen] = useState(false);

  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  const [filterString, setFilterString] = useState<string>(
    `AND (1 <> 1 OR tab = 'inprogress') AND tab = 'inprogress'`
  );

  // Escape SQL
  const escapeSql = (s: string) =>
    s == null ? "" : String(s).replace(/'/g, "''");

  // Format JS Date → SQL format
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

  // Build SQL Filter
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND (1 <> 1 OR tab = 'inprogress')`;

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

        const now = new Date();
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

      if (Array.isArray(val) && val.length === 2 && typeof val[0] === "number") {
        const dbField = key === "OriginalValue" ? "Value" : key;
        clauses.push(`(${dbField} >= ${val[0]} AND ${dbField} <= ${val[1]})`);
        continue;
      }

      if (Array.isArray(val) && typeof val[0] === "string") {
        clauses.push(
          "(" + val.map((v: string) => `${key} = '${escapeSql(v)}'`).join(" OR ") + ")"
        );
        continue;
      }

      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    return [
      base,
      ...clauses.map((c) => `AND ${c}`),
      "AND tab = 'inprogress'",
    ].join(" ");
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

  // Fetch grid data
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
      console.error("Error fetching In Progress", error.message);
      setLoading(false);
    }
  };

  // When SmartFilterTable sends filters
  const onFiltersFromTable = (filtersObj: any) => {
    setFiltersState(filtersObj);
    const sql = buildFilterStringFromObject(filtersObj);
    setFilterString(sql);

    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  const searchData = (filtersObj: any) => {
    onFiltersFromTable(filtersObj || {});
  };

  // Pagination
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

  // INITIAL LOAD
  useEffect(() => {
    fetchData(1, recordsPerPage);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  const handleViewDetails = (row: any) => {
    navigate(`/pricingTable/${row.TaskId}`);
  };

  // ---------------- Filter metadata loads (unchanged) ----------------
  const fetchMeta = async () => {
    const id = user.userId;

    const api = async (field: string, special = false) => {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload = {
        viewName: `dbo.Inbox_Tasks(${id})`,
        filter: `AND (1 <> 1 OR tab = 'Inprogress')`,
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
    setNextValues(await api("FAO"));
    setCreatorValues(await api("Owner"));
    setCountryValues(await api("CountryName"));

    setItemRangeValues(await api("ItemCount", true));
    setOriginalValues(await api("Value", true));
    setFloorBreaksValues(await api("FloorBreaks", true));
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  // Columns
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
    { header: "Due", accessor: "Due", filterType: "dateRange" },
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
        <span className="text-gray-500 font-medium cursor-pointer">In Progress</span>
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
              <MonthlySalesChart page={"In Progress"} />
            </div>
          )}
        </div>

        {/* Table */}
        <BasicTables
          page={"In Progress"}
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
