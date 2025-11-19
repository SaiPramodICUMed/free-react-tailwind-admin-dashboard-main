import PageMeta from "../../components/common/PageMeta";
import {
    GroupIcon,
} from "../../icons";
import { Link } from "react-router-dom";
import { TrendingUp, DownloadCloud , Clock } from 'lucide-react';


export default function Currency() {
    
    return (
        <>
            <PageMeta
                title="Pricing Tool Application"
                description="Pricing Tool Application"
            />
            <div className="grid grid-cols-6 gap-4 md:gap-3">
                <div className="col-span-6 space-y-6 xl:col-span-7">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">

                        <Link
                            to="/currentCurrency" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
                            dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
                            transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <TrendingUp className="text-gray-800 size-5 dark:text-white/90" />
                                </div>
                                {/* Text Section */}
                                <div className="flex items-end justify-between mt-3">
                                    <div>
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90">Current Exchange Rates</h4>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/currencyHistory" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
                            dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
                            transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <Clock className="text-gray-800 size-5 dark:text-white/90" />
                                </div>
                                {/* Text Section */}
                                <div className="flex items-end justify-between mt-3 min-w-0">
                                    <div className="min-w-0">
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                            Currency Exchange Rates History
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/updateCurrency" // 👈 Navigate to your desired route
                            className="block rounded-xl border border-gray-200 bg-white p-3 
                            dark:border-gray-800 dark:bg-gray-900 hover:shadow-md hover:scale-[1.02]
                            transition-all duration-200 text-gray-800 dark:text-gray-100"
                        >
                            <div className="rounded-xl  bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] md:p-4">
                                {/* Icon Container */}
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    <DownloadCloud className="text-gray-800 size-5 dark:text-white/90" />

                                </div>
                                {/* Text Section */}
                                <div className="flex items-end justify-between mt-3 min-w-0">
                                    <div className="min-w-0">
                                        <h4 className="mt-1 font-semibold text-gray-800 text-sm dark:text-white/90 truncate">
                                            Import/Update
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
