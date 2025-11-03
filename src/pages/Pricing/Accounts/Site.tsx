import axios from "axios";
import PageMeta from "../../../components/common/PageMeta";
import BasicTables from "../../Tables/BasicTables";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../../../components/loader";
import AccountsData from "../AccountsData";

export default function Site() {
  const user = useSelector((state: any) => state.user.users);
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const columns = [
    { header: "Site use Code", accessor: "SiteUseCode" },
    { header: "Site Number", accessor: "PartySiteNumber" },
    { header: "Account Number", accessor: "AccountNumber" },
    { header: "Customer Segment", accessor: "SegmentName" },
    { header: "Customer Type", accessor: "Type" },
    { header: "Corporate Name", accessor: "ParentCompany" },
    { header: "Address", accessor: "Address1" },
    { header: "Postal Code", accessor: "PostalCode" },
    { header: "City", accessor: "SiteCity" },
    { header: "Province", accessor: "Province" },
    { header: "1 YR Sales", accessor: "YRSales" },
    { header: "Country", accessor: "CountryName" },
  ];

 const fetchData = async (start: number, end: number) => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: "vw_Sites",
        firstRow: start,
        lastRow: end,
        sortBy: "AccountName",
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

  useEffect(() => {
    fetchData(1, user.gridPageSize);
  }, []);

  return (
    <>
    <Loader isLoad={loading} />
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-6 gap-4 md:gap-3">
        <div className="col-span-6 space-y-6 xl:col-span-7">
          <AccountsData/>
        </div>
        <div className="col-span-12 mt-8">
          <BasicTables page={'Pricing - Site'} inboxData={inboxData} columns={columns} />
        </div>


      </div>
    </>
  );
}
