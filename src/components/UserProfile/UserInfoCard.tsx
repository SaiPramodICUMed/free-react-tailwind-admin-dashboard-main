import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function UserInfoCard() {
  const user = useSelector((state: any) => state.user.users);

  // Dropdown data
  const [language, setLanguage] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any[]>([]);
  const [numberFormat, setNumberFormat] = useState<any[]>([]);
  const [timezone, setTimezone] = useState<any[]>([]);

  // Selected values
  const [selectedCultureId, setSelectedCultureId] = useState<number | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<any>(null);
  const [selectedNumberFormat, setSelectedNumberFormat] = useState<number | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>("");

  // Checkbox state
  const [taskOpenNewTab, setTaskOpenNewTab] = useState<boolean>(false);

  // -----------------------------
  // API CALLS
  // -----------------------------
  const fetchLanguages = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/getLanguages`
      );
      setLanguage(res.data);
    } catch (err) {
      console.log("Error fetching languages:", err);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Pricing/getCurrencies`
      );
      setCurrency(res.data);
    } catch (err) {
      console.log("Error fetching currencies:", err);
    }
  };

  const fetchTimeZones = async () => {
    try {
      const res = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/GetTimeZones`
      );
      setTimezone(res.data);
    } catch (err) {
      console.log("Error fetching timezones:", err);
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

      const res = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getDataNoPaging`,
        payload
      );

      setNumberFormat(res.data);
    } catch (err) {
      console.log("Error fetching number formats:", err);
    }
  };

  // -----------------------------------------
  // RUN ALL APIS ONCE
  // -----------------------------------------
  useEffect(() => {
    fetchLanguages();
    fetchCurrencies();
    fetchNumberFormatting();
    fetchTimeZones();
  }, []);

  // -----------------------------------------
  // AUTO-SELECT USER SAVED SETTINGS
  // -----------------------------------------
  useEffect(() => {
    if (
      language.length > 0 &&
      currency.length > 0 &&
      numberFormat.length > 0 &&
      timezone.length > 0
    ) {
      // LANGUAGE SELECTION
      const lang = language.find((l: any) => l.id === user.cultureCodeId);
      if (lang) setSelectedCultureId(lang.id);

      // CURRENCY SELECTION (currency list returns strings)
      const curr = currency.find((c: any) => c === user.currencyCode);
      if (curr) setSelectedCurrencyCode(curr);

      // NUMBER FORMAT
      const nf = numberFormat.find((n: any) => n.FormatId === user.numberFormatId);
      if (nf) setSelectedNumberFormat(nf.FormatId);

      // TIMEZONE
      const tz = timezone.find((t: any) => t.standardName === user.timeZone);
      if (tz) setSelectedTimeZone(tz.standardName);

      // CHECKBOX
      setTaskOpenNewTab(user.taskOpenNewTab);
    }
  }, [language, currency, numberFormat, timezone]);

  const handleSave = async () => {
  try {
    const payload = {
      userID: user.userId,
      cultureCodeId: selectedCultureId,
      currencyCode: selectedCurrencyCode,
      numberFormatId: selectedNumberFormat,
      timeZone: selectedTimeZone,
      taskOpenNewTab: taskOpenNewTab
    };

    console.log("Saving payload:", payload);

    const res = await axios.post(
      `https://vm-www-dprice01.icumed.com:5000/api/Login/UpdateUserGeneralSettings`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.data?.message) {
      alert(res.data.message);
    } else {
      alert("Settings updated successfully.");
    }
  } catch (error) {
    console.error("Save error:", error);
    alert("Failed to save settings.");
  }
};



  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            General
          </h4>

          <div className="space-y-6">

            {/* LANGUAGE */}
            <SettingRow label="Language:">
              <select
                value={selectedCultureId ?? ""}
                onChange={(e) => setSelectedCultureId(Number(e.target.value))}
                className="w-[200px] border border-gray-300 rounded-md px-3 py-1 text-gray-700 bg-white"
              >
                {language.map((option: any) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </SettingRow>

            {/* CURRENCY */}
            <SettingRow label="Currency:">
              <select
                value={selectedCurrencyCode ?? ""}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className="w-[200px] border border-gray-300 rounded-md px-3 py-1 text-gray-700 bg-white"
              >
                {currency.map((option: any) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </SettingRow>

            {/* FORMAT */}
            <SettingRow label="Format:">
              <select
                value={selectedNumberFormat ?? ""}
                onChange={(e) => setSelectedNumberFormat(Number(e.target.value))}
                className="w-[200px] border border-gray-300 rounded-md px-3 py-1 text-gray-700 bg-white"
              >
                {numberFormat.map((option: any) => (
                  <option key={option.FormatId} value={option.FormatId}>
                    {option.Formatting}
                  </option>
                ))}
              </select>
            </SettingRow>

            {/* TIMEZONE */}
            <SettingRow label="TimeZone:">
              <select
                value={selectedTimeZone ?? ""}
                onChange={(e) => setSelectedTimeZone(e.target.value)}
                className="w-[200px] border border-gray-300 rounded-md px-3 py-1 text-gray-700 bg-white"
              >
                {timezone.map((option: any) => (
                  <option key={option.id} value={option.standardName}>
                    {option.displayName}
                  </option>
                ))}
              </select>
            </SettingRow>

            {/* OPEN TASKS IN NEW TAB */}
            <SettingRow label="Open Tasks in New Tab:">
              <input
                type="checkbox"
                checked={taskOpenNewTab}
                onChange={(e) => setTaskOpenNewTab(e.target.checked)}
                className="w-4 h-4"
              />
            </SettingRow>

          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:w-auto"
        >
          Save
        </button>

      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: any) {
  return (
    <div className="grid grid-cols-12 items-start gap-4">
      <div className="col-span-3">
        <p className="font-semibold text-gray-700 text-sm">{label}</p>
      </div>

      <div className="col-span-7">
        <p className="text-gray-600 italic text-sm">{description}</p>
      </div>

      <div className="col-span-2 flex justify-end items-center text-sm">
        {children}
      </div>
    </div>
  );
}
