import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";

import BasicTables from "../Tables/BasicTables";

export default function GroupsData() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  //const [totalRecords, setTotalRecords] = useState(1);
  const [loading, setLoading] = useState(false);
  const columns = [
    { header: "Group Name", accessor: "GroupName" },
    { header: "Party Number", accessor: "PartyNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Accounts", accessor: "AccountsCount" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Country", accessor: "CountryName" },
  ];

  const fetchData = async (start: number, end: number) => {
    setLoading(true);
    //console.log(arg);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: "vw_BuyingGroups",
        firstRow: start,
        lastRow: end,
        sortBy: "GroupName",
        sortByDirection: "asc",
        filter: `AND UserId = ${user.userId}`,
        fieldList: "*",
        timeout: 0
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

  const fetchCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_BuyingGroups`,
        filter: `AND UserId = ${user.userId}`
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      //setTotalRecords(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCount();
    fetchData(1, user.gridPageSize);
  }, []);


  return (
    <>
    <Loader isLoad={loading} />
      
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        
        <div className="col-span-12 mt-8">
          <BasicTables page={'Pricing - Groups'} inboxData={inboxData} columns={columns} />
        </div>
      </div>
    </>

  );
}
