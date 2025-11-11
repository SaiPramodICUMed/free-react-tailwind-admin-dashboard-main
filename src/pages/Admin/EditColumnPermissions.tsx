import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/loader";
import axios from "axios";


const EditColumnPermissions: React.FC = () => {
    const user = useSelector((state: any) => state.user.users);
    const [inboxData, setInboxData] = useState([]);
    const [columnRoles, setColumnRoles] = useState([]);
    const [columnRolesCount, setColumnRolesCount] = useState([]);
    const [approvalRoles, setApprovalRoles] = useState([]);
    const [approvalRolesCount, setApprovalRolesCount] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
      const [newApproval, setNewApproval] = useState("");
      const [newRole, setNewRole] = useState({ name: "", type: "" });
      const [selectedApprovalObject, setSelectedApprovalObject] = useState<any | null>(null);
      
    const countries: [] = useSelector((state: any) => state.user.countries);

    const navigate = useNavigate();
    // const [segments] = useState<Segment[]>([
    //   { id: 405, name: "HC/AS -Distributors", type: "Account", country: "Germany", reference: "tier5" },
    //   { id: 436, name: "HC/AS -Providers", type: "Account", country: "Germany", reference: "tier5" },
    //   { id: 398, name: "High potential customer", type: "Account", country: "Germany", reference: "tier2" },
    //   { id: 397, name: "Homecare Dealer / Provider", type: "Group", country: "Germany", reference: "tier5" },
    //   { id: 400, name: "Hospital Distributors", type: "Account", country: "Germany", reference: "tier3" },
    //   { id: 394, name: "Large BG", type: "Group", country: "Germany", reference: "tier2" },
    //   { id: 399, name: "Large Hospitals", type: "Account", country: "Germany", reference: "tier2" },
    //   { id: 395, name: "Medium BG", type: "Group", country: "Germany", reference: "tier3" },
    //   { id: 401, name: "Medium Hospitals", type: "Account", country: "Germany", reference: "tier3" },
    //   { id: 434, name: "Others", type: "Account", country: "Germany", reference: "tier5" },
    // ]);

    const handleAction = (action: string) => {
        if (action === "Add New") {
            setShowModal(true);
        } else if (action === "Delete") {
            setShowDeleteModal(true);
        } else {
            alert(`${action} button clicked`);
        }
    };
    
    const addNewSegment = async () => {
        console.log(selectedApprovalObject);
        setLoading(true);
        //setActiveTab(arg);
        try {
            const payload = {
                columnRoleName: newRole.name,
                countryId: `${user.activeCountryId}`
            };
            console.log('addnewrole', payload);
            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Users/addColumnRole`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("addNewSegment Data:", response.data);            
            fetchColumnRoles(user.activeCountryId);
            setShowModal(false);
            setLoading(false);
            setNewRole({ name: "", type: "" });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const deleteSegment = async () => {
        console.log(selectedApprovalObject);
        setLoading(true);

        try {
            
            const payload = {
                columnRoleId: selectedApprovalObject.id,
            };

            console.log("deleteRole payload:", payload);

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Users/deleteColumnRole`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("deleteSegment Data:", response.data);
            fetchColumnRoles(user.activeCountryId);
            setShowDeleteModal(false); // close the delete modal
        } catch (error: any) {
            console.error("Error deleting segment:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const renameColumnRole = async () => {
        if (!selectedApprovalObject || !newApproval.trim()) return;

        setLoading(true);
        try {
            const payload = {
                columnRoleID: selectedApprovalObject.id,
                columnRoleName: newApproval.trim(),
            };

            const response = await axios.post(
                `https://10.2.6.130:5000/api/Users/updateColumnRole`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("renameSegment Data:", response.data);
            fetchColumnRoles(user.activeCountryId);
            setShowRenameModal(false);
        } catch (error: any) {
            console.error("Error renaming segment:", error.message);
        } finally {
            setLoading(false);
        }
    };


    const fetchColumnRoles = async (country: number) => {
        //console.log(arg);
        setLoading(true);
        //setActiveTab(arg);
        try {

            const response = await axios.get(
                `https://vm-www-dprice01.icumed.com:5000/api/Users/getColumnRoles/${country}`,

                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Column Roles", response.data);
            setColumnRoles(response.data);
            setColumnRolesCount(response.data.length);
            setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const fetchApprovalRoles = async (country: number) => {
        //console.log(arg);
        setLoading(true);
        //setActiveTab(arg);
        try {

            const response = await axios.get(
                `https://vm-www-dprice01.icumed.com:5000/api/Users/getApprovalRoles/${user.userId}/${country}`,

                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Approval Roles", response.data);
            setApprovalRoles(response.data);
            setApprovalRolesCount(response.data.length);
            setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    function handleClick(row: any) {
    setSelectedApprovalObject(row);
    console.log("Row clicked:", row);
  }


    useEffect(() => {
        fetchColumnRoles(user.activeCountryId);
        fetchApprovalRoles(user.activeCountryId);
    }, []);


    return (
        <div className="p-6 bg-gray-50 min-h-screen text-sm relative">
            <Loader isLoad={loading} />
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-800">Set Column Permissions</h1>
                <button className="text-blue-600 hover:underline text-sm" onClick={() => navigate("/users")}>Back To Users</button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex gap-2">
                    {/* Rename Button */}
                    <button
                        onClick={() => {
                            setNewApproval("");
                            setShowRenameModal(true);
                        }}       
                        
            className={`px-4 py-1 rounded-md transition ${!selectedApprovalObject
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}                
                    >
                        Rename
                    </button>


                    {/* Delete Button */}
                    <button
                        onClick={() => handleAction("Delete")}
                         
            className={`px-4 py-1 rounded-md transition ${!selectedApprovalObject
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
              }`}
                    >
                        Delete
                    </button>


                    {/* Add New Button */}
                    <button
                        onClick={() => handleAction("Add New")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md transition"
                    >
                        Add New
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                <table className="min-w-full border-collapse text-gray-700">
                    <thead className="bg-[#0f59ac] text-white">
                        <tr>
                            <th className="px-4 py-2 border-b text-left font-medium">Column Role Id</th>
                            <th className="px-4 py-2 border-b text-left font-medium">Column Role Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columnRoles.length > 0 ? (
                            columnRoles.map((seg: any, i: number) => {                               
const isSelected = selectedApprovalObject?.id === seg.id;
                                return (
                                    <tr
                                        key={seg.id}
                                        onClick={() => handleClick(seg)} // allow selection always                                        
                                        className={`cursor-pointer transition 
                                            ${isSelected
                        ? "bg-gray-300 border-l-4 border-blue-500"
                        
                          : i % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                      } 
            hover:bg-blue-50         
          `}
                                    >
                                        <td className="px-4 py-2 border-b">{seg.id}</td>
                                        <td className="px-4 py-2 border-b">{seg.name}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>


                </table>

                {/* Pagination Placeholder */}
                {/* <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-b-lg">
          <span>Displaying items 1 - 10 of 17</span>
          <div className="flex gap-1 text-gray-600">
            <button className="px-2 py-1 border rounded hover:bg-gray-200">⏮</button>
            <button className="px-2 py-1 border rounded bg-blue-100 text-blue-800">1</button>
            <button className="px-2 py-1 border rounded hover:bg-gray-200">2</button>
            <button className="px-2 py-1 border rounded hover:bg-gray-200">⏭</button>
          </div>
        </div> */}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-800">Add New Approval Role</h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 text-xl"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700 font-medium">Name:</label>
                                <input
                                    type="text"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter Approval Role"
                                />
                            </div>

                           

                            
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={addNewSegment}
                                disabled={newRole.name==''}
                                className={`px-4 py-2 rounded-md text-white
                    bg-blue-600  ${newRole.name==''? 'bg-gray-300': ''}
                    
                  }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Segmentation Modal */}
            {/* Delete Segmentation Modal */}
            {showDeleteModal && selectedApprovalObject && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-800">Delete Approval Role</h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 text-xl"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                                Are you sure you wish to delete the following Approval Role:{" "}
                                <span className="font-semibold text-blue-700">
                                    {selectedApprovalObject?.name}
                                </span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={() => {
                                 deleteSegment();
                                    setShowDeleteModal(false);
                                }}
                                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Segmentation Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
                    <div className="bg-white border border-gray-300 rounded-sm shadow-md w-[350px]">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b px-3 py-2 bg-gray-100">
                            <h3 className="font-semibold text-gray-800 text-sm">Rename Approval Role</h3>
                            <button
                                onClick={() => setShowRenameModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Current Approval Role:
                                </label>
                                <p className="text-blue-600 text-sm">{selectedApprovalObject?.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">
                                    New Approval:
                                </label>
                                <input
                                    type="text"
                                    value={newApproval}
                                    onChange={(e) => setNewApproval(e.target.value)}
                                    className="w-full border border-gray-400 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4">
                            <button
                                 onClick={renameColumnRole}
                                disabled={!newApproval.trim()}
                                className={`px-4 py-1 rounded-sm text-sm ${!newApproval.trim()
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default EditColumnPermissions;
