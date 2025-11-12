import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
type ItemsSelection = "blank" | "advanced";

type Props = {
    taskName?: string;
    dataPeriod?: string;
    taskType?: string;
    customerSegment?: string;
    currency?: string;
    priceListType?: string;
    itemsSelection?: ItemsSelection;
    customerName?: string;
    onBack?: () => void;
    onConfirm?: () => void;
    onClose?: () => void;
    // If you want it controlled, you can provide change handlers:
    onChangeDataPeriod?: (v: string) => void;
    onChangeTaskType?: (v: string) => void;
    onChangeCurrency?: (v: string) => void;
    onChangePriceListType?: (v: string) => void;
    onChangeItemsSelection?: (v: ItemsSelection) => void;
    className?: string;
    /**
     * Optional breakpoints override (in pixels). If not provided,
     * component uses default mobile breakpoint of 760px.
     */
    mobileBreakpoint?: number;
};

const NewCustomer: React.FC<Props> = ({
    dataPeriod = "1 year",
    taskType = "Quote/Offer",
    customerSegment = "high potential customer",
    currency = "",
    priceListType = "",
    itemsSelection = "blank",
    onBack,
    onConfirm,
    onClose,
    onChangeDataPeriod,
    onChangeTaskType,
    onChangeCurrency,
    onChangePriceListType,
    onChangeItemsSelection,
    className,
    mobileBreakpoint = 760,
}) => {
    // responsive state based on window width (kept for optional logic if needed)
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth <= mobileBreakpoint;
    });
    const user = useSelector((state: any) => state.user.users);
    const [taskTypes, setTaskTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [priceListTypes, setPriceListTypes] = useState([]);
    const [segments, setSegments] = useState([]);
    const [nextTaskNumber, setNextTaskNumber] = useState({});
    const selected = useSelector((state: any) => state.user.selectedRecords);
    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
  const countries: [] = useSelector((state: any) => state.user.countries);
  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };
  const handleSegmentChange = (event: any) => {
    setSegments(event.target.value);
  };
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= mobileBreakpoint);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [mobileBreakpoint]);

    const handleSelectChange =
        (cb?: (v: string) => void) =>
            (e: React.ChangeEvent<HTMLSelectElement>) => {
                cb && cb(e.target.value);
            };

    const handleItemsChange = (v: ItemsSelection) => {
        onChangeItemsSelection && onChangeItemsSelection(v);
    };


    const getTaskPrefix = (taskTypeId: number) => {
        switch (taskTypeId) {
            case 1: return "P";   // Price List
            case 2: return "Q";   // Quote/Offer
            case 3: return "T";   // Tender
            case 4:
            case 6: return "R";   // Renewal / Rate Revision
            case 7: return "QP";  // Quote Off Price List
            case 8: return "CH";  // Capital & Hardware
            default: return "";   // fallback
        }
    };


    const fetchTaskType = async () => {
        //console.log(arg, start, end);
        //setLoading(true);
        //setActiveTab(arg);
        try {
            const payload = {
                userId: user.userId
            };

            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Pricing/getTaskTypes`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Task Types API Response:", response.data);
            setTaskTypes(response.data);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const fetchNextTaskNumber = async (arg: any) => {
        console.log('Taskname', arg);
        //setLoading(true);
        //setActiveTab(arg);
        try {
            const payload =
                arg
                ;
            console.log('Taskname Payload', payload);
            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Pricing/GetNextTaskNumber`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("NextTaskNumber API Response:", response.data);
            setNextTaskNumber(response.data);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const fetchPriceListType = async () => {
        //console.log(arg, start, end);
        //setLoading(true);
        //setActiveTab(arg);
        try {
            const payload = {
                viewName: `lkpDirectIndirect`,
                sortBy: "",
                sortByDirection: "",
                filter: ``,
                fieldList: "[Id] AS Value, Name as Text",
                timeout: 0,
            };

            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Metadata/getDataNoPaging`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Price List Types API Response:", response.data);
            setPriceListTypes(response.data);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const fetchSegments = async () => {
        //console.log(arg, start, end);
        //setLoading(true);
        //setActiveTab(arg);
        try {
            const payload = {
                countryId: user.activeCountryId,
                deleted: true
            };

            // 👈 second argument is the body (data)
            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Strategy/getAllSegments`,
                payload,
                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Segments:", response.data);
            setSegments(response.data);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };

    const fetchCurrencies = async () => {
        //console.log(arg, start, end);
        //setLoading(true);
        //setActiveTab(arg);
        try {

            // 👈 second argument is the body (data)
            const response = await axios.get(
                `https://10.2.6.130:5000/api/Pricing/getCurrencies`,

                { headers: { "Content-Type": "application/json" } } // optional config
            );

            console.log("Currencies API Response:", response.data);
            setCurrencies(response.data);
            //setLoading(false);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching data:", error.message);
            return null;
        }
    };
    const navigate = useNavigate();
    const save = () => {
        //console.log("selectedRows",selectedRows);
        //const selected = selectedRows.filter((row: any) => row.checked);
        if (selected.length === 0) {
            //alert("Please select at least one record");
            navigate("/taskDetails");
        } else {
            console.log("selected", selected);
            //dispatch(resetRecords(selected));
            navigate("/taskDetails");
        }
    };

    useEffect(() => {
        fetchTaskType();
        fetchCurrencies();
        fetchPriceListType();
        fetchSegments();
    }, []);

    useEffect(() => {
        fetchTaskType().then(data => {
            if (data && data.length > 0) {
                setSelectedTaskTypeId(data[0].id); // First item selected by default
            }
        });

    }, []);

    const baseTaskName = `${getTaskPrefix(selectedTaskTypeId ?? 0)} – ${selected[0].AccountNumber} – ${selected[0].AccountName}`;
    useEffect(() => {
        if (!selectedTaskTypeId || !selected?.length) return;
        fetchNextTaskNumber(baseTaskName);
    }, [selectedTaskTypeId, selected]);




    return (
        <div>
            {/* Container */}
            <div>
                {/* Header */}


                {/* Content */}
                <div className="px-6 py-5 min-h-[14rem]">
                    {/* Task Name */}
                    <div className={`flex ${isMobile ? "flex-col items-start gap-2" : "items-center"} mb-4`}>
                        <label className={`font-semibold  ${isMobile ? "w-auto" : "w-[200px]"}`}>
                            New Customer Name
                        </label>
                        <input
                            value=""
                            className="flex-1 max-w-[600px] w-full px-2 py-2 border border-gray-300 rounded-sm bg-white"
                        />

                    </div>

                    <div className={`flex ${isMobile ? "flex-col items-start gap-2" : "items-center"} mb-4`}>
                        <label className={`font-semibold  ${isMobile ? "w-auto" : "w-[200px]"}`}>
                            Country
                        </label>
                        <select id="fruit-select" value={selectedValue} onChange={handleChange}
                            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none">
                            {countries.map((option: any) => (
                                <option key={option.countryId} value={option.countryId}>
                                    {option.countryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Options title */}
                    <h3 className="text-base font-semibold  mb-3">Options</h3>

                    {/* Options grid: 2 columns on md+, 1 column on small */}
                    <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"} mb-4`}>
                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Data Period</label>
                            <select
                                value={dataPeriod}
                                onChange={handleSelectChange(onChangeDataPeriod)}
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                <option>1 year</option>
                                <option>6 months</option>
                                <option>2 years</option>
                            </select>
                            <div className="mt-1 text-sm text-slate-500">* 2.1 years of Data Available</div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Task Type</label>
                            <select
                                value={selectedTaskTypeId ?? ""}
                                onChange={(e) => setSelectedTaskTypeId(Number(e.target.value))}
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                {taskTypes?.map((option: any) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"} mb-4`}>
                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Customer Segment</label>
                            <select id="segments" value={selectedValue} onChange={handleSegmentChange}
                            className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white">
                            {segments.map((option: any) => (
                                <option key={option.segmentId} value={option.segmentName}>
                                    {option.segmentName}
                                </option>
                            ))}
                        </select>
                        </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Currency</label>
                            <select
                                value={currency}
                                onChange={handleSelectChange(onChangeCurrency)}
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                {currencies?.map((option: any) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* spacer cell keeps alignment on desktop; hidden on small */}
                        <div className={`${isMobile ? "hidden" : "block"}`} />

                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Price List Type</label>
                            <select
                                value={priceListType}
                                onChange={handleSelectChange(onChangePriceListType)}
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                {priceListTypes?.map((option: any) => (
                                    <option key={option.Value} value={option.Text}>
                                        {option.Text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-gray-100 border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-150"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        className="bg-gradient-to-b from-sky-400 to-sky-600 border border-sky-700 text-white px-4 py-1 rounded-md"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCustomer;