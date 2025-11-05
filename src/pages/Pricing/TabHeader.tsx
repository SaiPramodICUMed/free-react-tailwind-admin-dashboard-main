import React, { useState } from "react";

const TabHeader: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pricing");

  const tabs = [
    { id: "pricing", label: "Pricing" },
    { id: "details", label: "Details" },
    { id: "approvals", label: "Approvals" },
  ];

  return (
    <div className="w-full bg-blue-100 border-b border-blue-300 rounded-t-lg shadow-sm">
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow"
                  : "text-blue-700 hover:bg-blue-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabHeader;
