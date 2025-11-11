import axios from "axios";
import {
    ArrowUpIcon,
    GroupIcon,
} from "../../icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Badge from "../../components/ui/badge/Badge";
import Loader from "../../components/loader";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";

export default function All() {
    const user = useSelector((state: any) => state.user.users);
    const [account, setAccount] = useState();
    const [groups, setGroups] = useState();
    const [loading, setLoading] = useState(false);

    const countries: [] = useSelector((state: any) => state.user.countries);
  const [inboxData, setInboxData] = useState([]);
  const [summaryData, setSummaryData] = useState<any>({});
  const [chartData, setChartData] = useState<any>([]);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const [selectedGrossValue, setGrossSelectedValue] = useState('Gross Sales');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );

  const columns = [
    { header: "Customer Name", accessor: "CustomerName" },
    { header: "Customer Segment", accessor: "Segment" },
    { header: "Customer Number", accessor: "CustomerNumber" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "City", accessor: "City" },
    { header: "Cus Type", accessor: "Type" },
    { header: "Cus Sub Type", accessor: "SubType" },
    { header: "Gross Sales", accessor: "GrossSales" },
    { header: "Gross Margin", accessor: "GM" },
    { header: "GM %", accessor: "GMPerc" },
    { header: "Items Sold", accessor: "ItemsSold" },
  ];

  const setPageChange = (pageNumber: any, listPerPage?: any) => {
    const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage;
    setCurrentPage(pageNumber);
    let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    let end =
      pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    console.log(start, end);
    fetchData(start, end, selectedValue);
  };

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const handleGrossChange = (event: any) => {
    setGrossSelectedValue(event.target.value);
  };

  const changeRecordsPerPage = (recordsPerPage: any) => {
    console.log("on count change", recordsPerPage);
    setRecordsPerPage(recordsPerPage);
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
    setPageChange(1, recordsPerPage);
  };

  const fetchData = async (start: number, end: number, country: number) => {
    //console.log(arg);
    //setActiveTab(arg);
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_AccountSales",
        firstRow: start,
        lastRow: end,
        sortBy: "CustomerName",
        sortByDirection: "asc",
        filter: `AND CountryID = ${country}`,
        fieldList: "*",
        timeout: 0,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("API Response:", response.data);
      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };


    const fetchAccountsCount = async (country: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_AccountSales`,
        filter: `AND CountryID = ${country}`,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setAccount(response.data.count);
      setLoading(false);
      setTotalRecords(response.data.count);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchSummaryData = async (country:number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        segmentType: 1,
        userId: user.userId,
        selectedCountryId: country,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/getSummaryData`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Summary Data:", response.data[0]);
      setSummaryData(response.data[0]);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchChartData = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        segmentType: 1,
        valueType: 'gross',
        userId: user.userId,
        selectedCountryId: selectedValue,
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Strategy/getSummaryDataForSegments`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      console.log("Chart Data:", response.data);
      setChartData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchGroupsCount = async (country: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_BuyingGroups`,
        filter: `AND CountryID = ${country} AND UserId = ${user.userId}`
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setGroups(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
        fetchAccountsCount(selectedValue);
(user.activeCountryId);
    fetchSummaryData(user.activeCountryId);
    fetchData(1, user.gridPageSize, user.activeCountryId);
    fetchChartData();
  }, []);
  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  useEffect(() => {
    fetchData(1, user.gridPageSize, selectedValue);
    fetchGroupsCount(selectedValue)
    fetchAccountsCount(selectedValue);
    fetchChartData();
    fetchSummaryData(selectedValue);
  }, [selectedValue]);


    
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <Loader isLoad={loading} />
            {/* <!-- Metric Item 1 --> */}
            <Link
                to="../emailAll" // 👈 Navigate to your desired route
                className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
            >
                <div className="rounded-xl bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                        <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                    </div>

                    {/* Text and Badge Section */}
                    <div className="flex items-end justify-between mt-3 min-w-0">
                        <div className="min-w-0">
                            <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                All
                            </h4>
                        </div>

                        <Badge
                            color="success"
                            size="sm"
                            className="flex-shrink-0 text-xs px-1.5 py-0.5"
                        >
                            <ArrowUpIcon className="size-3 mr-1 flex-shrink-0" />
                            {/* <span className="truncate max-w-[50px] inline-block">{account}</span> */}
                        </Badge>
                    </div>

                </div>
            </Link>

            {/* <!-- Metric Item 2 --> */}
            <Link
                to="../unread" // 👈 Navigate to your desired route
                className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
            >
                <div className="rounded-xl bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                        <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                    </div>

                    {/* Text and Badge Section */}


                    <div className="flex items-end justify-between mt-3 min-w-0">
                        <div className="min-w-0">
                            <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                Unread
                            </h4>
                        </div>

                        <Badge
                            color="success"
                            size="sm"
                            className="flex-shrink-0 text-xs px-1.5 py-0.5"
                        >
                            <ArrowUpIcon className="size-3 mr-1 flex-shrink-0" />
                            {/* <span className="truncate max-w-[50px] inline-block">{groups}</span> */}
                        </Badge>
                    </div>

                </div>
            </Link>

            <Link
                to="../archive" // 👈 Navigate to your desired route
                className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
            >
                <div className="rounded-xl bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                        <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                    </div>

                    {/* Text and Badge Section */}


                    <div className="flex items-end justify-between mt-3 min-w-0">
                        <div className="min-w-0">
                            <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                Archive
                            </h4>
                        </div>

                        <Badge
                            color="success"
                            size="sm"
                            className="flex-shrink-0 text-xs px-1.5 py-0.5"
                        >
                            <ArrowUpIcon className="size-3 mr-1 flex-shrink-0" />
                            {/* <span className="truncate max-w-[50px] inline-block">{groups}</span> */}
                        </Badge>
                    </div>

                </div>
            </Link>

            <div className="p-3  md:p-4">
            </div>
            
            <div className="col-span-12 mt-8">
          <BasicTables page={'Email -All '}  />
        </div>
        {/* <div className="col-span-12 mt-8">
  {inboxData.length > 0 &&(
 <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          onPageChange={setPageChange}
          onRecordsPerPageChange={(val) => {
            changeRecordsPerPage(val);
            //setPageChange(1); // reset to first page on change
          }}
        />)}
        </div> */}
            
        </div>

        

    );

}