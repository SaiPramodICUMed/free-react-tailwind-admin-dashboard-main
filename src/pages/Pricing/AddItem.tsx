import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import { useNavigate } from "react-router";
import { resetRecords } from "../../store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../components/Pagination";
import { useLocation } from "react-router-dom";

const AddItem: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const taskId = useSelector((state: any) => state.user.taskDetails);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const taskIdFromUrl = params.get("taskId");

  // FINAL TASK ID (if URL passed → use it, else → Redux)
  const finalTaskId = taskIdFromUrl ? Number(taskIdFromUrl) : taskId.taskId;
  console.log('finalTaskId',finalTaskId);

  const [filterMode, setFilterMode] = useState<"sales" | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(1);
  const [selectedCount, setSelectedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Filter state
  const [filtersState, setFiltersState] = useState({});

  // 🔹 Metadata
  const [items, setItems] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [segment1, setSegment1] = useState([]);
  const [segment2, setSegment2] = useState([]);
  const [segment3, setSegment3] = useState([]);
  const [segment4, setSegment4] = useState([]);
  const [segment5, setSegment5] = useState([]);
  const [itemStatus, setItemStatus] = useState([]);
  const [superFranchise, setSuperFranchise] = useState([]);
  const [salesRange, setSalesRange] = useState({ minimum: 0, maximum: 0 });

  // 🔹 SQL helpers
  const escapeSql = (s: string) =>
    s == null ? "" : String(s).replace(/'/g, "''");

  const buildSqlFromFilters = (obj: any) => {
    const clauses: string[] = [];
    let base = `AND TaskId = ${finalTaskId}`;
    console.log('filterMode', filterMode);
    if (filterMode === "sales") base += ` AND Sales IS NOT NULL`;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (!val) continue;

      // RANGE
      if (Array.isArray(val) && typeof val[0] === "number") {
        clauses.push(`(${key} >= ${val[0]} AND ${key} <= ${val[1]})`);
        continue;
      }

      // MULTISELECT
      if (Array.isArray(val) && typeof val[0] === "string") {
        clauses.push(
          "(" + val.map((v: string) => `${key}='${escapeSql(v)}'`).join(" OR ") + ")"
        );
        continue;
      }

      // AUTOCOMPLETE
      if (typeof val === "string") {
        clauses.push(`(${key} LIKE N'%${escapeSql(val)}%')`);
      }
    }

    return [base, ...clauses.map(c => `AND ${c}`)].join(" ");
  };

  // -------------------------
  // Fetch Count
  // -------------------------
  const fetchCount = async (sql?: string) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_MissingItems`,
        filter: sql ?? `AND TaskId = ${finalTaskId}`,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload
      );

      setTotalRecords(response.data.count);
      setTotalPages(Math.ceil(response.data.count / recordsPerPage));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // -------------------------
  // Fetch Data
  // -------------------------
  const fetchData = async (start: number, end: number, sqlOverride?: string) => {
    setLoading(true);
    
    try {
      const payload = {
        viewName: `vw_MissingItems`,
        firstRow: start,
        lastRow: end,
        sortBy: "Item",
        sortByDirection: "asc",
        filter: sqlOverride ?? buildSqlFromFilters(filtersState),
        fieldList: "*",
        timeout: 0,
      };
console.log('payload', payload);
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload
      );
console.log('test data', response.data);
      setTableData(response.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // -------------------------
  // When Smart Filter triggers
  // -------------------------
  const searchData = (filtersObj: any) => {
    setFiltersState(filtersObj);
    const sql = buildSqlFromFilters(filtersObj);

    fetchCount(sql);
    fetchData(1, recordsPerPage, sql);
    setCurrentPage(1);
  };

  // -------------------------
  // Pagination
  // -------------------------
  const setPageChange = (page: number, listPerPage?: number) => {
    const size = listPerPage || recordsPerPage;
    setCurrentPage(page);

    const start = (page - 1) * size + 1;
    const end = page * size;
    const sql = buildSqlFromFilters(filtersState);

    fetchData(start, end, sql);
  };

  const changeRecordsPerPage = (size: number) => {
    setRecordsPerPage(size);
    setTotalPages(Math.ceil(totalRecords / size));
    fetchData(1, size);
  };

  // -------------------------
  // Suggestion API
  // -------------------------
  const suggestionApi = async (field: string, minmax = false) => {
    const url = minmax
      ? `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/getMinMax`
      : `https://vm-www-dprice01.icumed.com:5000/api/Suggestion/get`;

    const payload = {
      viewName: `vw_MissingItems`,
      fieldName: field,
      filter: `AND TaskId = ${finalTaskId}`,
    };

    const res = await axios.post(url, payload);
    return res.data;
  };

  const loadMeta = async () => {
    const it = await suggestionApi("Item");
    setItems(it.map((x: any) => x.id ?? x));

    const ds = await suggestionApi("Description");
    setDescriptions(ds.map((x: any) => x.id ?? x));

    const s1 = await suggestionApi("Segment1");
    setSegment1(s1.map((x: any) => x.id ?? x));

    const s2 = await suggestionApi("Segment2");
    setSegment2(s2.map((x: any) => x.id ?? x));

    const s3 = await suggestionApi("Segment3");
    setSegment3(s3.map((x: any) => x.id ?? x));

    const s4 = await suggestionApi("Segment4");
    setSegment4(s4.map((x: any) => x.id ?? x));

    const s5 = await suggestionApi("Segment5");
    setSegment5(s5.map((x: any) => x.id ?? x));

    const st = await suggestionApi("ItemStatus");
    setItemStatus(st.map((x: any) => x.id));      // ✅ FIXED

    const sf = await suggestionApi("SuperFranchise");
    setSuperFranchise(sf.map((x: any) => x.id));  // ✅ FIXED

    setSalesRange(await suggestionApi("Sales", true));
  };



  // -------------------------
  // Init
  // -------------------------
  useEffect(() => {
    loadMeta();
    fetchData(1, user.gridPageSize);
    fetchCount();
  }, []);

  useEffect(() => {
  const sql = buildSqlFromFilters(filtersState);

  setCurrentPage(1); // reset to page 1
  
  fetchCount(sql);
  fetchData(1, recordsPerPage, sql);
}, [filterMode]);


  useEffect(() => {
    const count = selectedRows.filter((r: any) => r.checked).length;
    setSelectedCount(count);
  }, [selectedRows]);

  // -------------------------
  // Add Selected
  // -------------------------
  const selected = async () => {
    const selected = selectedRows.filter((row: any) => row.checked);
    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    }

    const payload = {
      taskId: finalTaskId,
      userId: user.userId,
      items: selected.map((row: any) => ({
        lotId: -1,
        itemId: row.INVENTORY_ITEM_ID,
        taskItemId: null,
      })),
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/AddItemsToPriceList`,
        payload
      );

      setLoading(false);
      if (response.data?.result === 1) {
        dispatch(resetRecords(selected));
        navigate(`/pricingTable/${finalTaskId}`);
      } else {
        alert("Failed to add items.");
      }
    } catch {
      setLoading(false);
      alert("Error while adding items.");
    }
  };

  // -------------------------
  // ✅ Add ALL Filtered SKUs (BATCHED & SAFE)
  // -------------------------
  const addAllFiltered = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get ALL filtered records (without pagination)
      const sql = buildSqlFromFilters(filtersState);

      const fetchAllPayload = {
        viewName: `vw_MissingItems`,
        firstRow: 1,
        lastRow: totalRecords, // ✅ fetch everything in filter
        sortBy: "Item",
        sortByDirection: "asc",
        filter: sql,
        fieldList: "*",
        timeout: 0,
      };

      const allRes = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        fetchAllPayload
      );

      const allRows = allRes.data || [];

      if (allRows.length === 0) {
        setLoading(false);
        alert("No records found for current filter.");
        return;
      }

      // 2️⃣ Convert to API format
      const allItemsPayload = allRows.map((row: any) => ({
        lotId: -1,
        itemId: row.INVENTORY_ITEM_ID,
        taskItemId: null,
      }));

      // 3️⃣ Chunking for performance safety (50 per request)
      const CHUNK_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < allItemsPayload.length; i += CHUNK_SIZE) {
        chunks.push(allItemsPayload.slice(i, i + CHUNK_SIZE));
      }

      // 4️⃣ Call API sequentially (safe for server)
      for (const batch of chunks) {
        const payload = {
          taskId: finalTaskId,
          userId: user.userId,
          items: batch,
        };

        const res = await axios.post(
          `https://vm-www-dprice01.icumed.com:5000/api/Pricing/AddItemsToPriceList`,
          payload
        );

        if (res.data?.result !== 1) {
          throw new Error("Batch failed");
        }
      }

      setLoading(false);

      alert("All filtered SKUs added successfully!");

      // ✅ Navigate after full success
      navigate(`/pricingTable/${finalTaskId}`);

    } catch (error) {
      console.error("Add All Filtered Error:", error);
      setLoading(false);
      alert("Failed while adding all filtered SKUs.");
    }
  };


  const handleBack = () => navigate(`/pricingTable/${finalTaskId}`);

  // ✅ FILTER ENABLED COLUMNS
  const columns = [
    { header: "Item", accessor: "Item", filterType: "autocomplete", filterOptions: items },
    { header: "Item Description", accessor: "Description", filterType: "autocomplete", filterOptions: descriptions },
    { header: "Super Franchise", accessor: "SuperFranchise", filterType: "multiSelect", filterOptions: superFranchise },
    { header: "GPH 1", accessor: "Segment1", filterType: "autocomplete", filterOptions: segment1 },
    { header: "GPH 2", accessor: "Segment2", filterType: "autocomplete", filterOptions: segment2 },
    { header: "GPH 3", accessor: "Segment3", filterType: "autocomplete", filterOptions: segment3 },
    { header: "GPH 4", accessor: "Segment4", filterType: "autocomplete", filterOptions: segment4 },
    { header: "GPH 5", accessor: "Segment5", filterType: "autocomplete", filterOptions: segment5 },
    { header: "Status", accessor: "ItemStatus", filterType: "multiSelect", filterOptions: itemStatus },
    {
      header: "Sales",
      accessor: "Sales",
      filterType: "range",
      min: salesRange.minimum,
      max: salesRange.maximum,
    },
  ];

  return (
    <div className="w-full h-full p-3 bg-white text-sm">
      <Loader isLoad={loading} />

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Add Item</h2>
      </div>

      <div className="flex items-center space-x-4 mb-2 text-gray-700">
        <span>Show:</span>

        <label className="flex items-center gap-1">
          <input type="radio" checked={filterMode === "sales"} onChange={() => setFilterMode("sales")} />
          SKUs with sales
        </label>

        <label className="flex items-center gap-1">
          <input type="radio" checked={filterMode === "all"} onChange={() => setFilterMode("all")} />
          All SKUs
        </label>
      </div>

      <BasicTables
        page={"In Progress"}
        inboxData={tableData}
        columns={columns}
        checkBox={true}
        setSelectedRows={setSelectedRows}
        searchData={searchData}
      />

      {tableData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          onPageChange={setPageChange}
          onRecordsPerPageChange={(val) => changeRecordsPerPage(val)}
        />
      )}

      <div className="flex justify-between items-center mt-3">
        <button className="px-3 py-1 border rounded" onClick={handleBack}>
          Back to Task
        </button>

        <button
          className="px-4 py-1.5 rounded bg-blue-600 text-white"
          onClick={addAllFiltered}
        >
          Add All Filtered SKUs ({totalRecords} in filter)
        </button>


        <button
          className="px-4 py-1.5 rounded bg-blue-600 text-white"
          onClick={selected}
        >
          Add Selected SKUs ({selectedCount} selected)
        </button>
      </div>
    </div>
  );
};

export default AddItem;
