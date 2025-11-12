import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";

export default function ERPLOadData() {
  const user = useSelector((state: any) => state.user.users);
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({
    completed: 0,
    awaiting: 0,
    manual: 0,
    expire: 0,
    recent: 0,
  });

  const [animated, setAnimated] = useState({
    completed: 0,
    awaiting: 0,
    manual: 0,
    expire: 0,
    recent: 0,
  });

  // 🔹 Helper to animate count
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

  // 🔹 Unified fetch function
  const fetchCount = async (type: string, id: number) => {
    try {
      const payload = { viewName: `dbo.GetLoadTasks(${user.userId}, ${id})`, filter: "" };
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.count;
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error.message);
      return 0;
    }
  };

  // 🔹 Fetch all counts
  const fetchAllCounts = async () => {
    setLoading(true);
    const [completed, awaiting, manual, expire, recent] = await Promise.all([
      fetchCount("completed", 1),
      fetchCount("awaiting", 2),
      fetchCount("manual", 3),
      fetchCount("expire", 4),
      fetchCount("recent", 5),
    ]);
    setCounts({ completed, awaiting, manual, expire, recent });
    setLoading(false);
  };

  // 🔹 Fetch on load
  useEffect(() => {
    fetchAllCounts();
  }, []);

  // 🔹 Animate values on change
  useEffect(() => {
    animateValue("completed", 0, counts.completed || 0, 1000);
    animateValue("awaiting", 0, counts.awaiting || 0, 1000);
    animateValue("manual", 0, counts.manual || 0, 1000);
    animateValue("expire", 0, counts.expire || 0, 1000);
    animateValue("recent", 0, counts.recent || 0, 1000);
  }, [counts]);

  const tiles = [
    { label: "Completed Tasks", to: "../completedTasks", value: animated.completed },
    { label: "Awaiting Load", to: "../awaitingLoad", value: animated.awaiting },
    { label: "Manually Updating", to: "../manuallyUpdating", value: animated.manual },
    { label: "Letting Expire", to: "../lettingExpire", value: animated.expire },
    { label: "Recently Loaded", to: "../recentlyLoaded", value: animated.recent },
  ];

  return (
    <div className="space-y-4">
      <Loader isLoad={loading} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {tiles.map((tile, i) => (
          <Link
            key={i}
            to={tile.to}
            className="flex flex-col items-center justify-center h-[100px] rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              {/* Label */}
              <span className="text-sm font-medium text-gray-800">{tile.label}</span>

              {/* Animated Count */}
              <span className="text-green-600 font-bold text-lg leading-tight">
                {tile.value.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
