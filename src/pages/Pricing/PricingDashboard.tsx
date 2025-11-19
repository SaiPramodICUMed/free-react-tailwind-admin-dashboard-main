import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";
import Calendar from "../Calendar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";

export default function PricingDashboard() {
  const user = useSelector((state: any) => state.user.users);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalPriceLists, setTotalPriceLists] = useState(0);

  // Animated counters
  const [animated, setAnimated] = useState({
    groups: 0,
    priceLists: 0,
  });

  // Animation helper
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

  // Fetch Group count
  const fetchGroupsCount = async () => {
    try {
      const payload = {
        viewName: `vw_BuyingGroups`,
        filter: `AND UserId = ${user.userId}`,
      };
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setTotalGroups(response.data.count);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching groups:", error.message);
      return null;
    }
  };

  // Fetch Price List count
  const fetchPriceListsCount = async () => {
    try {
      const payload = {
        viewName: `vw_PriceLists`,
        filter: `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`,
      };
      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getViewCount`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setTotalPriceLists(response.data.count);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching price lists:", error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchGroupsCount();
    fetchPriceListsCount();
  }, []);

  // Animate counts
  useEffect(() => {
    animateValue("groups", 0, totalGroups || 0, 1000);
    animateValue("priceLists", 0, totalPriceLists || 0, 1000);
  }, [totalGroups, totalPriceLists]);

  const tiles = [
    { label: "Accounts", to: "../pricingAccount", value: null },
    { label: "Groups", to: "../groupsData", value: animated.groups },
    // { label: "Price Lists", to: "../priceListsData", value: animated.priceLists },
    // { label: "ERP Load", to: "../completedTasks", value: null },
  ];

  return (
    <>
      <PageMeta
        title="Pricing Tool"
        description=""
      />
      <div className="space-y-6">
        {/* 🔹 Tiles Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tiles.map((tile, i) => (
            <Link
              key={i}
              to={tile.to}
              className="flex flex-col items-center justify-center h-[120px] rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                {/* Label */}
                <span className="text-sm font-semibold text-gray-800">{tile.label}</span>

                {/* Animated Count */}
                {tile.value !== null && (
                  <span className="text-green-500 font-extrabold text-lg leading-tight">
                    {tile.value.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 🔹 Calendar Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Renewals Calendar</h3>
          {/* <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6"> */}
            <Calendar />
          {/* </div> */}
        </div>
      </div>
    </>
  );
}
