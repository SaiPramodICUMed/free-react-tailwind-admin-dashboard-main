import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CountrySettings() {
  const user = useSelector((state: any) => state.user.users);
  const [language, setLanguage] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [numberFormat, setNumberFormat] = useState([]);
  const [timezone, setTimezone] = useState([]);
  const [priceList, setpriceList] = useState([]);
  const [priceListHeader, setpriceListHeader] = useState();
  const [priceListHeaderItems, setpriceListHeaderItems] = useState();
  const [listPriceRestriction, setListPriceRestriction] = useState(false);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const [countryById, setCountryById] = useState([]);
  const [selectedCultureId, setSelectedCultureId] = useState<number | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<number | null>(null);
  const [selectedNumberFormat, setSelectedNumberFormat] = useState<number | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<number | null>(null);

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

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

  const fetchCountryById = async () => {
    try {
      const response = await axios.get(
        `https://vm-www-dprice01.icumed.com:5000/api/Users/GetCountryById/${selectedValue}`,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Country Data API Response:", response.data);
      setCountryById(response.data);
      const country = response.data[0]; // you get array, take first
      console.log("country.TimeZone", country.TimeZone);
      setSelectedCultureId(country.CultureCodeId);
      setSelectedCurrencyCode(country.CurrencyCode);
      setSelectedNumberFormat(country.NumberFormatId);
      setSelectedTimeZone(country.TimeZone);
      setpriceListHeader(country.ListHeaderName);
      setpriceListHeaderItems(country.ListHeaderItemsCount);
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


  const fetchPriceLists = async (start: number, end: number, country: number) => {
    try {

      const payload = {
        viewName: `vw_PriceLists`,
        firstRow: start,
        lastRow: end,
        sortBy: "Id",
        sortByDirection: "asc",
        filter: ` AND UserID = ${user.userId} AND CountryId = ${country}`,
        fieldList: "*",
        timeout: 0
      };

      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Price list Response:", response.data);
      setpriceList(response.data);
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
    fetchPriceLists(1, user.gridPageSize, user.activeCountryId);
  }, []);

  useEffect(() => {
    fetchCountryById();
  }, [selectedValue]);


  return (
    <>
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        {/* <FaHome className="text-blue-600" /> */}
        <span className="font-medium">
          Admin
        </span>
        /
        <span className="text-gray-500 font-medium">&nbsp;Country Settings</span>
      </nav>
      <div className="max-w-4xl mx-auto py-2">

        {/* Country dropdown */}
        <div className="flex justify-end mb-6">
          <select id="fruit-select" value={selectedValue} onChange={handleChange}
            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
            {countries.map((option: any) => (
              <option key={option.countryId} value={option.countryId}>
                {option.countryName}
              </option>
            ))}
          </select>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">

          {/* Language */}
          <div className="grid grid-cols-3 items-center">
            <label className="font-medium">Language:</label>
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

          </div>

          {/* Currency */}
          <div className="grid grid-cols-3 items-center">
            <label className="font-medium">Currency:</label>
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
          </div>

          {/* Number Formatting */}
          <div className="grid grid-cols-3 items-center">
            <label className="font-medium">Number Formatting:</label>
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
          </div>

          {/* Timezone */}
          <div className="grid grid-cols-3 items-center">
            <label className="font-medium">TimeZone:</label>
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
          </div>
        </div>

        {/* Other Section */}
        <h3 className="text-lg font-medium text-center underline my-8">Other</h3>

        {/* List Pricelist */}
        <div className="grid grid-cols-3 items-center mb-2">
          <label className="font-medium">List pricelist:</label>
          <div className="col-span-2 flex items-center gap-3">
            <span>{priceListHeader} - {priceListHeaderItems} items</span>
            <button className="text-sky-600 underline">Edit</button>
          </div>
        </div>

        {/* Restriction Checkbox */}
        <div className="grid grid-cols-3 items-center mb-8">
          <label className="font-medium">List Price Restriction:</label>
          <input
            type="checkbox"
            checked={listPriceRestriction}
            onChange={() => setListPriceRestriction(!listPriceRestriction)}
            className="h-4 w-4"
          />
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </>
  );
}
