import React, { useState } from "react";
import TabHeader from "./TabHeader";

interface PricingRow {
  id: number;
  item: string;
  description: string;
  grossVolume: string;
  grossSales: string;
  grossASP: string;
  itemCost: string;
  gmPercent: string;
  volume: string;
  newPrice: string;
  priceComparison: string;
  livePrice: string;
  targetPrice: string;
  floorPrice: string;
  newGrossSales: string;
  newGMPercent: string;
  competitor: string;
  pricingTool: string;
}

const PricingTable: React.FC = () => {
  const [rows, setRows] = useState<PricingRow[]>([
    {
      id: 1,
      item: "0001",
      description: "DUMMY VERTRIEB 1/EA",
      grossVolume: "",
      grossSales: "$0.00",
      grossASP: "$0.00",
      itemCost: "$0.00",
      gmPercent: "0.0%",
      volume: "",
      newPrice: "$0.00",
      priceComparison: "",
      livePrice: "$0.00",
      targetPrice: "$0.00",
      floorPrice: "$0.00",
      newGrossSales: "$0.00",
      newGMPercent: "",
      competitor: "",
      pricingTool: "",
    },
  ]);

  const handleAdd = () => {
    const newRow: PricingRow = {
      id: rows.length + 1,
      item: "",
      description: "",
      grossVolume: "",
      grossSales: "$0.00",
      grossASP: "$0.00",
      itemCost: "$0.00",
      gmPercent: "0.0%",
      volume: "",
      newPrice: "$0.00",
      priceComparison: "",
      livePrice: "$0.00",
      targetPrice: "$0.00",
      floorPrice: "$0.00",
      newGrossSales: "$0.00",
      newGMPercent: "",
      competitor: "",
      pricingTool: "",
    };
    setRows([...rows, newRow]);
  };

  const handleDelete = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id: number, field: keyof PricingRow, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen overflow-x-hidden">
      <TabHeader />

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-800">Pricing Table</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add
          </button>
          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
            Copy
          </button>
          <button
            onClick={() => rows.length && handleDelete(rows[rows.length - 1].id)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-sm border-collapse table-auto">
          <thead>
            <tr className="bg-blue-100 text-gray-800 text-xs uppercase text-center">
              <th rowSpan={2} className="border p-2 w-10">#</th>
              <th colSpan={2} className="border p-2">Item</th>
              <th colSpan={5} className="border p-2">History</th>
              <th colSpan={2} className="border p-2">Input</th>
              <th colSpan={5} className="border p-2">Price Guides</th>
              <th className="border p-2">Gross Forecast</th>
              <th className="border p-2">Net Forecast</th>
              <th colSpan={2} className="border p-2">Assisting Data</th>
            </tr>

            <tr className="bg-gray-100 text-gray-700 text-xs uppercase text-center">
              <th className="border p-2">Item</th>
              <th className="border p-2">Item Description</th>
              <th className="border p-2">Gross Volume</th>
              <th className="border p-2">Gross Sales</th>
              <th className="border p-2">Gross ASP</th>
              <th className="border p-2">Item Cost</th>
              <th className="border p-2">GM %</th>
              <th className="border p-2">Volume</th>
              <th className="border p-2">New Price</th>
              <th className="border p-2">Price Comparison</th>
              <th className="border p-2">Live Price</th>
              <th className="border p-2">Live Price (Group)</th>
              <th className="border p-2">Target Price</th>
              <th className="border p-2">Floor Price</th>
              <th className="border p-2">New Gross Sales</th>
              <th className="border p-2">New GM %</th>
              <th className="border p-2">Competitor</th>
              <th className="border p-2">Pricing Tool</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50 text-center">
                <td className="p-2">{row.id}</td>
                <td className="p-2">
                  <input
                    value={row.item}
                    onChange={(e) => handleChange(row.id, "item", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={row.description}
                    onChange={(e) => handleChange(row.id, "description", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>

                <td className="p-2">{row.grossVolume}</td>
                <td className="p-2">{row.grossSales}</td>
                <td className="p-2">{row.grossASP}</td>
                <td className="p-2">{row.itemCost}</td>
                <td className="p-2">{row.gmPercent}</td>
                <td className="p-2">
                  <input
                    value={row.volume}
                    onChange={(e) => handleChange(row.id, "volume", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>
                <td className="p-2 bg-green-100 font-semibold text-green-700 rounded">
                  {row.newPrice}
                </td>
                <td className="p-2">
                  <input
                    value={row.priceComparison}
                    onChange={(e) => handleChange(row.id, "priceComparison", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">{row.livePrice}</td>
                <td className="p-2">{row.livePrice}</td>
                <td className="p-2">{row.targetPrice}</td>
                <td className="p-2">{row.floorPrice}</td>
                <td className="p-2">{row.newGrossSales}</td>
                <td className="p-2">{row.newGMPercent}</td>
                <td className="p-2">
                  <input
                    value={row.competitor}
                    onChange={(e) => handleChange(row.id, "competitor", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={row.pricingTool}
                    onChange={(e) => handleChange(row.id, "pricingTool", e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1"
                  />
                </td>
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

      {/* Footer */}
      <div className="text-sm text-gray-600 mt-4">
        Displaying items {rows.length ? `1 - ${rows.length}` : "0"} of {rows.length}
      </div>
    </div>
  );
};

export default PricingTable;
