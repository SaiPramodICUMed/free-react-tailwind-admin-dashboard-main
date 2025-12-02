import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/loader";
import { useSelector } from "react-redux";
import MultiSelect from "../../components/MultiSelect";

const ApprovalControls: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const countries: [] = useSelector((state: any) => state.user.countries);

  // ---------------------------
  // STATE
  // ---------------------------
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [approvalList, setApprovalList] = useState<any[]>([]);
  const [controlList, setControlList] = useState<any[]>([]);
  const [taskTypeList, setTaskTypeList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(user.activeCountryId);

  // MultiSelect values
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<any[]>([]);

  // Form state (only used during ADD)
  const [form, setForm] = useState({
    approvalId: "",
    controlCode: "",
    parameter: "",
    level: 0,
    taskTypeIds: [] as number[],
  });

  // ---------------------------
  // Fetch Approvals
  // ---------------------------
  const fetchApprovals = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Strategy/getApprovals/${selectedCountry}`
      );
      setApprovalList(res.data);
    } catch (e) {
      console.log("Approvals error:", e);
    }
  };

  // ---------------------------
  // Fetch Controls
  // ---------------------------
  const fetchControls = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Strategy/getApprovalControls`
      );
      setControlList(res.data);
    } catch (e) {
      console.log("Controls error:", e);
    }
  };

  // ---------------------------
  // Fetch Task Types
  // ---------------------------
  const fetchTaskTypes = async () => {
    try {
      const payload = {
        viewName: "lkpTaskType",
        sortBy: "",
        sortByDirection: "",
        filter: "",
        fieldList: "TaskTypeID AS Id, Name AS Name , [Group] AS [Group]",
        timeout: 0,
      };

      const res = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getDataNoPaging`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setTaskTypeList(res.data);
    } catch (e) {
      console.log("Task Type error:", e);
    }
  };

  // ---------------------------
  // Fetch Rules
  // ---------------------------
  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://10.2.6.130:5000/api/Strategy/getRules/${selectedCountry}`
      );
      setRules(res.data);
    } catch (e) {
      console.log("Rules error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
    fetchControls();
    fetchTaskTypes();
    fetchRules();
  }, [selectedCountry]);

  // ---------------------------
  // Handle form change
  // ---------------------------
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ---------------------------
  // Add Rule
  // ---------------------------
  const handleAdd = async () => {
    if (!form.approvalId || !form.controlCode || selectedTaskTypes.length === 0)
      return alert("Please fill all required fields.");

    const payload = {
      countryId: selectedCountry,
      approvalId: Number(form.approvalId),
      controlCode: form.controlCode,
      parameter: Number(form.parameter) || 0,
      level: Number(form.level) || 0,
      taskTypeIDs: selectedTaskTypes.map((t) => t.value),
    };

    setLoading(true);
    try {
      const res = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Strategy/addApprovalRule`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success && res.data.approvalRuleId > 0) {
        alert("Approval Rule Added Successfully");
        handleClear();
        fetchRules();
      } else {
        alert("Failed to add rule.");
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  // ---------------------------
  // Start Edit
  // ---------------------------
  const startEdit = (row: any) => {
    setEditingId(row.approvalRuleId);

    setForm({
      approvalId: row.approvalId,
      controlCode: row.controlCode,
      parameter: row.parameter,
      level: row.approvalLevel || 0,
      taskTypeIds: [],
    });

    // Load selected task types (none in API, so default empty)
    setSelectedTaskTypes([]);
  };

  // ---------------------------
  // Update Rule (only PARAMETER)
  // ---------------------------
  const handleUpdate = async () => {
    if (!editingId) return;

    const payload = {
      userID: user.userId,
      approvalRuleID: editingId,
      parameter: Number(form.parameter) || 0,
      level: Number(form.level) || 0,
    };

    setLoading(true);
    try {
      const res = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Strategy/updateApprovalRule`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        alert("Rule updated successfully");
        handleClear();
        fetchRules();
      } else {
        alert(res.data.message || "Update failed");
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  // ---------------------------
  // Delete Rule
  // ---------------------------
  // ---------------------------
// DELETE RULE  (Updated API)
// ---------------------------
const handleDelete = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this approval rule?")) return;

  const payload = {
    userID: user.userId,
    approvalRuleID: id
  };

  setLoading(true);
  try {
    const res = await axios.post(
      `https://vm-www-dprice01.icumed.com:5000/api/Strategy/deleteApprovalRule`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data && res.data.approvalRuleID > 0) {
      alert(res.data.message || "Approval rule deleted successfully.");
      fetchRules(); // Refresh table
    } else {
      alert("Failed to delete approval rule.");
    }
  } catch (err) {
    console.log("Delete error:", err);
    alert("Error deleting rule.");
  }

  setLoading(false);
};


  // ---------------------------
  // Clear form
  // ---------------------------
  const handleClear = () => {
    setEditingId(null);
    setForm({
      approvalId: "",
      controlCode: "",
      parameter: "",
      level: 0,
      taskTypeIds: [],
    });
    setSelectedTaskTypes([]);
  };

  // ---------------------------
  // Prepare Task Type Options
  // ---------------------------
  const taskTypeOptions = taskTypeList.map((t: any) => ({
    label: t.Name,
    value: t.Id,
  }));

  // =======================================================================
  // UI
  // =======================================================================
  return (
    <div className="p-6 bg-gray-50 text-sm">
      <Loader isLoad={loading} />

      {/* Country Selector */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {countries?.map((c: any) => (
            <option key={c.countryId} value={c.countryId}>
              {c.countryName}
            </option>
          ))}
        </select>
      </div>

      {/* Add / Edit Form */}
      <div className="grid grid-cols-5 gap-2 p-2 bg-green-50 border rounded mb-4 items-center">

        {/* Approval */}
        <select
          name="approvalId"
          value={form.approvalId}
          onChange={handleFormChange}
          className="border px-2 py-1 rounded bg-white"
          disabled={!!editingId}
        >
          <option value="">Approval</option>
          {approvalList.map((a: any) => (
            <option key={a.approvalId} value={a.approvalId}>
              {a.approvalName}
            </option>
          ))}
        </select>

        {/* Control */}
        <select
          name="controlCode"
          value={form.controlCode}
          onChange={handleFormChange}
          className="border px-2 py-1 rounded bg-white"
          disabled={!!editingId}
        >
          <option value="">Control</option>
          {controlList.map((c: any) => (
            <option key={c.controlCode} value={c.controlCode}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Task Type MultiSelect */}
        <MultiSelect
          options={taskTypeOptions}
          value={selectedTaskTypes}
          onChange={setSelectedTaskTypes}
          placeholder="Task Types"
        />

        {/* Parameter (only editable field in edit mode) */}
        

        {/* Add / Update Button */}
        {editingId ? (
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        )}

      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded bg-white shadow">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Approval</th>
              <th className="px-3 py-2 text-left">Control</th>
              <th className="px-3 py-2 text-left">Parameter</th>
              <th className="px-3 py-2 text-left">Country</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rules.map((row, i) => (
              <tr
                key={row.approvalRuleId}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2 border-b">{row.approvalName}</td>

                <td className="px-3 py-2 border-b">{row.approvalControl}</td>

                {/* Inline parameter edit */}
                <td className="px-3 py-2 border-b">
                  {editingId === row.approvalRuleId ? (
                    <input
                      type="number"
                      name="parameter"
                      value={form.parameter}
                      onChange={handleFormChange}
                      className="border px-2 py-1 rounded w-20"
                    />
                  ) : (
                    row.parameter
                  )}
                </td>

                <td className="px-3 py-2 border-b">{row.countryName}</td>

                <td className="px-3 py-2 border-b">
                  {editingId === row.approvalRuleId ? (
                    <button
                      onClick={handleUpdate}
                      className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(row)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(row.approvalRuleId)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-5 text-gray-500">
                  No rules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalControls;
