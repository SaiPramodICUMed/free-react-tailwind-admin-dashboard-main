import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/loader";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";

export default function SegmentationGroup() {
  const user = useSelector((state: any) => state.user.users);
  const [account, setAccount] = useState(0);
  const [groups, setGroups] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animated, setAnimated] = useState({ account: 0, groups: 0 });

  const [inboxData, setInboxData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalRecords / user.gridPageSize)
  );

  const columns = [
    { header: "Group Name", accessor: "GroupName" },
    { header: "Group Segment", accessor: "SegmentName" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "Accounts", accessor: "AccountsCount" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Gross Margin", accessor: "GrossMargin" },
    { header: "GM %", accessor: "GMPercent" },
    { header: "Items Sold", accessor: "ItemsSold" },
  ];

  // 🔹 Helper: smooth number animation
  const animateValue = (key: string, start: number, end: number, duration: number) => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setAnimated((prev) => ({ ...prev, [key]: value }));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const fetchData = async (start: number, end: number, country: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_BuyingGroups",
        firstRow: start,
        lastRow: end,
        sortBy: "GroupName",
        sortByDirection: "asc",
        filter: ` AND countryID = ${country} AND UserId = ${user.userId}`,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setInboxData(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setLoading(false);
      return [];
    }
  };

  const fetchAccountsCount = async (country: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_AccountSales`,
        filter: `AND CountryID = ${country}`,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setAccount(response.data.count);
      setLoading(false);
      return response.data.count;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setLoading(false);
      return 0;
    }
  };

  const fetchGroupsCount = async (country: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_BuyingGroups`,
        filter: `AND CountryID = ${country} AND UserId = ${user.userId}`,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setGroups(response.data.count);
      setTotalRecords(response.data.count);
      setLoading(false);
      return response.data.count;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setLoading(false);
      return 0;
    }
  };

  // 🔹 Fetch initial data and animate
  useEffect(() => {
    const loadData = async () => {
      const acc = await fetchAccountsCount(selectedValue);
      const grp = await fetchGroupsCount(selectedValue);
      animateValue("account", 0, acc || 0, 1000);
      animateValue("groups", 0, grp || 0, 1000);
      fetchData(1, user.gridPageSize, selectedValue);
    };
    loadData();
  }, [selectedValue]);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const perPage = listPerPage || recordsPerPage;
    setCurrentPage(pageNumber);
    const start = pageNumber === 0 ? 1 : (pageNumber - 1) * perPage + 1;
    const end = pageNumber === 0 ? user.gridPageSize : pageNumber * perPage;
    fetchData(start, end, selectedValue);
  };

  const changeRecordsPerPage = (records: number) => {
    setRecordsPerPage(records);
    setTotalPages(Math.ceil(totalRecords / records));
    setPageChange(1, records);
  };

  // 🔹 Tile definitions
  const tiles = [
    { label: "Accounts", to: "../segmentation", value: animated.account },
    { label: "Groups", to: "../segmentationGroup", value: animated.groups },
  ];

  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Loader isLoad={loading} />
<nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span className="font-medium">Srategy</span> /
          <span className="text-gray-500 font-medium">&nbsp;Groups</span>
        </nav>
      {/* Clean animated tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
        {tiles.map((tile, index) => (
          <Link
            key={index}
            to={tile.to}
            className="flex flex-col items-center justify-center h-[100px] rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <span className="text-sm font-semibold text-gray-800">
              {tile.label}
            </span>
            <span className="text-green-500 font-extrabold text-lg leading-tight mt-1">
              {tile.value.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>

      {/* Table Section */}
      <div className="col-span-12">
        <BasicTables page="Segmentation-Groups" inboxData={inboxData} columns={columns} />
      </div>

      {/* Pagination Section */}
      <div className="col-span-12">
        {inboxData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setPageChange}
            onRecordsPerPageChange={(val) => changeRecordsPerPage(val)}
          />
        )}
      </div>
    </div>
  );
}
