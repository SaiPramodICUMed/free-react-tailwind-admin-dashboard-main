import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const user = useSelector((state: any) => state.user.users);



  

  return (
    <div className="w-full px-8 py-10 bg-white">
      {/* Page Heading */}
      <h2 className="text-center text-xl font-semibold text-gray-800">
        User Settings
      </h2>

      <p className="text-right font-medium text-gray-700 text-sm">
        <span className="font-semibold"> {user.userName} </span> - {user.userRole}
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
              ${activeTab === tab.key
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
  const [selectedCultureId, setSelectedCultureId] = useState<number | null>(null);
  const [language, setLanguage] = useState([]);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<number | null>(null);
  const [currency, setCurrency] = useState([]);
  const [numberFormat, setNumberFormat] = useState([]);
  const [timezone, setTimezone] = useState([]);
  const fetchLanguages = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/getLanguages`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Languages API Response:", response.data);
      setLanguage(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/getCurrencies`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Currencies API Response:", response.data);
      setCurrency(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchTimeZones = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/GetTimeZones`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Time zones API Response:", response.data);
      setTimezone(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchNumberFormatting = async () => {
    try {

      const payload = {
        viewName: `lkpNumberFormats`,
        sortBy: "",
        sortByDirection: "",
        filter: ``,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getDataNoPaging`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("NumberFormatting API Response:", response.data);
      setNumberFormat(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchLanguages();
    fetchCurrencies();
    fetchNumberFormatting();
    fetchTimeZones();
  }, []);

  const [selectedNumberFormat, setSelectedNumberFormat] = useState<number | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <SettingRow label="Language:">
        <select id="languages"
          value={selectedCultureId ?? ""}
          onChange={(e) => setSelectedCultureId(Number(e.target.value))}
          className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
        >
          {language.map((option: any) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </SettingRow>

      <SettingRow label="Currency:">
        <select id="currencies"
              value={selectedCurrencyCode ?? ""}
              onChange={(e) => setSelectedCurrencyCode(Number(e.target.value))}
              className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
            >
              {currency.map((option: any) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
      </SettingRow>

      <SettingRow label="Format:">
        <select
              id="numberformat"
              value={selectedNumberFormat ?? ""}
              onChange={(e) => setSelectedNumberFormat(Number(e.target.value))}
              className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
            >
              {numberFormat.map((option: any) => (
                <option key={option.FormatId} value={option.FormatId}>
                  {option.Formatting}
                </option>
              ))}
            </select>
      </SettingRow>

      <SettingRow label="TimeZone:">
         <select
              id="timezone"
              value={selectedTimeZone ?? ""}
              onChange={(e) => setSelectedTimeZone(e.target.value)}   // <--- STRING
              className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
            >
              {timezone.map((option: any) => (
                <option key={option.id} value={option.standardName}>
                  {option.displayName}
                </option>
              ))}
            </select>
      </SettingRow>

      <div className="text-center">
        <button className="bg-blue-800 text-white px-5 py-2 rounded text-sm">Save</button>
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

      <div className="text-center">
        <button className="bg-blue-800 text-white px-5 py-2 rounded text-sm">Save</button>
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
          className="border rounded px-3 py-1 text-sm"
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
          className="border rounded px-3 py-2 w-[350px] h-28 text-sm"
          value={coverMessage}
          onChange={(e) => setCoverMessage(e.target.value)}
        />
      </SettingRow>

      <SettingRow label="Cover Setting:">
        <div className="flex gap-6">
          {["off", "on", "auto"].map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
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
        <button className="bg-blue-800 text-white px-5 py-2 rounded text-sm">Save</button>
      </div>
    </div>
  );
}

/* ------------------------- REUSABLE ROW ------------------------- */
function SettingRow({ label, description, children }: any) {
  return (
    <div className="grid grid-cols-12 items-start gap-4">
      {/* Label */}
      <div className="col-span-3">
        <p className="font-semibold text-gray-700 text-sm">{label}</p>
      </div>

      {/* Description (italic, muted) */}
      <div className="col-span-7">
        <p className="text-gray-600 italic text-sm">{description}</p>
      </div>

      {/* Control (right-aligned) */}
      <div className="col-span-2 flex justify-end items-center text-sm">{children}</div>
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
    <div className="grid grid-cols-12 items-start gap-4">
      {/* Label */}
      <div className="col-span-3">
        <p className="font-semibold text-gray-700 text-sm">{label}</p>
      </div>

      {/* Description (italic, muted) */}
      <div className="col-span-7">
        <p className="text-gray-600 italic text-sm">{description}</p>
      </div>

      {/* Control (right-aligned) */}
      <div className="col-span-2 flex justify-end items-center text-sm">{children}</div>
    </div>
  );
}
