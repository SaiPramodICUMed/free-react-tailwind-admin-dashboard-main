import React, { useState } from "react";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";

const TaskDetails: React.FC = () => {
  const today = new Date();

  // Valid From
  const [validFrom, setValidFrom] = useState("immediately");
  const [validFromDate, setValidFromDate] = useState<Date | null>(today);

  // Valid Until
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const [validUntil, setValidUntil] = useState("duration");
  const [validUntilDuration, setValidUntilDuration] = useState("1year");
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(nextYear);
  const user = useSelector((state: any) => state.user.users);
  const taskId = useSelector((state: any) => state.user.taskDetails);
  const [customer, setCustomer] = useState({
    name: "",
    telephone: "",
    email: "",
    address: "",
    reference: "",
  });

  const navigate = useNavigate();

  const handleCustomerChange = (e: any) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------------
  // SAVE API CALL
  // -------------------------------------------------------
  const handleSave = async () => {
    try {
      // -------- START DATE --------
      const startDate =
        validFrom === "immediately"
          ? today.toISOString()
          : validFromDate
            ? validFromDate.toISOString()
            : null;

      // -------- EXPIRY DATE LOGIC --------
      let expiryDays = 365;

      const durationMap: any = {
        "1month": 30,
        "3months": 90,
        "6months": 180,
        "1year": 365,
        "2years": 730,
        "3years": 1095,
        "4years": 1460,
        "5years": 1825,
        "6years": 2190,
        "7years": 2555,
      };

      if (validUntil === "duration") {
        expiryDays = durationMap[validUntilDuration] || 365;
      } else if (validUntil === "date" && validUntilDate) {
        const diff =
          (validUntilDate.getTime() - new Date(startDate!).getTime()) /
          (1000 * 60 * 60 * 24);
        expiryDays = Math.max(1, Math.round(diff));
      }
      console.log('taskid', taskId);

      // --------- API PAYLOAD ---------
      const payload = {
        taskID: taskId.taskId, // 🔥 Replace with actual TaskID from Redux
        userID: user.userId,   // 🔥 Replace with actual Logged-in user ID
        contact: customer.reference,
        contactNumber: customer.telephone,
        address: customer.address,
        comments: null,
        email: customer.email,
        name: customer.name,
        taskTypeID: 0,
        currencyCode: null,
        customerSegmentId: null,
        approvalID: null,
        expiryDate: expiryDays,
        immediately: validFrom === "immediately",
        startDate: startDate,
        tenderExclusivity: false,
        tenderPriceQualityEnabled: false,
        tenderPriceQualityValue: 0,
        tenderReference: null,
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

      console.log("TaskDetails API Response:", response.data);

      alert("Task details saved successfully!");
      navigate("/addItem");

    } catch (error: any) {
      console.error("SaveTaskDetails ERROR:", error);
      alert("Error saving task details. Check console.");
    }
  };

  // -------------------------------------------------------
  // UI SECTION
  // -------------------------------------------------------

  return (
    <form className="max-w-4xl mx-auto bg-white p-6 rounded shadow-sm text-sm mt-4">

      <h2 className="text-xl font-semibold mb-4 text-gray-700">Task Details</h2>

      {/* Price List Details */}
      <h3 className="font-semibold text-blue-700 mb-3">Price List Details</h3>

      {/* VALID FROM */}
      <div className="flex items-center mb-4">
        <label className="font-medium text-gray-600 w-28">Valid From:</label>

        <div className="flex items-center gap-2 w-40">
          <input
            type="radio"
            name="validFrom"
            checked={validFrom === "immediately"}
            onChange={() => setValidFrom("immediately")}
          />
          <span>Immediately</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="validFrom"
            checked={validFrom === "date"}
            onChange={() => setValidFrom("date")}
          />

          <DatePicker
            selected={validFromDate}
            onChange={(date) => setValidFromDate(date)}
            dateFormat="dd/MM/yyyy"
            minDate={today}
            disabled={validFrom !== "date"}
            className={`border rounded px-3 py-2 w-[160px] ${validFrom !== "date"
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
              }`}
          />
        </div>
      </div>

      {/* VALID UNTIL */}
      <div className="flex items-center mb-4">
        <label className="font-medium text-gray-600 w-28">Valid Until:</label>

        <div className="flex items-center gap-2 w-40">
          <input
            type="radio"
            name="validUntil"
            checked={validUntil === "duration"}
            onChange={() => setValidUntil("duration")}
          />

          <select
            disabled={validUntil !== "duration"}
            value={validUntilDuration}
            onChange={(e) => setValidUntilDuration(e.target.value)}
            className={`border rounded px-3 py-2 w-[160px] ${validUntil !== "duration"
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
              }`}
          >
            <option value="1month">1 month</option>
            <option value="3months">3 months</option>
            <option value="6months">6 months</option>
            <option value="1year">1 year</option>
            <option value="2years">2 years</option>
            <option value="3years">3 years</option>
            <option value="4years">4 years</option>
            <option value="5years">5 years</option>
            <option value="6years">6 years</option>
            <option value="7years">7 years</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="validUntil"
            checked={validUntil === "date"}
            onChange={() => setValidUntil("date")}
          />

          <DatePicker
            selected={validUntilDate}
            onChange={(date) => setValidUntilDate(date)}
            dateFormat="dd/MM/yyyy"
            disabled={validUntil !== "date"}
            className={`border rounded px-3 py-2 w-[160px] ${validUntil !== "date"
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
              }`}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-gray-300"></div>

      {/* Customer Details */}
      <h3 className="font-semibold text-blue-700 mb-3">Customer Details</h3>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <label className="block font-medium text-gray-600 mb-1">Name:</label>
          <input
            name="name"
            value={customer.name}
            onChange={handleCustomerChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Telephone:</label>
          <input
            name="telephone"
            value={customer.telephone}
            onChange={handleCustomerChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleCustomerChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block font-medium text-gray-600 mb-1">Address:</label>
          <textarea
            name="address"
            rows={2}
            value={customer.address}
            onChange={handleCustomerChange}
            className="w-full border rounded p-2 resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Reference:</label>
          <input
            name="reference"
            value={customer.reference}
            onChange={handleCustomerChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-center mt-6">
        {/* <button
          type="button"
          onClick={() => navigate('/pricingAccount')}
          className="bg-gray-100 border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-150"
        >
          Back
        </button> */}
        <button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow ml-4"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default TaskDetails;
