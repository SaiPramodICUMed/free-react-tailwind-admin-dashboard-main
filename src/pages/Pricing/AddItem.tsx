import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import { useNavigate } from "react-router";
import { resetRecords } from "../../store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../components/Pagination";

interface RowData {
  item: string;
  description: string;
  franchise: string;
  gph1: string;
  gph2: string;
  gph3: string;
  gph4: string;
  gph5: string;
  status: string;
  sales: string;
}

const AddItem: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [filterMode, setFilterMode] = useState<"sales" | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalRecords, setTotalRecords] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const columns = [
    { header: "Item", accessor: "Item" },
    { header: "Item Description", accessor: "Description" },
    { header: "Super Franchise", accessor: "SuperFranchise" },
    { header: "GPH 1", accessor: "Segment1" },
    { header: "GPH 2", accessor: "Segment2" },
    { header: "GPH 3", accessor: "Segment3" },
    { header: "GPH 4", accessor: "Segment4" },
    { header: "GPH 5", accessor: "Segment5" },
    { header: "Status", accessor: "ItemStatus" },
    { header: "Sales", accessor: "Sales" },
  ];

  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const noOfrecordsPerPage = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);

    let start = pageNumber === 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end = pageNumber === 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;

    fetchData(start, end);
  };

  const fetchCount = async () => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_MissingItems`,
        filter: `AND TaskId = 255457 AND Sales IS NOT NULL`,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch {
      return null;
    }
  };

  const changeRecordsPerPage = (recordsPerPage: number) => {
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  const selected = () => {
    const selected = selectedRows.filter((row: any) => row.checked);
    if (selected.length === 0) {
      alert("Please select at least one record");
      return;
    } else {
      dispatch(resetRecords(selected));
      navigate("/pricingTable");
    }
  };

  const fetchData = async (start: number, end: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_MissingItems`,
        firstRow: start,
        lastRow: end,
        sortBy: "Item",
        sortByDirection: "asc",
        filter: `AND TaskId = 253459`,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setTableData(response.data);
      setLoading(false);
      return response.data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchData(1, user.gridPageSize);
    fetchCount();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  return (
    <div className="w-full h-full p-3 bg-white text-sm">
      <Loader isLoad={loading} />

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Add Item</h2>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4 mb-2 text-gray-700">
        <span>Show:</span>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={filterMode === "sales"}
            onChange={() => setFilterMode("sales")}
          />
          SKUs with sales
        </label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={filterMode === "all"}
            onChange={() => setFilterMode("all")}
          />
          All SKUs
        </label>

        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 border rounded bg-blue-50 text-blue-700">
            Basic
          </button>
          <button className="px-3 py-1 border rounded">Advanced</button>
          <button className="px-3 py-1 border rounded">Paste</button>
        </div>
      </div>

      {/* Table */}
      <BasicTables
        page={"In Progress"}
        inboxData={tableData}
        columns={columns}
        checkBox={true}
        setSelectedRows={setSelectedRows}
      />

      {/* Pagination */}
      <div>
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
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3">
        <button className="px-3 py-1 border rounded">Back to Task</button>

        <div className="flex gap-3">
          <button className="px-4 py-1.5 border rounded bg-gray-100 text-gray-700">
            Add All Filtered SKUs (10616 in filter)
          </button>

          <button
            className="px-4 py-1.5 rounded bg-blue-600 text-white"
            onClick={selected}
          >
            Add Selected SKUs (0 selected)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
