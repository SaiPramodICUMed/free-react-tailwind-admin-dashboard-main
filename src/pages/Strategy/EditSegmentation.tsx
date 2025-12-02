import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/loader";
import axios from "axios";


const EditSegmentation: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [showModal, setShowModal] = useState(false);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [segmentExceptOne, setSegmentExceptOne] = useState([]);
  const [segmentsData, setSegmentsData] = useState<any>([]);
  const [newSeg, setNewSeg] = useState({ name: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const [selectedSegmentValue, setSelectedSegmentValue] = useState(user.activeCountryId);
  const [selectedSegObject, setSelectedSegObject] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReallocate, setSelectedReallocate] = useState("Un-allocated");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");


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


  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const handleChangeSegmentTypes = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedObj = segmentTypes.find(
      (s: any) => s.segmentTypeId === selectedId
    );
    setSelectedSegmentValue(selectedObj);
  };

  const addNewSegment = async () => {
    console.log(selectedSegmentValue);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        segmentTypeId: selectedSegmentValue.segmentTypeId,
        segmentName: newSeg.name,
        countryId: `${user.activeCountryId}`
      };
      console.log('addnewseg', payload);
      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/addNewSegment`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("addNewSegment Data:", response.data);
      setSegmentsData(response.data);
      fetchAllSegments(user.activeCountryId);
      setShowModal(false);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const deleteSegment = async () => {
    console.log(selectedSegmentValue);
    setLoading(true);

    try {
      // Determine the correct value for newSegmentID
      const newSegmentID =
        selectedReallocate === "Un-allocated" || !selectedReallocate
          ? 0
          : Number(selectedReallocate);

      const payload = {
        segmentID: selectedSegObject.segmentId,
        newSegmentID: newSegmentID,
      };

      console.log("deleteSegment payload:", payload);

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/deleteSegment`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("deleteSegment Data:", response.data);
      setSegmentsData(response.data);
      fetchAllSegments(user.activeCountryId);
      setShowDeleteModal(false); // close the delete modal
    } catch (error: any) {
      console.error("Error deleting segment:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const activateSegment = async () => {
    console.log('activate called');
    // Show confirmation popup
    const confirmed = window.confirm("Are you sure you want to activate selected segment?");
    if (!confirmed) return; // If user clicked Cancel, do nothing

    setLoading(true);

    try {
      const payload = {
        segmentID: selectedSegObject.segmentId,
      };

      console.log("activateSegment payload:", payload);

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/activateSegment`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("activateSegment Data:", response.data);

      // Update the table data and refresh segments
      setSegmentsData(response.data);
      fetchAllSegments(user.activeCountryId);

    } catch (error: any) {
      console.error("Error activating segment:", error.message);
    } finally {
      setLoading(false);
    }
  };


  const renameSegment = async () => {
    if (!selectedSegObject || !newSegmentName.trim()) return;

    setLoading(true);
    try {
      const payload = {
        segmentCurrentId: selectedSegObject.segmentId,
        SegmentNewName: newSegmentName.trim(),
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/renameSegment`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("renameSegment Data:", response.data);
      setSegmentsData(response.data);
      fetchAllSegments(user.activeCountryId);
      setShowRenameModal(false);
    } catch (error: any) {
      console.error("Error renaming segment:", error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchAllSegments = async (arg: any) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        countryId: arg,
        deleted: true,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/getAllSegments`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Summary Data:", response.data);
      setSegmentsData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchSegmentTypes = async (country: number) => {
    //console.log(arg);
    //setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        countryId: country,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/getSegmentTypes`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Segment Type Data:", response.data);
      setSegmentTypes(response.data);
      //setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchSegmentsExceptOne = async () => {
    //console.log(arg);
    //setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        countryId: user.activeCountryId,
        segmentId: segmentsData.segmentId
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/getSegmentsExceptOne`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("getSegmentsExceptOne:", response.data);
      setSegmentExceptOne(response.data);
      //setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };


  useEffect(() => {
    fetchAllSegments(user.activeCountryId);
    fetchSegmentTypes(user.activeCountryId);
  }, []);

  useEffect(() => {
    fetchAllSegments(selectedValue);
  }, [selectedValue]);
  useEffect(() => {
    fetchAllSegments(selectedSegmentValue);
  }, [selectedSegmentValue]);

  useEffect(() => {
    if (showDeleteModal && selectedSegObject) {
      fetchSegmentsExceptOne();
    }
  }, [showDeleteModal, selectedSegObject]);


  function handleClick(row: any) {
    setSelectedSegObject(row);
    console.log("Row clicked:", row);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-sm relative">
      <Loader isLoad={loading} />
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Edit Segmentation</h1>
        <button className="text-blue-600 hover:underline text-sm" onClick={() => navigate("/segmentation")}>Back To Segmentation</button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex gap-2">
          {/* Rename Button */}
          <button
            onClick={() => {
              setNewSegmentName("");
              setShowRenameModal(true);
            }}
            disabled={!selectedSegObject || selectedSegObject?.deleted}
            className={`px-4 py-1 rounded-md transition ${!selectedSegObject || selectedSegObject?.deleted
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
          >
            Rename
          </button>


          {/* Delete Button */}
          <button
            onClick={() => handleAction("Delete")}
            disabled={!selectedSegObject || selectedSegObject?.deleted}
            className={`px-4 py-1 rounded-md transition ${!selectedSegObject || selectedSegObject?.deleted
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
              }`}
          >
            Delete
          </button>

          {/* Activate Button */}
          <button
            onClick={activateSegment}
            disabled={!selectedSegObject || !selectedSegObject?.deleted}
            className={`px-4 py-1 rounded-md transition ${!selectedSegObject || !selectedSegObject?.deleted
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
              }`}
          >
            Activate
          </button>


          {/* Add New Button */}
          <button
            onClick={() => handleAction("Add New")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md transition"
          >
            Add New
          </button>
        </div>


        <select
          value={selectedValue}
          onChange={handleChange}
          className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
        >
          {countries?.map((option: any) => (
            <option key={option.countryId} value={option.countryId}>
              {option.countryName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="min-w-full border-collapse text-gray-700">
          <thead className="bg-[#0f59ac] text-white">
            <tr>
              <th className="px-4 py-2 border-b text-left font-medium">Segment Id</th>
              <th className="px-4 py-2 border-b text-left font-medium">Segment Name</th>
              <th className="px-4 py-2 border-b text-left font-medium">Segment Type Name</th>
              <th className="px-4 py-2 border-b text-left font-medium">Country Name</th>
              <th className="px-4 py-2 border-b text-left font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {segmentsData.length > 0 ? (
              segmentsData.map((seg: any, i: number) => {
                const isSelected = selectedSegObject?.segmentId === seg.segmentId;
                const isDeleted = seg.deleted === true;

                return (
                  <tr
                    key={seg.segmentId}
                    onClick={() => handleClick(seg)} // allow selection always
                    title={isDeleted ? "This segment is deleted" : ""}
                    className={`cursor-pointer transition 
            ${isSelected
                        ? "bg-gray-300 border-l-4 border-blue-500"
                        : isDeleted
                          ? "bg-gray-100 text-gray-400"
                          : i % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                      } 
            hover:bg-blue-50
          `}
                  >
                    <td className="px-4 py-2 border-b">{seg.segmentId}</td>
                    <td className="px-4 py-2 border-b">{seg.segmentName}</td>
                    <td className="px-4 py-2 border-b">{seg.segmentTypeName}</td>
                    <td className="px-4 py-2 border-b">{seg.countryName}</td>
                    <td className="px-4 py-2 border-b">{seg.reference}</td>
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
              <h2 className="text-lg font-semibold text-gray-800">Add New Segmentation</h2>
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
                  value={newSeg.name}
                  onChange={(e) => setNewSeg({ ...newSeg, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter segmentation name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 font-medium">Type:</label>
                {/* <select
                  value={newSeg.type}
                  onChange={(e) => setNewSeg({ ...newSeg, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 mt-1 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Account">Account</option>
                  <option value="Group">Group</option>
                </select> */}

                <select
                  id="segmentTypes"
                  value={selectedSegmentValue?.segmentTypeId || ""}
                  onChange={handleChangeSegmentTypes}
                  className="w-[200px] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
                >
                  <option value="">Select Segment Type</option>
                  {segmentTypes.map((option: any) => (
                    <option key={option.segmentTypeId} value={option.segmentTypeId}>
                      {option.segmentTypeName}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-600">
                <span className="font-semibold text-gray-800">Please note:</span> When a new
                Segmentation is added, PMSI will send you an update to the target tool. Offsets and
                Floors will need to be set for this new segmentation before it can go live.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-5">
              <button
                onClick={addNewSegment}

                className={`px-4 py-2 rounded-md text-white
                    bg-blue-600 hover:bg-blue-700
                    
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
      {showDeleteModal && selectedSegObject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Delete Segmentation</h2>
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
                Are you sure you wish to delete the following segmentation:{" "}
                <span className="font-semibold text-blue-700">
                  {selectedSegObject?.segmentName}
                </span>
              </p>

              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Re-allocate customers to:
                </label>
                <select
                  id="reallocateDropdown"
                  value={selectedReallocate}
                  onChange={(e) => setSelectedReallocate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Un-allocated">Un-allocated</option>
                  {segmentExceptOne.map((seg: any) => (
                    <option key={seg.segmentId} value={seg.segmentId}>
                      {seg.segmentName}
                    </option>
                  ))}
                </select>
              </div>
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
              <h3 className="font-semibold text-gray-800 text-sm">Rename Segmentation</h3>
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
                  Current Name:
                </label>
                <p className="text-blue-600 text-sm">{selectedSegObject?.segmentName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  New Name:
                </label>
                <input
                  type="text"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full border border-gray-400 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={renameSegment}
                disabled={!newSegmentName.trim()}
                className={`px-4 py-1 rounded-sm text-sm ${!newSegmentName.trim()
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

export default EditSegmentation;
