import React, { useEffect, useState } from "react";
import TabHeader from "./TabHeader";
import TaskDetailsPage from "./TaskDetailsPage";
import Approvals from "./Approvals";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PricingTable: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pricing");
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: any) => state.user.users);
  const [rows, setRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
const [cancelReasons, setCancelReasons] = useState<any[]>([]);
const [selectedReason, setSelectedReason] = useState("");

  // NEW: Task details state
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [taskSummary, setTaskSummary] = useState<any>(null);

  const { id } = useParams();

  // ----------------------------------------------------
  // 🔥 NEW - FETCH TASK DETAILS API
  // ----------------------------------------------------
  const fetchTaskDetails = async () => {
    try {
      const payload = {
        taskID: Number(id),
        userID: user.userId
      };

      const response = await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Inbox/getTaskDetails",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setTaskDetails(response.data);
    } catch (err) {
      console.error("Task Details Error:", err);
    }
  };

  const loadCancelReasons = async () => {
  try {
    const resp = await axios.get(
      "https://vm-www-dprice01.icumed.com:5000/api/Inbox/getTaskCancelReasons"
    );

    setCancelReasons(resp.data || []);
  } catch (err) {
    console.error("Cancel reasons load error", err);
  }
};


  const fetchTaskSummary = async () => {
    try {
      const payload = {
        taskID: Number(id),
        userID: user.userId
      };

      const response = await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Inbox/getTaskSummary",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('summary data', response.data);
      setTaskSummary(response.data);
    } catch (err) {
      console.error("Task Summary Error:", err);
    }
  };

  // ----------------------------------------------------
  // FETCH PRICING TABLE
  // ----------------------------------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: user.userId,
        firstRow: 1,
        lastRow: 50,
        sortBy:
          "(CASE WHEN LotOrderKey = -1 THEN 1 ELSE 0 END) ASC, LotOrderKey ASC, OrderKey ASC",
        taskId: Number(id),
        filter: "",
        customViewId: -1
      };

      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/FilterPricingView`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('fetchData', response.data);
      setRows(response.data);
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error: any) {
      console.error("Error:", error.message);
    }
    setLoading(false);
  };

  // ----------------------------------------------------
  // Select All Logic
  // ----------------------------------------------------
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(rows.map(r => ({ ...r })));
    } else {
      setSelectedRows([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
    fetchTaskDetails(); // 🔥 NEW CALL
    fetchTaskSummary();
  }, []);

  // Number Format Helper
  const safeFixed = (value: any, digits = 2) =>
    value !== null && value !== undefined && !isNaN(value)
      ? Number(value).toFixed(digits)
      : "0.00";


  const percentageChange =
    taskSummary?.sumPrevGrossSales
      ? ((taskSummary.sumNewGrossSales - taskSummary.sumPrevGrossSales) * 100) /
      taskSummary.sumPrevGrossSales
      : 0;

  const handleRowSelect = (row: any, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => {
        const updated = [...prev, row];
        if (updated.length === rows.length) setSelectAll(true);
        return updated;
      });
    } else {
      setSelectedRows((prev) => {
        const updated = prev.filter((r) => r.TaskItemId !== row.TaskItemId);
        setSelectAll(false);
        return updated;
      });
    }
  };

  const handleCommentClick = (row: any) => {
    alert("Clicked comment for Item: " + row.Item);
  };

  // ----------------------------------------------------
  // COPY ITEMS
  // ----------------------------------------------------
  const handleCopy = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one record to copy.");
      return;
    }

    const taskItemIds = selectedRows.map((r) => r.TaskItemId);

    if (!window.confirm(`You are about to create ${taskItemIds.length} duplicate item(s). Proceed?`))
      return;

    try {
      setLoading(true);

      await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Pricing/copy-items",
        {
          userId: user.userId,
          taskId: Number(id),
          items: taskItemIds
        }
      );

      alert("Items copied successfully.");
      fetchData();
    } catch (err) {
      console.error("Copy Error:", err);
      alert("Copy failed.");
    }
    setLoading(false);
  };

  const handleCancelTask = () => {
  loadCancelReasons();
  setShowCancelPopup(true);
};

const confirmCancelTask = async () => {
  if (!selectedReason) {
    alert("Please select a reason.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      idTask: Number(id),
      userID: user.userId,
      reason: selectedReason,
      approvalID: taskDetails?.approvalID
    };

    const resp = await axios.post(
      "https://vm-www-dprice01.icumed.com:5000/api/Inbox/cancelTask",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    alert("Task cancelled successfully.");

    setShowCancelPopup(false);
    fetchTaskSummary();
    fetchTaskDetails();

  } catch (err) {
    console.error("Cancel Task Error:", err);
    alert("Cancel failed.");
  }

  setLoading(false);
};

  const handleDeleteTask = async () => {
  if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;

  try {
    setLoading(true);

    const payload = {
      userId: user.userId,
      undo: false,
      tasks: [Number(id)]
    };

    const resp = await axios.post(
      "https://vm-www-dprice01.icumed.com:5000/api/Inbox/markTaskDeleted",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    alert("Task deleted successfully.");

    // 🔥 redirect to Home.tsx
    navigate("/home");

  } catch (err) {
    console.error("Delete Task Error:", err);
    alert("Delete failed.");
  }

  setLoading(false);
};


  const handleCopyTask = async () => {
  if (!confirm("Create a copy of this task?")) return;

  try {
    setLoading(true);

    const payload = {
      userId: user.userId,
      taskId: Number(id)
    };

    const resp = await axios.post(
      "https://vm-www-dprice01.icumed.com:5000/api/Inbox/copyTask",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const newTaskId = resp.data?.newTaskId;

    if (!newTaskId) {
      alert("Copy failed: No new task id returned.");
      return;
    }

    alert("Task copied successfully!");

    // 🔥 redirect to the SAME screen but with new taskId
    navigate(`/pricingTable/${newTaskId}`);

  } catch (err) {
    console.error("Copy Task Error:", err);
    alert("Copy failed.");
  }

  setLoading(false);
};


   const formatDateShort = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(); // will use user's locale
  };


  // ----------------------------------------------------
  // DELETE ITEMS
  // ----------------------------------------------------
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one record to delete.");
      return;
    }

    const taskItemIds = selectedRows.map((r) => r.TaskItemId);

    if (!window.confirm(`Are you sure you want to delete ${taskItemIds.length} item(s)?`))
      return;

    try {
      setLoading(true);

      await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Pricing/DeleteItemsFromPriceList",
        {
          userId: user.userId,
          taskId: Number(id),
          taskItemIds
        }
      );

      alert("Items deleted successfully.");
      fetchData();
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Delete failed.");
    }
    setLoading(false);
  };
   const headerTitle =
    taskSummary?.taskName || taskDetails?.name || `Task ${id || ""}`;

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-x-hidden">


    <div className="mb-4">
  <div className="flex items-center justify-between bg-white rounded shadow-sm px-4 py-3">
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">

      <div className="flex items-center gap-4">

        {/* Task Title (TRUNCATED + tool-tip full text) */}
        <h3
          className="text-lg font-semibold text-gray-800 max-w-[550px] truncate"
          title={headerTitle}
        >
          {headerTitle}
        </h3>

        {/* Action links */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancelTask}
            className="text-sm text-blue-600 hover:underline px-2 py-1"
          >
            Cancel Task
          </button>

          <button
            onClick={handleDeleteTask}
            className="text-sm text-red-600 hover:underline px-2 py-1"
          >
            Delete Task
          </button>

          <button
            onClick={handleCopyTask}
            className="text-sm text-gray-700 hover:underline px-2 py-1"
          >
            Copy Task
          </button>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE (CREATOR INFO) */}
    <div
      className="text-sm text-gray-600 max-w-[350px] text-right truncate"
      title={
        `${taskSummary?.userWholeName ?? ""} | ` +
        `${formatDateShort(taskSummary?.created) ?? ""} | ` +
        `${taskSummary?.originalCreatorName ?? ""}`
      }
    >
      {taskSummary?.originalCreatorName && (
        <div className="truncate">
          Submitted by{" "}
          <span className="font-semibold text-gray-800">
            {taskSummary.userWholeName}
          </span>
          {taskSummary?.created && <> on {formatDateShort(taskSummary.created)}</>}
        </div>
      )}

      {taskSummary?.lastActedUser && taskSummary?.assigneeSubmitDate && (
        <div className="mt-1 text-xs text-gray-500 truncate">
          Assigned by {taskSummary.originalCreatorName} on{" "}
          {formatDateShort(taskSummary.assigneeSubmitDate)}
        </div>
      )}
    </div>

  </div>
</div>




      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ----------------------------------------------------
          PRICING TAB
      ---------------------------------------------------- */}
      {activeTab === "pricing" && (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4 mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Pricing Table</h2>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => navigate(`/addItem?taskId=${id}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Add
              </button>

              <button
                onClick={handleCopy}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Copy
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>

              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Export
              </button>
            </div>
          </div>

          {/* HEADER SUMMARY */}
          <div className="w-full bg-white shadow rounded p-4 mt-4">
            <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-gray-700">
              <span>Items: {taskDetails?.itemCount ?? 0}</span>
              <span>Floor: {taskSummary?.floorBreaks ?? 0}</span>
              <span>Gross Sales: {taskDetails?.currencyFormat ?? ''} {taskSummary?.sumNewGrossSales ?? 0}</span>
              <span className="text-green-600">({safeFixed(percentageChange, 1)}%)</span>
              <span>Discount: {taskSummary?.totalDiscount ?? 0}%</span>
            </div>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto bg-white shadow rounded mt-2">
            <table className="w-full text-sm border-collapse table-fixed">
              <thead>
                <tr className="bg-blue-100 text-gray-800 text-xs uppercase text-center">
                  <th className="border p-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>

                  <th className="border p-2 w-10">Comment</th>

                  <th className="border p-2 w-10">#</th>

                  <th colSpan={2} className="border p-2 w-64">Item</th>

                  <th colSpan={5} className="border p-2 w-72">History</th>

                  <th colSpan={2} className="border p-2 w-48">Input</th>

                  <th colSpan={5} className="border p-2 w-80">Price Guides</th>

                  <th className="border p-2 w-32">Gross Forecast</th>
                  <th className="border p-2 w-32">Net Forecast</th>

                  <th colSpan={2} className="border p-2 w-40">Assisting Data</th>
                </tr>

                <tr className="bg-gray-100 text-gray-700 text-xs uppercase text-center">
                  <th className="border p-2"></th>
                  <th className="border p-2"></th>

                  <th className="border p-2 w-20">Item</th>
                  <th className="border p-2 w-56">Item Description</th>

                  <th className="border p-2 w-20">Gross Volume</th>
                  <th className="border p-2 w-24">Gross Sales</th>
                  <th className="border p-2 w-24">Gross ASP</th>
                  <th className="border p-2 w-20">Item Cost</th>
                  <th className="border p-2 w-20">GM %</th>

                  <th className="border p-2 w-20">Volume</th>
                  <th className="border p-2 w-28">New Price</th>

                  <th className="border p-2 w-24">Price Comp</th>
                  <th className="border p-2 w-24">Live Price</th>
                  <th className="border p-2 w-28">Live Price (Group)</th>
                  <th className="border p-2 w-28">Target Price</th>
                  <th className="border p-2 w-28">Floor Price</th>

                  <th className="border p-2 w-32">New Gross Sales</th>
                  <th className="border p-2 w-20">New GM %</th>

                  <th className="border p-2 w-24">Competitor</th>
                  <th className="border p-2 w-24">Pricing Tool</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const isChecked = selectedRows.some(
                    (r) => r.TaskItemId === row.TaskItemId
                  );

                  return (
                    <tr key={row.TaskItemId} className="border-t hover:bg-gray-50 text-center">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleRowSelect(row, e.target.checked)}
                        />
                      </td>

                      <td className="p-2 cursor-pointer">
                        <img
                          src="/images/iconsnew/comment-icon.png"
                          alt="comment"
                          className="w-5 h-5 opacity-80 hover:opacity-100"
                          onClick={() => handleCommentClick(row)}
                        />
                      </td>

                      <td className="p-2">{index + 1}</td>

                      <td className="p-2 truncate" title={row.Item}>
                        {row.Item}
                      </td>

                      <td className="p-2 truncate w-56" title={row.Description}>
                        {row.Description}
                      </td>

                      <td className="p-2">{row.GrossEaches}</td>
                      <td className="p-2">{safeFixed(row.GrossSales)}</td>
                      <td className="p-2">{safeFixed(row.GrossASP)}</td>
                      <td className="p-2">{safeFixed(row.Cost)}</td>
                      <td className="p-2">{safeFixed(row.GMPercent)}</td>

                      <td className="p-2 bg-green-100 text-green-700 font-semibold">
                        {row.GrossEaches}
                      </td>

                      <td className="p-2 bg-green-100 text-green-700 font-semibold">
                        {row.NewPrice}
                      </td>

                      <td className="p-2">{safeFixed(row.PriceComparison)}</td>
                      <td className="p-2">{row.LivePrice}</td>
                      <td className="p-2">{row.GroupLivePrice}</td>
                      <td className="p-2">{safeFixed(row.TargetPrice)}</td>
                      <td className="p-2">{row.FloorPrice}</td>

                      <td className="p-2">{row.NewGrossSales}</td>
                      <td className="p-2">{safeFixed(row.GMPercentRebate, 0)}</td>

                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={20} className="text-center text-gray-500 py-6">
                      No records to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            Selected Records: {selectedRows.length}
          </div>
        </>
      )}

      {/* ----------------------------------------------------
          TASK DETAILS TAB
      ---------------------------------------------------- */}
      {activeTab === "details" && <TaskDetailsPage taskDetails={taskDetails} />}

      {/* ----------------------------------------------------
          APPROVALS TAB
      ---------------------------------------------------- */}
      {activeTab === "approvals" && (
        <div className="mt-6">
          <Approvals />
        </div>
      )}



      {showCancelPopup && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
    <div className="bg-white w-[420px] rounded shadow-lg p-6">

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Please confirm you wish to cancel this Task
      </h2>

      <label className="font-medium text-gray-700">Reason:</label>
      <select
        className="border rounded w-full mt-2 p-2"
        value={selectedReason}
        onChange={(e) => setSelectedReason(e.target.value)}
      >
        <option value="">-- Select Reason --</option>
        {cancelReasons.map((r) => (
          <option key={r.id} value={r.name}>{r.name}</option>
        ))}
      </select>

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-1 rounded bg-gray-300 text-gray-800"
          onClick={() => setShowCancelPopup(false)}
        >
          Back
        </button>

        <button
          className="px-4 py-1 rounded bg-blue-600 text-white"
          onClick={confirmCancelTask}
        >
          Confirm
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  );
};

export default PricingTable;
