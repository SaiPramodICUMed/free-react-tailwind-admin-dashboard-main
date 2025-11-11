import React, { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
//import Pagination from "../../components/PageNation";
import axios from "axios";
import Loader from "../../components/loader";
//import { useSelector } from "react-redux";
import { useSelector } from "react-redux";
import BasicTables from "../Tables/BasicTables";

const Competitors: React.FC = () => {
    const user = useSelector((state: any) => state.user.users);
    //const user = useSelector((state: any) => state.user.users);
    const [inboxData, setInboxData] = useState([]);
    const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
    const countries: [] = useSelector((state: any) => state.user.countries);
    const [loading, setLoading] = useState(false);
    //   const [currentPage, setCurrentPage] = useState(1);
    //   const [totalRecords, setTotalRecords] = useState(1);
    //   const [recordsPerPage, setRecordsPerPage] = useState(user.gridPageSize);
    //   const [totalPages, setTotalPages] = useState(Math.ceil(totalRecords / user.gridPageSize));
    const columns = [
        { header: "Competitor Name", accessor: "CompetitorName" },
        { header: "Total Records", accessor: "DataEntries" },
        { header: "Actions", accessor: "actions" },
    ];

    //   const setPageChange = (pageNumber: any, listPerPage?: any) => {
    //     const noOfrecordsPerPage = listPerPage ? listPerPage : recordsPerPage
    //     setCurrentPage(pageNumber);
    //     let start = pageNumber == 0 ? 1 : (pageNumber - 1) * noOfrecordsPerPage + 1;
    //     let end =
    //       pageNumber == 0 ? user.gridPageSize : pageNumber * noOfrecordsPerPage;
    //     console.log(start, end);
    //     fetchData(start, end);
    //   };

    //   const changeRecordsPerPage = (recordsPerPage: any) => {
    //     console.log("on count change", recordsPerPage);
    //     setRecordsPerPage(recordsPerPage);
    //     setTotalPages(Math.ceil(totalRecords / recordsPerPage))
    //     setPageChange(1, recordsPerPage);
    //   };
    const handleChange = (event: any) => {
        setSelectedValue(event.target.value);
    };
    const fetchData = async (country: number) => {
        //console.log(arg);
        //setActiveTab(arg);
        setLoading(true);
        try {
            const payload = {
                viewName: `vw_Competitors`,
                sortBy: "SortOrder ASC, CompetitorName ASC",
                sortByDirection: "",
                filter: `AND CountryID = ${country}`,
                fieldList: "*",
                timeout: 0
            };
            console.log("payload", payload);
            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getDataNoPaging`,
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



    useEffect(() => {
        fetchData(user.activeCountryId);
    }, []);

    useEffect(() => {
        fetchData(selectedValue);
    }, [selectedValue]);

    return (
        <div className="bg-white p-6">
            <Loader isLoad={loading} />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    {/* <FaHome className="text-blue-600" /> */}
                    <span className="font-medium">
                        Strategy
                    </span>
                    {/* <FaChevronRight className="text-gray-400 text-xs" /> */}
                    {/* <span className="font-medium hover:text-blue-700 cursor-pointer">Inbox</span> */}
                    /{/* <FaChevronRight className="text-gray-400 text-xs" /> */}
                    <span className="text-gray-500 font-medium">&nbsp;Competitors</span>
                </nav>

                {/* <h2 className="text-xl font-semibold text-blue-700">User Details</h2> */}
                <div className=" top-0 right-0">
                    <select id="fruit-select" value={selectedValue} onChange={handleChange}
                        className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
                        {countries.map((option: any) => (
                            <option key={option.countryId} value={option.countryId}>
                                {option.countryName}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
            {/* Responsive Table inside the same container */}
            <div className="w-full">
                          <BasicTables page="Segmentation-Competitors" inboxData={inboxData} columns={columns} />
                        </div>  
            {/* {inboxData?.length !== 0 && (
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
        />
      )} */}
        </div>
    );
};

export default Competitors;
