import { useModal } from "../../hooks/useModal";
// import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
// import Input from "../form/input/InputField";
// import Label from "../form/Label";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserInfoCard() {
  
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
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            General
          </h4>
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

      {/* <div className="text-center">
        <button className="bg-blue-800 text-white px-5 py-2 rounded text-sm">Save</button>
      </div> */}
    </div>

          {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Musharof
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Chowdhury
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                randomuser@pimjo.comavd
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +09 363 398 46
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Team Manager
              </p>
            </div>
          </div> */}
        </div>

        <button
        //  onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Save
        </button>
      </div>

      {/* <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value="https://www.facebook.com/PimjoHQ"
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input type="text" value="https://x.com/PimjoHQ" />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      value="https://www.linkedin.com/company/pimjo"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input type="text" value="https://instagram.com/PimjoHQ" />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" value="Musharof" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" value="Chowdhury" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value="randomuser@pimjo.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" value="+09 363 398 46" />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input type="text" value="Team Manager" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal> */}
    </div>
  );
}
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