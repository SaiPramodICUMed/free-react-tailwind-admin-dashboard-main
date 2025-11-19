import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TaskDetailsPage: React.FC = () => {
  const [validFromType, setValidFromType] = useState<"immediately" | "date">("date");
  const [validUntilType, setValidUntilType] = useState<"duration" | "date">("date");

  const [validFromDate, setValidFromDate] = useState<Date | null>(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date | null>(new Date());

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
          {/* Task Name */}
          <div>
            <label className="font-semibold text-gray-700">Task Name:</label>
            <input
              type="text"
              className="w-full mt-1 border rounded px-2 py-1.5 text-sm"
              defaultValue="R – (D) (D) 4286332CN – 6795 / CIUSSS MCQ Center"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="font-semibold text-gray-700">Currency:</label>
            <select className="w-full mt-1 border rounded px-2 py-1.5 text-sm">
              <option>CAD</option>
              <option>USD</option>
            </select>
          </div>

          {/* Task Type */}
          <div>
            <label className="font-semibold text-gray-700">Task Type:</label>
            <select className="w-full mt-1 border rounded px-2 py-1.5 text-sm">
              <option>Renewal</option>
              <option>Offer</option>
              <option>Price Change</option>
            </select>
          </div>

          {/* Segment */}
          <div>
            <label className="font-semibold text-gray-700">Segment:</label>
            <input
              type="text"
              className="w-full mt-1 border rounded px-2 py-1.5 bg-gray-100 text-sm"
              defaultValue="Direct Hospital"
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

        {/* Put BOTH controls side by side */}
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
                >
                  <option>1 month</option>
                  <option>3 months</option>
                  <option>6 months</option>
                  <option>1 year</option>
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
      {/*         CUSTOMER DETAILS           */}
      {/* ---------------------------------- */}
      <div>
        <h2 className="text-md font-semibold bg-gray-100 p-2 rounded">
          Customer Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
          <div>
            <label className="font-semibold">Name:</label>
            <input
              type="text"
              className="w-full mt-1 border rounded px-2 py-1.5"
              defaultValue="Nadia Cecco"
            />
          </div>

          <div>
            <label className="font-semibold">Telephone:</label>
            <input type="text" className="w-full mt-1 border rounded px-2 py-1.5" />
          </div>

          <div>
            <label className="font-semibold">Email:</label>
            <input
              type="email"
              className="w-full mt-1 border rounded px-2 py-1.5"
              defaultValue="nadia_cecco@ssss.gouv.qc.ca"
            />
          </div>

          <div>
            <label className="font-semibold">Address:</label>
            <textarea
              className="w-full mt-1 border rounded px-2 py-1.5 h-20"
              defaultValue="Please use the same contact as previous contract"
            ></textarea>
          </div>

          <div>
            <label className="font-semibold">Reference:</label>
            <input type="text" className="w-full mt-1 border rounded px-2 py-1.5" />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-center pt-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm shadow">
          Save
        </button>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
