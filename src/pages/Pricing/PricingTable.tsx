import React, { useEffect, useState } from "react";
import TabHeader from "./TabHeader";
import TaskDetailsPage from "./TaskDetailsPage";
import Approvals from "./Approvals";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";


const PricingTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pricing");
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: any) => state.user.users);
  const [rows, setRows] = useState([

  ]);



  // const handleDelete = (id: number) => {
  //   setRows(rows.filter((row) => row.id !== id));
  // };

  // const handleChange = (id: number, field: keyof PricingRow, value: string) =>
  //   setRows(
  //     rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
  //   );
  const { id } = useParams();
  console.log('id', id);
  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: user.userId,
        firstRow: 1,
        lastRow: 50,
        sortBy: "(CASE WHEN LotOrderKey = -1 THEN 1 ELSE 0 END) ASC, LotOrderKey ASC, OrderKey ASC",
        taskId: Number(id),
        filter: "",
        customViewId: -1,
      };

      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/FilterPricingView`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('pricing data', response.data);
      setRows(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching In Progress data:", error.message);
      setLoading(false);
    }
  };

  const safeFixed = (value: any, digits = 2) => {
  return value !== null && value !== undefined && !isNaN(value)
    ? Number(value).toFixed(digits)
    : "0.00";
};


  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-x-hidden">
      <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* -------------------- TAB CONTENT --------------------- */}

      {activeTab === "pricing" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap justify-between items-center mb-4 mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Pricing Table</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                //onClick={handleAdd}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Add
              </button>
              <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                Copy
              </button>
              <button
                //onClick={() => rows.length && handleDelete(rows[rows.length - 1].id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Export
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto bg-white shadow rounded">
            <table className="w-full text-sm border-collapse table-fixed">
              <thead>
                <tr className="bg-blue-100 text-gray-800 text-xs uppercase text-center">
                  <th rowSpan={2} className="border p-2 w-10">#</th>

                  {/* ITEM */}
                  <th colSpan={2} className="border p-2 w-64">Item</th>

                  {/* HISTORY */}
                  <th colSpan={5} className="border p-2 w-72">History</th>

                  {/* INPUT */}
                  <th colSpan={2} className="border p-2 w-48">Input</th>

                  {/* PRICE GUIDES */}
                  <th colSpan={5} className="border p-2 w-80">Price Guides</th>

                  {/* FORECAST */}
                  <th className="border p-2 w-32">Gross Forecast</th>
                  <th className="border p-2 w-32">Net Forecast</th>

                  {/* ASSISTING */}
                  <th colSpan={2} className="border p-2 w-40">Assisting Data</th>
                </tr>

                <tr className="bg-gray-100 text-gray-700 text-xs uppercase text-center">

                  {/* ITEM */}
                  <th className="border p-2 w-20">Item</th>
                  <th className="border p-2 w-56">Item Description</th>

                  {/* HISTORY */}
                  <th className="border p-2 w-20">Gross Volume</th>
                  <th className="border p-2 w-24">Gross Sales</th>
                  <th className="border p-2 w-24">Gross ASP</th>
                  <th className="border p-2 w-20">Item Cost</th>
                  <th className="border p-2 w-20">GM %</th>

                  {/* INPUT */}
                  <th className="border p-2 w-20">Volume</th>
                  <th className="border p-2 w-28">New Price</th>

                  {/* PRICE GUIDES */}
                  <th className="border p-2 w-24">Price Comp</th>
                  <th className="border p-2 w-24">Live Price</th>
                  <th className="border p-2 w-28">Live Price (Group)</th>
                  <th className="border p-2 w-28">Target Price</th>
                  <th className="border p-2 w-28">Floor Price</th>

                  {/* FORECAST */}
                  <th className="border p-2 w-32">New Gross Sales</th>
                  <th className="border p-2 w-20">New GM %</th>

                  {/* ASSISTING */}
                  <th className="border p-2 w-24">Competitor</th>
                  <th className="border p-2 w-24">Pricing Tool</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.Item} className="border-t hover:bg-gray-50 text-center">

                    <td className="p-2">{index + 1}</td>

                    {/* Item */}
                    <td className="p-2 truncate" title={row.Item}>{row.Item}</td>

                    {/* Description */}
                    <td className="p-2 truncate w-56" title={row.Description}>
                      {row.Description}
                    </td>

                    {/* HISTORY */}
                    <td className="p-2">{row.GrossEaches}</td>
                    <td className="p-2">{safeFixed(row.GrossSales, 2)}</td>
                    <td className="p-2">{safeFixed(row.GrossASP,2)}</td>
                    <td className="p-2">{safeFixed(row.Cost,2)}</td>
                    <td className="p-2">{safeFixed(row.GMPercent, 2)}</td>

                    {/* INPUT */}
                    <td className="p-2 bg-gray-100 font-semibold text-green-700 rounded">
                      {row.GrossEaches}
                    </td>
                    <td className="p-2 bg-green-100 font-semibold text-green-700 rounded">
                      {row.NewPrice}
                    </td>

                    {/* PRICE GUIDE */}
                    <td className="p-2">{safeFixed(row.PriceComparison, 2)}</td>
                    <td className="p-2">{row.LivePrice}</td>
                    <td className="p-2">{row.GroupLivePrice}</td>
                    <td className="p-2">{safeFixed(row.TargetPrice, 2)}</td>
                    <td className="p-2">{row.FloorPrice}</td>

                    {/* FORECAST */}
                    <td className="p-2">{row.NewGrossSales}</td>
                   <td className="p-2">{safeFixed(row.GMPercentRebate, 0)}</td>

                    {/* ASSISTING */}
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={18} className="text-center text-gray-500 py-6">
                      No records to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          <div className="text-sm text-gray-600 mt-4">
            Displaying items {rows.length ? `1 - ${rows.length}` : "0"} of{" "}
            {rows.length}
          </div>
        </>
      )}

      {/* -------------------- DETAILS TAB --------------------- */}
      {activeTab === "details" && <TaskDetailsPage />}

      {/* -------------------- APPROVALS TAB --------------------- */}
      {activeTab === "approvals" && (
        <div className="mt-6">
          <Approvals />
        </div>
      )}
    </div>
  );
};

export default PricingTable;
