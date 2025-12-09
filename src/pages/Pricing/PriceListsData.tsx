import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import { useNavigate } from "react-router";
import Pagination from "../../components/Pagination";

export default function PriceListsData() {
  const user = useSelector((state: any) => state.user.users);
  // ✅ TOP DROPDOWN STATES (DEFAULT FIRST VALUE)
  const [validFilter, setValidFilter] = useState("All");
  const [salesFilter, setSalesFilter] = useState("With 1 Year Sales");

  // grid state
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));

  // filter metadata states
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [descriptionOptions, setDescriptionOptions] = useState<string[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [idOptions, setIdOptions] = useState<string[]>([]);
  const [contractOptions, setContractOptions] = useState<string[]>([]);
  const [activeOptions, setActiveOptions] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);

  const [lastYearSalesRange, setLastYearSalesRange] = useState<any>({ minimum: 0, maximum: 0 });
  const [yrSalesTracingRange, setYrSalesTracingRange] = useState<any>({ minimum: 0, maximum: 0 });
  const [itemCountRange, setItemCountRange] = useState<any>({ minimum: 0, maximum: 0 });

  // filters object saved locally so pagination uses current filters
  const [filtersState, setFiltersState] = useState<Record<string, any>>({});

  const navigate = useNavigate();

  // ---------------- TOP DROPDOWN FILTER SQL ----------------
  const buildTopFilterSql = () => {
    let sql = `AND UserID = ${user.userId}`;

    // ✅ SALES FILTER
    if (salesFilter === "With 1 Year Sales") {
      sql += ` AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`;
    } else if (salesFilter === "With Sales") {
      sql += ` AND (AllSales IS NOT NULL AND AllSales <> 0)`;
    }

    // ✅ VALID FILTER
    if (validFilter === "Currently valid") {
      sql += ` AND CountryId = 14 AND CurrentlyActive = 1`;
    } else if (validFilter === "Valid in last year") {
      sql += ` AND CountryId = 14 AND ActiveInLastYear = 1`;
    }

    return sql;
  };

  // helper: escape single quote for SQL
  const escapeSql = (s: string) => (s == null ? "" : String(s).replace(/'/g, "''"));

  // Format JS Date -> SQL format used in InProgress (MM/DD/YYYY HH:MM:SS)
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

  // Build SQL filter from filters object (similar style to InProgress)
  // Appends UserId and LastYearSales condition at the end.
  const buildFilterStringFromObject = (obj: Record<string, any>) => {
    const clauses: string[] = [];
    const base = ""; // we append mandatory conditions at the end

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val == null || val === "") continue;

      const presetKey = `${key}_preset`;
      if (obj[presetKey]) {
        // preset logic for dates (like InProgress)
        const preset = obj[presetKey];
        if (preset === "All") continue;
        if (preset === "Custom") {
          if (Array.isArray(val) && val[0] && val[1]) {
            clauses.push(`(${key} >= '${formatDateForSql(val[0])}' AND ${key} <= '${formatDateForSql(val[1], true)}')`);
          }
          continue;
        }
        // month/year presets e.g. "6 Month" or "1 Year"
        let months = 0;
        if (preset.includes("Month")) months = Number(preset.split(" ")[0]);
        if (preset.includes("Year")) months = Number(preset.split(" ")[0]) * 12;
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - months);
        clauses.push(`(${key} >= '${formatDateForSql(start)}' AND ${key} <= '${formatDateForSql(end, true)}')`);
        continue;
      }

      // Numeric range: [min,max]
      if (Array.isArray(val) && val.length === 2 && (typeof val[0] === "number" || typeof val[1] === "number")) {
        clauses.push(`(${key} >= ${Number(val[0])} AND ${key} <= ${Number(val[1])})`);
        continue;
      }

      // Multi-select arrays of strings
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        clauses.push("(" + val.map((v: string) => `${key} = '${escapeSql(v)}'`).join(" OR ") + ")");
        continue;
      }

      // Text / autocomplete
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    // mandatory clause per your instructions
    const mandatory = `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`;
    const combined = [base, ...(clauses.length ? clauses.map((c) => `AND ${c}`) : []), mandatory].join(" ");
    return combined;
  };

  // ---------------- GRID DATA FETCH ----------------
  const fetchData = async (start: number, end: number, filterOverride?: string) => {
    setLoading(true);
    try {
      const payload: any = {
        viewName: "vw_PriceLists",
        firstRow: start,
        lastRow: end,
        sortBy: "Id",
        sortByDirection: "asc",
        filter: filterOverride ?? buildTopFilterSql(),
        fieldList: "*",
        timeout: 0,
      };

      const resp = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setInboxData(resp.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error", err);
      setLoading(false);
    }
  };

  const fetchTotalCount = async (sqlFilter: string) => {
    try {
      const payload = {
        viewName: "vw_PriceLists",
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
      console.error("Count error", err);
    }
  };


  // --------- Suggestion / minmax API helper ----------
  const suggestionApi = async (field: string, searchTerm = "", special = false) => {
    try {
      const url = special
        ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
        : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

      const payload: any = {
        viewName: "vw_PriceLists",
        fieldName: field,
        filter: `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`,
      };

      // for autocomplete search
      if (!special && searchTerm) {
        payload.filter = `AND ( ${field} LIKE N'%${escapeSql(searchTerm)}%' ) AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`;
      }

      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      return res.data;
    } catch (err) {
      console.error("Suggestion API error", err);
      return special ? { minimum: 0, maximum: 0 } : [];
    }
  };

  // load filter metadata/options
  const fetchFilterMetadata = async () => {
    try {
      setNameOptions(await suggestionApi("Name"));
      setDescriptionOptions(await suggestionApi("Description"));
      // Type may return list of values
      const typeRes = await suggestionApi("Type");

      if (Array.isArray(typeRes)) {
        const mapped = typeRes
          .filter((x: any) => x?.id || typeof x === "string")
          .map((x: any) => {
            const val = x?.id ?? x;  // sometimes string, sometimes object
            return { value: val, label: val };
          });

        setTypeOptions(mapped);
      } else {
        setTypeOptions([]);
      }

      setIdOptions(await suggestionApi("Id"));
      setContractOptions(await suggestionApi("ContractID"));
      const activeRes = await suggestionApi("Active");

      if (Array.isArray(activeRes)) {
        const mapped = activeRes
          .filter((x: any) => x?.id || typeof x === "string" || typeof x === "number")
          .map((x: any) => {
            const val = x?.id ?? x;  // API may return {id:"Yes"} or "Yes" or 1
            return { value: val, label: val };
          });

        setActiveOptions(mapped);
      } else {
        setActiveOptions([]);
      }

      const ctryRes = await suggestionApi("CountryName");

      if (Array.isArray(ctryRes)) {
        const mapped = ctryRes
          .filter((x: any) => x?.id || typeof x === "string")
          .map((x: any) => {
            const val = x?.id ?? x;
            return { value: val, label: val };
          });

        setCountryOptions(mapped);
      } else {
        setCountryOptions([]);
      }


      setLastYearSalesRange(await suggestionApi("LastYearSales", "", true));
      setYrSalesTracingRange(await suggestionApi("YRSalesTracing", "", true));
      setItemCountRange(await suggestionApi("ItemCount", "", true));
    } catch (err) {
      console.error("Error loading PriceLists filter metadata", err);
    }
  };

  // --------------- when SmartFilterTable sends filters ---------------
  // filtersObj shape expected: { Name: 'abc', Type: ['A','B'], LastYearSales: [min,max], StartDate: [dateFrom,dateTo], StartDate_preset: 'Custom' }
  const onFiltersFromTable = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj || {});
    const sql = buildFilterStringFromObject(filtersObj || {});
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // ---------------- FILTER FROM TABLE ----------------
  const searchData = (filtersObj: Record<string, any>) => {
    setFiltersState(filtersObj || {});
    const sql = buildTopFilterSql();
    fetchTotalCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // ---------------- PAGINATION ----------------
  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);
    const start = (pageNumber - 1) * size + 1;
    const end = pageNumber * size;
    const sql = buildTopFilterSql();
    fetchData(start, end, sql);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(totalRecords / size));
    const sql = buildTopFilterSql();
    fetchData(1, size, sql);
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const sql = buildTopFilterSql();
    fetchTotalCount(sql);
    fetchData(1, user.gridPageSize, sql);
    fetchFilterMetadata();
  }, [validFilter, salesFilter]); // ✅ dropdown reactive

  // ---------------- columns with filter metadata ----------------
  const columns = [
    { header: "Name", accessor: "Name", filterType: "autocomplete", filterOptions: nameOptions },
    { header: "Description", accessor: "Description", filterType: "autocomplete", filterOptions: descriptionOptions },
    { header: "Type", accessor: "Type", filterType: "multiSelect", filterOptions: typeOptions },
    { header: "Header Id", accessor: "Id", filterType: "autocomplete", filterOptions: idOptions },
    { header: "Contract ID", accessor: "ContractID", filterType: "autocomplete", filterOptions: contractOptions },
    { header: "Start Date", accessor: "StartDate", filterType: "dateRange" },
    { header: "End Date", accessor: "EndDate", filterType: "dateRange" },
    { header: "Active", accessor: "Active", filterType: "multiSelect", filterOptions: activeOptions },
    {
      header: "1 YR Sales",
      accessor: "LastYearSales",
      filterType: "range",
      min: lastYearSalesRange.minimum,
      max: lastYearSalesRange.maximum,
    },
    {
      header: "1 YR Sales (traced)",
      accessor: "YRSalesTracing",
      filterType: "range",
      min: yrSalesTracingRange.minimum,
      max: yrSalesTracingRange.maximum,
    },
    { header: "Last Sale Date", accessor: "LastSaleDate", filterType: "dateRange" },
    {
      header: "Items On Price List",
      accessor: "ItemCount",
      filterType: "range",
      min: itemCountRange.minimum,
      max: itemCountRange.maximum,
    },
    { header: "Country", accessor: "CountryName", filterType: "multiSelect", filterOptions: countryOptions },
  ];

  return (
    <>
      <Loader isLoad={loading} />

      <nav className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium" onClick={() => navigate("/pricingDashBoard")}>
            Pricing
          </span>{" "}
          / <span className="text-gray-500 font-medium">Price Lists</span>
        </div>

        {/* ✅ TOP RIGHT STATIC DROPDOWNS */}
        <div className="flex items-center gap-4">
          <div>
            <label className="mr-2 text-sm font-medium">Valid Filter:</label>
            <select
              value={validFilter}
              onChange={(e) => setValidFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option>All</option>
              <option>Currently valid</option>
              <option>Valid in last year</option>
            </select>
          </div>

          <div>
            <label className="mr-2 text-sm font-medium">Sales Filter:</label>
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option>With 1 Year Sales</option>
              <option>With Sales</option>
              <option>All</option>
            </select>
          </div>
        </div>
      </nav>

      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-12 mt-8">
          <BasicTables
            page={"Pricing - Price Lists"}
            inboxData={inboxData}
            columns={columns}
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
              onRecordsPerPageChange={(val) => changeRecordsPerPage(val)}
            />
          )}
        </div>
      </div>
    </>
  );

}
