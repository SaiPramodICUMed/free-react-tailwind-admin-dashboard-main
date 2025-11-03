import axios from "axios";
import {
  ArrowUpIcon,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function EcommerceMetrics({taskCount}: { taskCount: number }) {
  const user = useSelector((state: any) => state.user.users);
  const [completed, setCompleted] = useState({});
const [cancelled, setCancelled] = useState({});
const [trash, setTrash] = useState({});
const [all, setAll] = useState({});

  const fetchCompletedCount = async (arg:any) => {
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        filter: `AND (  1 <> 1  OR tab = '${arg}' )  AND tab = '${arg}'`,
      };
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("Task count API Response:", response.data);
      setCompleted(response.data);
      //dispatch(addTaskCount(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchCancelledCount = async (arg:any) => {
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        filter: `AND (  1 <> 1  OR tab = '${arg}' )  AND tab = '${arg}'`,
      };
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("Task count API Response:", response.data);
      setCancelled(response.data);
      //dispatch(addTaskCount(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchTrashCount = async (arg:any) => {
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        filter: `AND (  1 <> 1  OR tab = '${arg}' )  AND tab = '${arg}'`,
      };
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("Task count API Response:", response.data);
      setTrash(response.data);
      //dispatch(addTaskCount(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  const fetchAllCount = async (arg:any) => {
    try {
      const payload = {
        viewName: `dbo.Inbox_Tasks(${user.userId})`,
        filter: ` AND tab <> ${arg}`,
      };
      const response = await axios.post(
        `https://vm-www-dprice01.icumed.com:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } } // optional config
      );

      //console.log("Task count API Response:", response.data);
      setAll(response.data);
      //dispatch(addTaskCount(response.data));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      return null;
    }
  };

  useEffect(() => {
      fetchCompletedCount('Completed');
      fetchCancelledCount('Cancelled');
      fetchTrashCount('Trash');
      fetchAllCount('Inbox');
    }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
      {/* <!-- Metric Item 1 --> */}
      <Link
        to="../Home" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Inbox</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {taskCount.inbox}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 2 --> */}
      <Link
        to="../Drafts" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Drafts</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {taskCount.draft}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 3 --> */}
      <Link
        to="../InProgress" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">In Progress</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {taskCount.inProgress}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 4 --> */}
      <Link
        to="../AwaitingResults" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Awaiting Results</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {taskCount.awaitingResults}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 5 --> */}
      <Link
        to="../completed" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Completed</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {completed.count}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 6 --> */}
      <Link
        to="../cancelled" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Cancelled</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {cancelled.count}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 7 --> */}
      <Link
        to="../trash" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Trash</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {trash.count}
            </Badge>
          </div>
        </div>
      </Link>

      {/* <!-- Metric Item 8 --> */}
      <Link
        to="../all" // 👈 Navigate to your desired route
        className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
          {/* Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

          </div>

          {/* Text and Badge Section */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">All</h4>
              <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Count</h4>
            </div>
            <Badge color="success" className="text-xs px-1 py-0.5">
              <ArrowUpIcon className="size-3 mr-1" />
              {all.count}
            </Badge>
          </div>
        </div>
      </Link>


    </div>

  );
}
