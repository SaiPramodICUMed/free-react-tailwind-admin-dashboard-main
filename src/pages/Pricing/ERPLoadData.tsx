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

export default function ERPLOadData() {
  const user = useSelector((state: any) => state.user.users);
  const [completedTasks, setCompletedTasks] = useState();
  const [awaitingLoad, setAwaitingLoad] = useState();
  const [manuallyUpdating, setManuallyUpdating] = useState();
  const [lettingExpire, setLettingExpire] = useState();
  const [recentlyLoaded, setRecentlyLoaded] = useState();
  const [loading, setLoading] = useState(false);

  const fetchCompletedTasksCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 1)`,
        filter: ``
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setCompletedTasks(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchawaitingLoadCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 2)`,
        filter: ` AND (  1 <> 1  OR LoadStatus = 2 ) `
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setAwaitingLoad(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };
 
  const fetchManuallyUpdatingCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 3)`,
        filter: ` AND (  1 <> 1  OR LoadStatus = 3 ) `
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setManuallyUpdating(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchLettingExpireCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 4)`,
        filter: ` AND (  1 <> 1  OR LoadStatus = 4 ) `
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setLettingExpire(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchRecentlyLoadedCount = async () => {
    //console.log(arg);
    setLoading(true);
    //setActiveTab(arg);
    try {
      const payload = {
        viewName: `dbo.GetLoadTasks(${user.userId}, 5)`,
        filter: ` AND (  1 <> 1  OR LoadStatus = 5 ) `
      };

      // 👈 second argument is the body (data)
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("All", response.data);
      setRecentlyLoaded(response.data.count);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCompletedTasksCount();
    fetchawaitingLoadCount();
    fetchManuallyUpdatingCount();
    fetchLettingExpireCount();
    fetchRecentlyLoadedCount();
  }, []);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <Loader isLoad={loading} />
      {/* <!-- Metric Item 1 --> */}
      <Link
        to="../completedTasks" // 👈 Navigate to your desired route
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
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Completed Tasks</h4>
              {/* <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4> */}
              <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1 mt-5" />
              {completedTasks}
            </Badge>
            </div>
            
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 2 --> */}
      <Link
        to="../awaitingLoad" // 👈 Navigate to your desired route
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
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Awaiting Load</h4>
              {/* <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4> */}
              <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1 mt-5" />
              {awaitingLoad}
            </Badge>
            </div>
            
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 3 --> */}
      <Link
        to="../manuallyUpdating" // 👈 Navigate to your desired route
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
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Manually Updating</h4>
              {/* <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4> */}
              <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1 mt-5" />
              {manuallyUpdating}
            </Badge>
            </div>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 4 --> */}
      <Link
        to="../lettingExpire" // 👈 Navigate to your desired route
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
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Letting Expire</h4>
              {/* <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4> */}
              <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1 mt-5" />
              {lettingExpire}
            </Badge>
            </div>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 5 --> */}
      <Link
        to="../recentlyLoaded" // 👈 Navigate to your desired route
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
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Recently Loaded</h4>
              {/* <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4> */}
             <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1 mt-5" />
              {recentlyLoaded}
            </Badge>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3  md:p-4">
      </div>
      {/* <div className="flex items-center gap-5 mt-25 ml-10">
        <Button size="sm" variant="primary">
          Create New Customer
        </Button>
      </div> */}
    </div>

  );
}
