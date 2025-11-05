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
  const navigate = useNavigate();
const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    // console.log(start, end);
    fetchData(start, end);
  };

  const fetchCount = async () => {
    //console.log("fetchCount",arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_MissingItems`,
        filter: `AND TaskId = 253459`
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Completed", response.data);
      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    // console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };
const [selectedRows, setSelectedRows] = useState([]);
const dispatch = useDispatch();
const selected = () => {
      //console.log("selectedRows",selectedRows);
      const selected = selectedRows.filter((row: any) => row.checked);
      if(selected.length===0){
        alert("Please select at least one record");
        return;
      }else{
      console.log("selected", selected);
      dispatch(resetRecords(selected));
     navigate("/pricingTable");
      }
    };

  const [rows] = useState<RowData[]>([
    // Example row — you will replace with data from API
    {
      item: "0001",
      description: "DUMMY VERTRIEB 1/EA",
      franchise: "Misc",
      gph1: "Other",
      gph2: "Common ...",
      gph3: "Common ...",
      gph4: "Common ...",
      gph5: "Common ...",
      status: "Saleable",
      sales: ""
    }
  ]);
  
  const [tableData, setTableData] = useState([]);
const [loading, setLoading] = useState(false);
  const fetchData = async (start: number, end: number) => {
    //console.log(arg, start, end);
    setLoading(true);
    //setActiveTab(arg);
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

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("API Response:", response.data);
      setTableData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
      fetchData(1, user.gridPageSize);
      fetchCount();
    }, []);
  
useEffect(() => {
      setTotalPages(Math.ceil(totalRecords / recordsPerPage))
    }, [recordsPerPage,totalRecords]);
  return (
    <div className="w-full h-full p-4 bg-white text-sm">
 <Loader isLoad={loading} />
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Add Item</h2>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4 mb-3 text-gray-700">
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
          <button className="px-3 py-1 border rounded bg-blue-50 text-blue-700">Basic</button>
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
      {/* <div className="overflow-x-auto border rounded">
        <table className="min-w-[1200px] w-full border-collapse">
          <thead className="bg-blue-50 text-gray-700 text-xs uppercase">
            <tr>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Item Description</th>
              <th className="border p-2 text-left">Super Franchise</th>
              <th className="border p-2 text-left">GPH 1</th>
              <th className="border p-2 text-left">GPH 2</th>
              <th className="border p-2 text-left">GPH 3</th>
              <th className="border p-2 text-left">GPH 4</th>
              <th className="border p-2 text-left">GPH 5</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Sales</th>
            </tr>

           
            <tr className="bg-white">
              {Array.from({ length: 10 }).map((_, i) => (
                <td key={i} className="border p-1">
                  <input className="w-full border border-gray-300 rounded p-1 text-xs" />
                </td>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-blue-50">
                <td className="border p-2">{row.item}</td>
                <td className="border p-2">{row.description}</td>
                <td className="border p-2">{row.franchise}</td>
                <td className="border p-2">{row.gph1}</td>
                <td className="border p-2">{row.gph2}</td>
                <td className="border p-2">{row.gph3}</td>
                <td className="border p-2">{row.gph4}</td>
                <td className="border p-2">{row.gph5}</td>
                <td className="border p-2">{row.status}</td>
                <td className="border p-2">{row.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* Pagination + Footer */}

      <div className="col-span-12 mt-8">
          {tableData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setPageChange}
              onRecordsPerPageChange={(val) => {
                changeRecordsPerPage(val);
                //setPageChange(1); // reset to first page on change
              }}
            />
          )}
        </div>

      <div className="flex justify-between items-center mt-4">
        <button className="px-3 py-1 border rounded">Back to Task</button>

        

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded bg-gray-100 text-gray-700">
            Add All Filtered SKUs (10616 in filter)
          </button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={selected}>
            Add Selected SKUs (0 selected)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;

