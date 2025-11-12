import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function EcommerceMetrics({ taskCount }: { taskCount: any }) {
  const user = useSelector((state: any) => state.user.users);

  // State for fetched counts
  const [counts, setCounts] = useState({
    completed: 0,
    cancelled: 0,
    trash: 0,
    all: 0,
  });

  // State for animated values
  const [animated, setAnimated] = useState({
    inbox: 0,
    draft: 0,
    inProgress: 0,
    awaitingResults: 0,
    completed: 0,
    cancelled: 0,
    trash: 0,
    all: 0,
  });

  // --- API Fetchers for Counts ---
  const fetchCount = async (tab: string, isAll: boolean = false) => {
    try {
      const payload = isAll
        ? {
            viewName: `dbo.Inbox_Tasks(${user.userId})`,
            filter: `AND tab <> 'Inbox'`,
          }
        : {
            viewName: `dbo.Inbox_Tasks(${user.userId})`,
            filter: `AND (1 <> 1 OR tab = '${tab}') AND tab = '${tab}'`,
          };

      const url = `https://10.2.6.130:5000/api/Metadata/getViewCount`;
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data?.count || 0;
    } catch (error: any) {
      console.error(`Error fetching ${tab} count:`, error.message);
      return 0;
    }
  };

  // --- Animate Helper ---
  const animateValue = (
    key: string,
    start: number,
    end: number,
    duration: number
  ) => {
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

  // --- Fetch Counts on Mount ---
  useEffect(() => {
    const loadCounts = async () => {
      const completed = await fetchCount("Completed");
      const cancelled = await fetchCount("Cancelled");
      const trash = await fetchCount("Trash");
      const all = await fetchCount("All", true);
      setCounts({ completed, cancelled, trash, all });
    };
    loadCounts();
  }, [user.userId]);

  // --- Animate when taskCount or fetched counts change ---
  useEffect(() => {
    if (!taskCount) return;

    const mergedCounts = {
      inbox: taskCount.inbox || 0,
      draft: taskCount.draft || 0,
      inProgress: taskCount.inProgress || 0,
      awaitingResults: taskCount.awaitingResults || 0,
      completed: counts.completed || taskCount.completed || 0,
      cancelled: counts.cancelled || taskCount.cancelled || 0,
      trash: counts.trash || taskCount.trash || 0,
      all: counts.all || taskCount.all || 0,
    };

    Object.entries(mergedCounts).forEach(([key, value]) =>
      animateValue(key, 0, value, 1000)
    );
  }, [taskCount, counts]);

  // --- Tile Configuration ---
  const tiles = [
    { label: "Inbox", icon: "inbox.svg", to: "../Home", value: animated.inbox },
    { label: "Drafts", icon: "drafts.svg", to: "../Drafts", value: animated.draft },
    { label: "In Progress", icon: "in_process.svg", to: "../InProgress", value: animated.inProgress },
    { label: "Awaiting Results", icon: "awaiting_results.svg", to: "../AwaitingResults", value: animated.awaitingResults },
    { label: "Completed", icon: "completed.svg", to: "../completed", value: animated.completed },
    { label: "Cancelled", icon: "cancel.svg", to: "../cancelled", value: animated.cancelled },
    { label: "Trash", icon: "trash.svg", to: "../trash", value: animated.trash },
    { label: "All", icon: "all.svg", to: "../all", value: animated.all },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
      {tiles.map((tile, i) => (
        <Link
          key={i}
          to={tile.to}
          className="flex flex-col items-center justify-center h-[120px] rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            {/* Icon */}
            <img
              src={`/images/icons/${tile.icon}`}
              alt={tile.label}
              className="w-10 h-10"
            />
            {/* Label */}
            <span className="text-sm font-semibold text-gray-800 mt-1">
              {tile.label}
            </span>
            {/* Animated Count */}
            <span className="text-green-500 font-extrabold text-lg leading-tight">
              {tile.value.toLocaleString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
