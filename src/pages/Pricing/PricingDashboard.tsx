import PageMeta from "../../components/common/PageMeta";
import {
    ArrowUpIcon,
    GroupIcon,
} from "../../icons";
import { Link } from "react-router-dom";
import Calendar from "../Calendar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import Badge from "../../components/ui/badge/Badge";

export default function PricingDashboard() {
    const user = useSelector((state: any) => state.user.users);
    const [totalRecords, setTotalRecords] = useState();
    const [totalPriceListsRecords, setTotalPriceListsRecords] = useState();
    const fetchGroupsCount = async () => {
        //console.log(arg);
        //setLoading(true);
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
            setTotalRecords(response.data.count);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };
    const fetchPriceListsCount = async () => {
        //console.log(arg);
        //setLoading(true);
        //setActiveTab(arg);
        try {
            const payload = {
                viewName: `vw_PriceLists`,
                filter: `AND UserId = ${user.userId} AND (LastYearSales IS NOT NULL AND LastYearSales <> 0)`
            };

            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Metadata/getViewCount`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            //console.log("All", response.data);
            setTotalPriceListsRecords(response.data.count);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };
    useEffect(() => {
        fetchGroupsCount();
        fetchPriceListsCount();
    }, []);

    return (
        <>
            <PageMeta
                title="Pricing Tool Application"
                description="Pricing Tool Application"
            />
            <div className="grid grid-cols-6 gap-4 md:gap-3">
                <div className="col-span-6 space-y-6 xl:col-span-7">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                        {/* <!-- Metric Item 1 --> */}
                        <Link
                            to="../pricingAccount" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                                </div>

                                {/* Text and Badge Section */}
                                <div className="flex items-end justify-between mt-3">
                                    <div>
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Accounts</h4>
                                    </div>

                                </div>
                            </div>
                        </Link>

                        {/* <!-- Metric Item 2 --> */}
                        <Link
                            to="../groupsData" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                                </div>

                                {/* Text and Badge Section */}
                                <div className="flex items-end justify-between mt-3 min-w-0">
                                    <div className="min-w-0">
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                            Groups
                                        </h4>
                                    </div>

                                    <Badge
                                        color="success"
                                        size="sm"
                                        className="flex-shrink-0 text-xs px-1.5 py-0.5"
                                    >
                                        <ArrowUpIcon className="size-3 mr-1 flex-shrink-0" />
                                        <span className="truncate max-w-[50px] inline-block">{totalRecords}</span>
                                    </Badge>
                                </div>


                            </div>
                        </Link>

                        {/* <!-- Metric Item 3 --> */}
                        <Link
                            to="../priceListsData" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
             dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
             transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />

                                </div>

                                {/* Text and Badge Section */}


                                <div className="flex items-end justify-between mt-3 min-w-0">
                                    <div className="min-w-0">
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                            Price Lists
                                        </h4>
                                    </div>

                                    <Badge
                                        color="success"
                                        size="sm"
                                        className="flex-shrink-0 text-xs px-1.5 py-0.5"
                                    >
                                        <ArrowUpIcon className="size-3 mr-1 flex-shrink-0" />
                                        <span className="truncate max-w-[50px] inline-block">{totalPriceListsRecords}</span>
                                    </Badge>
                                </div>

                            </div>
                        </Link>

                        {/* <!-- Metric Item 4 --> */}
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
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">ERP Load</h4>
                                    </div>

                                </div>
                            </div>
                        </Link>

                        {/* <!-- Metric Item 5 --> */}

                    </div>
                </div>
                <div className="col-span-12 mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Renewals Calendar
                    </h3>
                    <Calendar />
                </div>
            </div>
        </>
    );
}
