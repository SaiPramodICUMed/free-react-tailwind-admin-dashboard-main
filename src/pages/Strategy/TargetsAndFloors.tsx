import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import BasicTables from "../Tables/BasicTables";
import Pagination from "../../components/Pagination";
import Loader from "../../components/loader";
import PageMeta from "../../components/common/PageMeta";

export default function TargetsAndFloors() {
  const [country, setCountry] = useState("Germany");
  const [view, setView] = useState("All");

  const user = useSelector((state: any) => state.user.users);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const [inboxData, setInboxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));

  const columns = [
    { header: "Item", accessor: "ItemName" },
    { header: "Description", accessor: "ItemDescription" },
    { header: "Super Franchise", accessor: "SuperFranchis" },
    { header: "Gross Sales", accessor: "GrossSales" },
    { header: "Gross Volume", accessor: "GrossVolume" },
    { header: "Gross ASP", accessor: "GrossASP" },
    { header: "GM %", accessor: "GM_P" },
    { header: "Manager Margin Floor", accessor: "ManagerMarginFloor" },
    { header: "Salesman Margin Floor", accessor: "SalesmanMarginFloor" },
    { header: "Seg Margin Floor", accessor: "SegManagerFloor" },
    { header: "Seg Salesman Floor", accessor: "SegSalesmanFloor" },
    { header: "Seg Target Price", accessor: "SegTargetPrice" },
  ];

  const Newcolumns = [
    { header: "Item", accessor: "ItemName" },
    { header: "Description", accessor: "ItemDescription" },
    { header: "Super Franchise", accessor: "SuperFranchis" },
    { header: "Gross Sales", accessor: "GrossSales" },
    { header: "GPH1", accessor: "GPH1" },
    { header: "GPH2", accessor: "GPH2" },
    { header: "GPH3", accessor: "GPH3" },
    { header: "GPH4", accessor: "GPH4" },
    { header: "Gross Volume", accessor: "GrossVolume" },
    { header: "Gross ASP", accessor: "GrossASP" },
    { header: "GM %", accessor: "GM_P" },
    { header: "Manager Margin Floor", accessor: "ManagerMarginFloor" },
    { header: "Salesman Margin Floor", accessor: "SalesmanMarginFloor" },
    { header: "Seg Margin Floor", accessor: "SegManagerFloor" },
    { header: "Seg Salesman Floor", accessor: "SegSalesmanFloor" },
    { header: "Seg Target Price", accessor: "SegTargetPrice" },
  ];

  const [activeColumnList, setActiveColumnList] = useState(columns);
  const [isGPHVisible, setIsGPHVisible] = useState(false);

  const ShowGPH = () => {
    setIsGPHVisible((v) => !v);
    setActiveColumnList((v) => (isGPHVisible ? columns : Newcolumns));
  };

  const setPageChange = (pageNumber: number, listPerPage?: number) => {
    const noOfrecordsPerPage = listPerPage ?? recordsPerPage;
    setCurrentPage(pageNumber);
    const start = pageNumber === 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    const end = pageNumber === 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    fetchData(start, end, user.activeCountryId);
  };

  const changeRecordsPerPage = (count: number) => {
    setRecordsPerPage(count);
    setTotalPages(Math.ceil(totalRecords / count));
    setPageChange(1, count);
  };

  const fetchData = async (start: number, end: number, countryId: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: "vw_TargetData",
        firstRow: start,
        lastRow: end,
        sortBy: "ItemID",
        sortByDirection: "asc",
        filter: ` AND Isreference = 1  AND CountryID = ${countryId}`,
        fieldList: "*",
        timeout: 0,
      };
      const response = await axios.post(`https://10.2.6.130:5000/api/Metadata/getData`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setInboxData(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCount = async (countryId: number) => {
    setLoading(true);
    try {
      const payload = {
        viewName: `vw_TargetData`,
        filter: `AND Isreference = 1  AND CountryID = ${countryId}`,
      };
      const response = await axios.post(`https://10.2.6.130:5000/api/Metadata/getViewCount`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setTotalRecords(response.data.count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount(user.activeCountryId);
    fetchData(1, user.gridPageSize, user.activeCountryId);
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / recordsPerPage));
  }, [recordsPerPage, totalRecords]);

  useEffect(() => {
    fetchData(1, user.gridPageSize, selectedValue);
    fetchCount(selectedValue);
  }, [selectedValue]);

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  return (
  <div className="bg-white p-6">
      <Loader isLoad={loading} />
      <PageMeta
        title="Pricing Tool"
        description=""
      />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          {/* <FaHome className="text-blue-600" /> */}
          <span className="font-medium">
            Strategy
          </span>
          {/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          {/* <span className="font-medium hover:text-blue-700 cursor-pointer">Inbox</span> */}
          /{/* <FaChevronRight className="text-gray-400 text-xs" /> */}
          <span className="text-gray-500 font-medium">&nbsp;Targets and Floors</span>
        </nav>

        <div className=" top-0 right-0">          
          <select id="fruit-select" value={selectedValue} onChange={handleChange}
            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
            {countries?.map((option: any) => (
              <option key={option.countryId} value={option.countryId}>
                {option.countryName}
              </option>
            ))}
          </select>
        </div>

        {/* <h2 className="text-xl font-semibold text-blue-700">User Details</h2> */}

      </div>


      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
         <div className=" top-0 right-0">          
          <button className="bg-[#0f59ac] hover:bg-blue-500 text-white font-medium py-1 px-3 rounded text-sm mr-5" onClick={handleChange}>View History</button>
          <button className={`font-medium py-1 px-5 rounded text-sm mr-5 bg-[#0f59ac] text-white`} onClick={ShowGPH}> {!isGPHVisible?"Show GPH":"Hide GPH"}</button>
        </div>

        <div className=" top-0 right-0">          
          <select id="select-role" value={selectedValue} onChange={handleChange}
            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
            {/* {countries?.map((option: any) => ( */}
              <option key="all" value="all">
                All
              </option>
              <option key="Salesmans" value="Salesmans">
                Salesmans
              </option>
              <option key="Managers" value="Managers">
                Managers
              </option>
            {/* ))} */}
          </select>
        </div>
        {/* <h2 className="text-xl font-semibold text-blue-700">User Details</h2> */}
        

      </div>



      {/* Responsive Table inside the same container */}
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-12">
              <BasicTables page="Segmentation-Targets and Floors" inboxData={inboxData} columns={activeColumnList} />
            </div>  
            
     {/* Pagination */}
      <div className="col-span-12">
        {inboxData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setPageChange}
            onRecordsPerPageChange={(val: number) => changeRecordsPerPage(val)}
          />
        )}
      </div>
    </div>
    </div>
  );
}
