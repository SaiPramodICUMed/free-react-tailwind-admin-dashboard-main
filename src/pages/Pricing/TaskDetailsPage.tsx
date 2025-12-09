import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";

const TaskDetailsPage: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  //const taskIdState = useSelector((state: any) => state.user.taskDetails);
  const { id } = useParams();
  console.log('id', id);
  console.log("Redux USER:", user);
  //console.log("Redux TASK:", taskIdState);

  // -------------- STATE ----------------
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any>(null);

  const [validFromType, setValidFromType] = useState<"immediately" | "date">(
    "date"
  );
  // default changed to duration since your UI uses a dropdown for Valid Until
  const [validUntilType, setValidUntilType] = useState<"duration" | "date">(
    "duration"
  );
  const [validUntilDuration, setValidUntilDuration] = useState("1 year");


  const [validFromDate, setValidFromDate] = useState<Date | null>(null);
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(null);

  const [contact, setContact] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");

  // -------------- DEFAULT DATES (Auto-set today and +1 year) ----------------
  useEffect(() => {
    const today = new Date();
    setValidFromDate(today);

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setValidUntilDate(nextYear);
  }, []);

   const handleSave = async () => {
    try {
      const today = new Date();

      // -------- START DATE --------
      const startDate =
        validFromType === "immediately"
          ? today.toISOString()
          : validFromDate
          ? validFromDate.toISOString()
          : null;

      // -------- EXPIRY DATE LOGIC --------
      let expiryDays = 365;

      const durationMap: any = {
        "1 month": 30,
        "3 months": 90,
        "6 months": 180,
        "1 year": 365,
        "2 years": 730,
      };

      if (validUntilType === "duration") {
        expiryDays = durationMap[validUntilDuration] || 365;
      } else if (validUntilType === "date" && validUntilDate) {
        const diff =
          (validUntilDate.getTime() - new Date(startDate!).getTime()) /
          (1000 * 60 * 60 * 24);
        expiryDays = Math.max(1, Math.round(diff));
      }

      // -------- PAYLOAD (Taken from your working TaskDetails.tsx) --------
      const payload = {
        taskID: Number(id),
        userID: user.userId,
        contact: reference,         // mapping same as TaskDetails.tsx
        contactNumber: contactNumber,
        address: address,
        comments: null,
        email: email,
        name: contact,
        taskTypeID: 0,
        currencyCode: null,
        customerSegmentId: null,
        approvalID: null,
        expiryDate: expiryDays,
        immediately: validFromType === "immediately",
        startDate: startDate,
        tenderExclusivity: false,
        tenderPriceQualityEnabled: false,
        tenderPriceQualityValue: 0,
        tenderReference: reference,
        tenderType: null,
        tenderVolumeCommitment: false,
        tenderStartImmediately: false,
        tenderStartDate: null,
        tenderLength: 0,
        tenderExtensionOption: false,
        tenderExtensionMultiplier: 0,
        tenderExtensionMonths: null,
        tenderCustomDates: false
      };

      console.log("PAYLOAD SENT:", payload);

      const response = await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Pricing/SaveTaskDetails",
        payload
      );

      console.log("Save Response:", response.data);

      alert("Task details saved successfully!");
      //navigate("/addItem");
    } catch (error: any) {
      console.error("SaveTaskDetails ERROR:", error);
      alert("Error saving task details. Check console.");
    }
  };


  // -------------- LOAD TASK DETAILS ----------------
  const loadTaskDetails = async () => {
    try {
      setLoading(true);

      const payload = {
        taskID: id,
        userID: user.userId,
      };
      console.log('payload', payload);
      // 🔥 Call API
      const response = await axios.post(
        "https://vm-www-dprice01.icumed.com:5000/api/Inbox/getTaskDetails",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('data res', response.data);
      const data = response.data;
      setTask(data);

      // Populate UI fields
      setContact(data.contact || "");
      setContactNumber(data.contactNumber || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      setReference(data.tenderReference || "");

      // Valid From
      if (data.immediately) {
        setValidFromType("immediately");
      } else {
        setValidFromType("date");
        setValidFromDate(data.startDate ? new Date(data.startDate) : validFromDate);
      }

      // Valid Until
      if (data.expiryDate) {
        setValidUntilType("date");
        setValidUntilDate(new Date(data.expiryDate));
      }

      setLoading(false);
    } catch (error) {
      console.error("TASK DETAILS API ERROR:", error);
      setLoading(false);
    }
  };

  // LOAD ONCE
  useEffect(() => {
    if (user?.userId && id) {
      console.log('user and task', user?.userId, id);
      loadTaskDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);


  if (loading || !task) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Loading task details...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5 bg-white shadow rounded-lg space-y-6 text-sm">

      {/* ---------------------------------- */}
      {/*            TASK DETAILS            */}
      {/* ---------------------------------- */}
      <div>
        <h2 className="text-md font-semibold bg-gray-100 p-2 rounded">
          Task Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">

          <div>
            <label className="font-semibold text-gray-700">Task Name:</label>
            <input
              type="text"
              className="w-full mt-1 border rounded px-2 py-1.5 text-sm"
              value={task.name}
              readOnly
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Currency:</label>
            <input
              className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-gray-100"
              value={task.currencyCode}
              readOnly
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Task Type:</label>
            <input
              className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-gray-100"
              value={task.taskType}
              readOnly
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Segment:</label>
            <input
              className="w-full mt-1 border rounded px-2 py-1.5 bg-gray-100 text-sm"
              value={task.customerSegment}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------- */}
      {/*        PRICE LIST DETAILS          */}
      {/* ---------------------------------- */}
      <div>
        <h2 className="text-md font-semibold bg-gray-100 p-2 rounded">
          Price List Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">

          {/* VALID FROM */}
          <div>
            <label className="font-semibold text-gray-700">Valid From:</label>
            <div className="mt-2 space-y-2">

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={validFromType === "immediately"}
                  onChange={() => setValidFromType("immediately")}
                />
                Immediately
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={validFromType === "date"}
                  onChange={() => setValidFromType("date")}
                />
                <DatePicker
                  selected={validFromDate}
                  onChange={(d) => setValidFromDate(d)}
                  dateFormat="dd/MM/yyyy"
                  className="border rounded px-2 py-1.5 w-36 text-sm"
                  disabled={validFromType !== "date"}
                />
              </label>

            </div>
          </div>

          {/* VALID UNTIL */}
          <div>
            <label className="font-semibold text-gray-700">Valid Until:</label>
            <div className="mt-2 space-y-2">

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={validUntilType === "duration"}
                  onChange={() => setValidUntilType("duration")}
                />
                <select
                  className="border rounded px-2 py-1.5 w-36 text-sm"
                  disabled={validUntilType !== "duration"}
                  value={validUntilDuration}                // ★ default selected = "1 year"
                  onChange={(e) => setValidUntilDuration(e.target.value)}
                >
                  <option>1 month</option>
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>1 year</option>                   {/* ★ default option */}
                  <option>2 years</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={validUntilType === "date"}
                  onChange={() => setValidUntilType("date")}
                />
                <DatePicker
                  selected={validUntilDate}
                  onChange={(d) => setValidUntilDate(d)}
                  dateFormat="dd/MM/yyyy"
                  className="border rounded px-2 py-1.5 w-36 text-sm"
                />
              </label>

            </div>
          </div>

        </div>
      </div>

      {/* ---------------------------------- */}
      {/*        CUSTOMER DETAILS            */}
      {/* ---------------------------------- */}
      <div>
        <h2 className="text-md font-semibold bg-gray-100 p-2 rounded">
          Customer Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">

          <div>
            <label className="font-semibold">Name:</label>
            <input
              className="w-full mt-1 border rounded px-2 py-1.5"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Telephone:</label>
            <input
              className="w-full mt-1 border rounded px-2 py-1.5"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Email:</label>
            <input
              type="email"
              className="w-full mt-1 border rounded px-2 py-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Address:</label>
            <textarea
              className="w-full mt-1 border rounded px-2 py-1.5 h-20"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="col-span-2">
                <label className="font-semibold">Reference:</label>
                <input
                  className="w-full mt-1 border rounded px-2 py-1.5"
                  value={reference}
                  onChange={(e) => {
                   setReference(e.target.value)
                  }}
                />
              </div>

        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-center pt-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm shadow"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

    </div>
  );
};

export default TaskDetailsPage;
