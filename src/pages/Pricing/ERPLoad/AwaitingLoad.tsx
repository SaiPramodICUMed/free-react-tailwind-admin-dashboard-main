import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../../components/loader";
import BasicTables from "../../Tables/BasicTables";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import ERPLOadData from "../ERPLoadData";
import Pagination from "../../../components/Pagination";

export default function AwaitingLoad() {
  const user = useSelector((state: any) => state.user.users);

  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(1);

  // 🔥 Filter metadata
  const [taskTypes, setTaskTypes] = useState([]);
  const [names, setNames] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [comments, setComments] = useState([]);
  const [itemRangeValues, setItemRangeValues] = useState({ minimum: 0, maximum: 0 });

  const [filtersState, setFiltersState] = useState({});
  const navigate = useNavigate();

  // Escape SQL
  const escapeSql = (s: string) =>
    s == null ? "" : String(s).replace(/'/g, "''");

  // Format JS Date → SQL (for dateRange)
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

  // Build SQL filter (same as CompletedTasks)
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND ( 1 <> 1 OR LoadStatus = 2 )`;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val == null || val === "") continue;

      // Date range
      if (Array.isArray(val) && val[0] instanceof Date) {
        if (val[0] && val[1]) {
          clauses.push(
            `(${key} >= '${formatDateForSql(val[0])}' AND ${key} <= '${formatDateForSql(
              val[1],
              true
            )}')`
          );
        }
        continue;
      }

      // Range number [min,max]
      if (Array.isArray(val) && typeof val[0] === "number") {
        clauses.push(`(${key} >= ${val[0]} AND ${key} <= ${val[1]})`);
        continue;
      }

      // MultiSelect
      if (Array.isArray(val) && typeof val[0] === "string") {
        clauses.push(
          "(" + val.map(v => `${key}='${escapeSql(v)}'`).join(" OR ") + ")"
        );
        continue;
      }

      // Text autocomplete
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    return [base, ...clauses.map(c => `AND ${c}`)].join(" ");
  };

  // fetch data with optional filterOverride
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 2)`,
        firstRow: start,
        lastRow: end,
        sortBy: "TaskId",
        sortByDirection: "asc",
        filter: filterOverride ?? `AND ( 1 <> 1 OR LoadStatus = 2 )`,
        fieldList: "*",
        timeout: 0,
      };

      const res = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setInboxData(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // Fetch total count
  const fetchCount = async (sqlFilter: string) => {
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 2)`,
        filter: sqlFilter,
      };

      const res = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload
      );

      setTotalRecords(res.data.count);
      setTotalPages(Math.ceil(res.data.count / recordsPerPage));
    } catch {}
  };

  // When SmartFilterTable triggers search
  const searchData = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj);

    const sql = buildFilterStringFromObject(filtersObj);
    fetchCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // Pagination
  const setPageChange = (pageNumber: number, perPage?: number) => {
    const size = perPage ?? recordsPerPage;
    setCurrentPage(pageNumber);

    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    const sql = buildFilterStringFromObject(filtersState);
    fetchData(start, end, sql);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setTotalPages(Math.ceil(totalRecords / size));
    fetchData(1, size);
  };

  // Load metadata
  const suggestionApi = async (field: string, special = false) => {
    const url = special
      ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
      : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

    const payload = {
      viewName: `dbo.GetLoadTasks(${user.userId}, 2)`,
      fieldName: field,
      filter: `AND ( 1 <> 1 OR LoadStatus = 2 )`,
    };

    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  };

  const loadMetadata = async () => {
    setTaskTypes(await suggestionApi("TaskTypeName"));
    setNames(await suggestionApi("Name"));
    setDescriptions(await suggestionApi("Description"));
    setComments(await suggestionApi("Comments"));
    setItemRangeValues(await suggestionApi("ItemCount", true));
  };

  useEffect(() => {
    loadMetadata();
    fetchCount(`AND ( 1 <> 1 OR LoadStatus = 2 )`);
    fetchData(1, user.gridPageSize);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // Columns with filters
  const columns = [
    { header: "Task Id", accessor: "TaskId" },

    { header: "Task Type", accessor: "TaskTypeName", filterType: "multiSelect", filterOptions: taskTypes },

    { header: "PL Name", accessor: "Name", filterType: "autocomplete", filterOptions: names },

    { header: "PL Desc", accessor: "Description", filterType: "autocomplete", filterOptions: descriptions },

    { header: "PL Comment", accessor: "Comments", filterType: "autocomplete", filterOptions: comments },

    { header: "New PL Start Date", accessor: "StartDate", filterType: "dateRange" },

    { header: "# Items", accessor: "ItemCount", filterType: "range", min: itemRangeValues.minimum, max: itemRangeValues.maximum },

    { header: "Qualifiers", accessor: "Active" },
    { header: "Status", accessor: "LoadStatus" }
  ];

  return (
    <>
      <Loader isLoad={loading} />

      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium cursor-pointer" onClick={() => navigate('/pricingDashBoard')}>
          Pricing
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;ERP Load - Awaiting Load</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <ERPLOadData />
        </div>

        <div className="col-span-12">
          <BasicTables
            page={'Pricing - ERP Load - Awaiting Load'}
            inboxData={inboxData}
            columns={columns}
            searchData={searchData}
          />
        </div>

        <div className="col-span-12">
          {inboxData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setPageChange}
              onRecordsPerPageChange={changeRecordsPerPage}
            />
          )}
        </div>
      </div>
    </>
  );
}
