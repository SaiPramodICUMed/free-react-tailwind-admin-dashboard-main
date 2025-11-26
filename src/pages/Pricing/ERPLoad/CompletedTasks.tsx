import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../../components/loader";
import BasicTables from "../../Tables/BasicTables";
import { useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import ERPLOadData from "../ERPLoadData";
import Pagination from "../../../components/Pagination";

export default function CompletedTasks() {
  const user = useSelector((state: any) => state.user.users);

  // grid state
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(user.gridPageSize);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(totalRecords / user.gridPageSize));

  // filter metadata
  const [taskTypeOptions, setTaskTypeOptions] = useState<any[]>([]);
  const [nameOptions, setNameOptions] = useState<any[]>([]);
  const [descriptionOptions, setDescriptionOptions] = useState<any[]>([]);
  const [commentsOptions, setCommentsOptions] = useState<any[]>([]);
  const [itemCountRange, setItemCountRange] = useState<any>({ minimum: 0, maximum: 0 });

  // filters state used for paging
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});
  // current SQL filter string built from filtersState
  const [filterString, setFilterString] = useState<string>(`AND (  1 <> 1  OR LoadStatus = 1 ) AND LoadStatus = 1`);

  const navigate = useNavigate();

  // -----------------------
  // Helpers (same pattern as InProgress)
  // -----------------------
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  const formatDateForSql = (d: Date | string | null, endOfDay = false) => {
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

  // Build SQL Filter string from a filters object
  // Expects keys equal to accessor names from columns.
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = `AND (  1 <> 1  OR LoadStatus = 1 )`; // same base used by suggestions
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) continue;

      const presetKey = `${key}_preset`;
      if (obj[presetKey]) {
        const preset = obj[presetKey];
        if (preset === "All") continue;
        if (preset === "Custom") {
          if (Array.isArray(val) && val[0] && val[1]) {
            clauses.push(`(${key} >= '${formatDateForSql(val[0])}' AND ${key} <= '${formatDateForSql(val[1], true)}')`);
          }
          continue;
        }
        // if preset like "3 Month" or "1 Year" (not used much here) — handle if needed
        if (preset.includes("Month") || preset.includes("Year")) {
          const months = preset.includes("Year") ? Number(preset.split(" ")[0]) * 12 : Number(preset.split(" ")[0]);
          const end = new Date();
          const start = new Date();
          start.setMonth(end.getMonth() - months);
          clauses.push(`(${key} >= '${formatDateForSql(start)}' AND ${key} <= '${formatDateForSql(end, true)}')`);
        }
        continue;
      }

      // numeric range (ItemCount etc.) => array [min, max]
      if (Array.isArray(val) && val.length === 2 && (typeof val[0] === "number" || typeof val[1] === "number")) {
        clauses.push(`(${key} >= ${Number(val[0])} AND ${key} <= ${Number(val[1])})`);
        continue;
      }

      // multi-select array of strings
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        const parts = val.map((v: string) => `${key} = '${escapeSql(v)}'`);
        clauses.push(`(${parts.join(" OR ")})`);
        continue;
      }

      // string/autocomplete => LIKE
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    // finally append base and ensure only Completed (LoadStatus = 1) rows
    const combined = [
      base,
      ...clauses.map((c) => `AND ${c}`),
      "AND LoadStatus = 1",
    ].join(" ");
    return combined;
  };

  // -----------------------
  // API fetchers
  // -----------------------
  // fetch grid data (supports optional filterOverride)
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload: any = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 1)`,
        firstRow: start,
        lastRow: end,
        sortBy: "TaskId",
        sortByDirection: "asc",
        filter: filterOverride ?? filterString,
        fieldList: "*",
        timeout: 0,
      };

      const resp = await axios.post(`https://10.2.6.130:5000/api/Metadata/getData`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setInboxData(resp.data);
      setLoading(false);
      return resp.data;
    } catch (err: any) {
      console.error("Error fetching CompletedTasks data:", err?.message ?? err);
      setLoading(false);
      return null;
    }
  };

  // fetch total count for current filter
  const fetchTotalCount = async (sqlFilter: string) => {
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 1)`,
        filter: sqlFilter,
      };

      const resp = await axios.post(`https://10.2.6.130:5000/api/Metadata/getViewCount`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setTotalRecords(resp.data.count || 0);
      setTotalPages(Math.ceil((resp.data.count || 0) / recordsPerPage));
    } catch (err) {
      console.error("Error fetching completed tasks total count", err);
    }
  };

  // Suggestion API helper for filter dropdowns / autocompletes / minmax
  const suggestionApi = async (field: string, searchTerm = "", special = false) => {
    try {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload: any = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 1)`,
        fieldName: field,
        // baseline filter same as other examples (keeps LoadStatus=1 context)
        filter: `AND (  1 <> 1  OR LoadStatus = 1 )`,
      };

      if (!special && searchTerm) {
        // when searching inside autocomplete, plug searchTerm into filter
        payload.filter = `AND (  1 <> 1  OR LoadStatus = 1 ) AND ( ${field} LIKE N'%${escapeSql(searchTerm)}%' )`;
      }

      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      return res.data;
    } catch (err) {
      console.error("Suggestion API error", err);
      return special ? { minimum: 0, maximum: 0 } : [];
    }
  };

  // load filter metadata (task types, names, description, comments, itemcount min/max)
  const fetchFilterMetadata = async () => {
    try {
      setTaskTypeOptions(await suggestionApi("TaskTypeName"));
      setNameOptions(await suggestionApi("Name"));
      setDescriptionOptions(await suggestionApi("Description"));
      setCommentsOptions(await suggestionApi("Comments"));
      setItemCountRange(await suggestionApi("ItemCount", "", true));
    } catch (err) {
      console.error("Error loading CompletedTasks filter metadata", err);
    }
  };

  // -----------------------
  // When SmartFilterTable sends filters
  // -----------------------
  // filtersObj shape = { TaskTypeName: ['A','B'], Name: 'xyz', StartDate: [d1,d2], ItemCount: [min,max], ... }
  const onFiltersFromTable = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj || {});
    const sql = buildFilterStringFromObject(filtersObj || {});
    setFilterString(sql);

    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  const searchData = (filtersObj: Record<string, any>) => {
    onFiltersFromTable(filtersObj || {});
  };

  // -----------------------
  // Pagination handlers
  // -----------------------
  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);

    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;

    // use currently applied filter
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

  // -----------------------
  // Initial load
  // -----------------------
  useEffect(() => {
    fetchFilterMetadata();
    fetchTotalCount(filterString);
    fetchData(1, recordsPerPage, filterString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  // -----------------------
  // Columns — include filterType/filterOptions where needed
  // Note: TaskId, Qualifiers (Active), LoadStatus left without filters per your request
  // -----------------------
  const columns = [
    { header: "Task Id", accessor: "TaskId" }, // no filter
    { header: "Task Type", accessor: "TaskTypeName", filterType: "multiSelect", filterOptions: taskTypeOptions },
    { header: "PL Name", accessor: "Name", filterType: "autocomplete", filterOptions: nameOptions },
    { header: "PL Desc", accessor: "Description", filterType: "autocomplete", filterOptions: descriptionOptions },
    { header: "PL Comment", accessor: "Comments", filterType: "autocomplete", filterOptions: commentsOptions },
    { header: "New PL Start Date", accessor: "StartDate", filterType: "dateRange" },
    { header: "# Items", accessor: "ItemCount", filterType: "range", min: itemCountRange.minimum, max: itemCountRange.maximum },
    { header: "Qualifiers", accessor: "Active" }, // no filter as requested
    { header: "Status", accessor: "LoadStatus" }, // no filter as requested
  ];

  const handleViewDetails = (row: any) => {
    // if you want to open details page (not required) — example:
    navigate(`/pricingTable/${row.TaskId}`);
  };

  return (
    <>
      <Loader isLoad={loading} />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <span className="font-medium" onClick={() => { navigate('/pricingDashBoard'); }}>Pricing</span> /
        <span className="text-gray-500 font-medium">&nbsp;ERP Load - Completed Tasks</span>
      </nav>

      <PageMeta title="Pricing Tool" description="" />

      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <ERPLOadData />
        </div>

        <div className="col-span-12">
          <BasicTables
            page={'Pricing - ERP Load - Completed Tasks'}
            inboxData={inboxData}
            columns={columns}
            // wire the advanced filter/search system into BasicTables / SmartFilterTable
            searchData={searchData}
            viewDetails={true}
            createOption={false}
            handleViewDetails={handleViewDetails}
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
              onRecordsPerPageChange={(val) => {
                changeRecordsPerPage(val);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
