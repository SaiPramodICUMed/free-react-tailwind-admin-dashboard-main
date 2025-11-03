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

export default function AccountsData() {
  const user = useSelector((state: any) => state.user.users);
  const [account, setAccount] = useState();
  const [site, setSite] = useState();
  const [loading, setLoading] = useState(false);

  const fetchAccountsCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_Accounts`,
        filter: `AND UserId = ${user.userId}`
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
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchSitesCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `vw_Sites`,
        filter: `AND UserId = ${user.userId}`
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setSite(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };
  useEffect(() => {
    fetchAccountsCount();
    fetchSitesCount();
  }, []);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
      <Loader isLoad={loading} />
      {/* <!-- Metric Item 1 --> */}
      <Link
        to="../pricingAccount" // 👈 Navigate to your desired route
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
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Account</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {account}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 2 --> */}
      <Link
        to="../pricingSite" // 👈 Navigate to your desired route
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
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Site</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {site}
            </Badge>
          </div>
        </div>
      </Link>
      <div className="p-3  md:p-4">
      </div>
      <div className="flex items-center gap-5 mt-25 ml-10">
        <Button size="sm" variant="primary">
          Create New Customer
        </Button>
      </div>
    </div>

  );
}
