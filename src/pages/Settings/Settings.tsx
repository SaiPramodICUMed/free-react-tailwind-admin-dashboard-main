import { useState } from "react";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="w-full px-8 py-10 bg-white">
      {/* Page Heading */}
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-4">
        User Settings
      </h2>

      <p className="text-right font-medium mb-8 text-gray-700">
        Sai Pramod - Netherlands - Super User
      </p>

      {/* Outer Box */}
      <div className="border border-blue-800 rounded-lg overflow-hidden">
        {/* HEADER */}
        {/* <div className="bg-blue-800 text-white border-b border-white font-semibold text-lg px-6 py-3">
          Settings
        </div> */}

        {/* Tabs */}
        <div className="flex border-b border-blue-800 bg-white">
          {[
            { key: "general", label: "General" },
            { key: "email", label: "Email" },
            { key: "outofoffice", label: "Out of Office" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-r border-white 
              ${
                activeTab === tab.key
                  ? "bg-blue-800  text-white"
                  : "bg-white text-blue-800 hover:bg-blue-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white p-8">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "email" && <EmailTab />}
          {activeTab === "outofoffice" && <OutOfOfficeTab />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- GENERAL TAB ------------------------- */
function GeneralTab() {
  const [language, setLanguage] = useState("English (UK)");
  const [currency, setCurrency] = useState("EUR");
  const [format, setFormat] = useState("123.456.789,00");
  const [timezone, setTimezone] = useState("(UTC+01:00) Amsterdam, Berlin, Rome");

  return (
    <div className="space-y-6">
      <SettingRow label="Language:">
        <select
          className="border rounded px-3 py-1"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English (UK)</option>
          <option>English (US)</option>
          <option>Dutch</option>
        </select>
      </SettingRow>

      <SettingRow label="Currency:">
        <select
          className="border rounded px-3 py-1"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option>EUR</option>
          <option>USD</option>
          <option>INR</option>
        </select>
      </SettingRow>

      <SettingRow label="Format:">
        <select
          className="border rounded px-3 py-1"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option>123.456.789,00</option>
          <option>123,456,789.00</option>
        </select>
      </SettingRow>

      <SettingRow label="TimeZone:">
        <select
          className="border rounded px-3 py-1 w-[350px]"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          <option>(UTC+01:00) Amsterdam, Berlin, Rome</option>
          <option>(UTC+05:30) India Standard Time</option>
        </select>
      </SettingRow>

      <div className="text-center mt-10">
        <button className="bg-blue-800 text-white px-5 py-2 rounded">Save</button>
      </div>
    </div>
  );
}

/* ------------------------- EMAIL TAB (updated to match screenshot) ------------------------- */
function EmailTab() {
  const [actionAlerts, setActionAlerts] = useState(true);
  const [includeChangeSummary, setIncludeChangeSummary] = useState(true);
  const [emailComments, setEmailComments] = useState(true);
  const [summaryReport, setSummaryReport] = useState("No");

  return (
    <div className="space-y-6">
      {/* Row: Requirement Alerts */}
      <EmailRow
        label="Requirement Alerts:"
        description="Emails to inform users when an approval decision is needed"
      >
        <div className="text-right">
          <span className="text-gray-700">Individual</span>
        </div>
      </EmailRow>

      {/* Row: Deadline Alerts */}
      <EmailRow
        label="Deadline Alerts:"
        description="Email to inform users when tasks have reached their deadline"
      >
        <div className="text-right">
          <span className="text-gray-700">Daily Summary</span>
        </div>
      </EmailRow>

      {/* Row: Action Alerts (checkbox on right) */}
      <EmailRow
        label="Action Alerts:"
        description="Emails detailing all approval actions (decline, approve, completed etc)"
      >
        <div className="text-right">
          <input
            type="checkbox"
            checked={actionAlerts}
            onChange={(e) => setActionAlerts(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      {/* Row: Summary Reports */}
      <EmailRow
        label="Summary Reports:"
        description="A summary (daily/weekly) of all above alerts"
      >
        <div className="text-right">
          <select
            value={summaryReport}
            onChange={(e) => setSummaryReport(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option>No</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </div>
      </EmailRow>

      {/* Row: Include change summary */}
      <EmailRow label="Include change summary:" description="">
        <div className="text-right">
          <input
            type="checkbox"
            checked={includeChangeSummary}
            onChange={(e) => setIncludeChangeSummary(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      {/* Row: Comments */}
      <EmailRow label="Comments:" description="">
        <div className="text-right">
          <input
            type="checkbox"
            checked={emailComments}
            onChange={(e) => setEmailComments(e.target.checked)}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </EmailRow>

      <div className="text-center mt-10">
        <button className="bg-blue-800 text-white px-5 py-2 rounded">Save</button>
      </div>
    </div>
  );
}

/* ------------------------- OUT OF OFFICE TAB ------------------------- */
function OutOfOfficeTab() {
  const [coverUser, setCoverUser] = useState("None");
  const [coverMessage, setCoverMessage] = useState("");
  const [coverSetting, setCoverSetting] = useState("off");

  return (
    <div className="space-y-6">
      <SettingRow label="Cover User:">
        <select
          className="border rounded px-3 py-1"
          value={coverUser}
          onChange={(e) => setCoverUser(e.target.value)}
        >
          <option>None</option>
          <option>Manager</option>
          <option>Assistant</option>
        </select>
      </SettingRow>

      <SettingRow label="Cover Message:">
        <textarea
          className="border rounded px-3 py-2 w-[350px] h-28"
          value={coverMessage}
          onChange={(e) => setCoverMessage(e.target.value)}
        />
      </SettingRow>

      <SettingRow label="Cover Setting:">
        <div className="flex gap-6">
          {["off", "on", "auto"].map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="radio"
                checked={coverSetting === option}
                onChange={() => setCoverSetting(option)}
              />
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </label>
          ))}
        </div>
      </SettingRow>

      <div className="text-center mt-10">
        <button className="bg-blue-800 text-white px-5 py-2 rounded">Save</button>
      </div>
    </div>
  );
}

/* ------------------------- REUSABLE ROW ------------------------- */
function SettingRow({ label, children }: any) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <p className="font-semibold text-gray-700">{label}</p>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

/* ------------------------- EMAIL ROW (3-column: label | desc | control) ------------------------- */
function EmailRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-12 items-start gap-4 py-3">
      {/* Label */}
      <div className="col-span-3">
        <p className="font-semibold text-gray-700">{label}</p>
      </div>

      {/* Description (italic, muted) */}
      <div className="col-span-7">
        <p className="text-gray-600 italic">{description}</p>
      </div>

      {/* Control (right-aligned) */}
      <div className="col-span-2 flex justify-end items-center">{children}</div>
    </div>
  );
}
