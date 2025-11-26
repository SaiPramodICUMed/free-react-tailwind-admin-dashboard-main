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
    onChangeDataPeriod?: (v: string) => void;
    onChangeTaskType?: (v: string) => void;
    onChangeCurrency?: (v: string) => void;
    onChangePriceListType?: (v: string) => void;
    onChangeItemsSelection?: (v: ItemsSelection) => void;
    className?: string;
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
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth <= mobileBreakpoint;
    });

    const user = useSelector((state: any) => state.user.users);
    const selectedApprovals = useSelector((state: any) => state.user.userApprovals);
    const countries: [] = useSelector((state: any) => state.user.countries);

    const [taskTypes, setTaskTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [priceListTypes, setPriceListTypes] = useState([]);
    const [segments, setSegments] = useState([]);
    const [nextTaskNumber, setNextTaskNumber] = useState({});
    const [newSegmentId, setNewSegmentId] = useState({});
    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<number | null>(null);

    const [selectedValue, setSelectedValue] = useState(user.activeCountryId);
    const [selectedSegmentValue, setselectedSegmentValue] = useState(0);

    const [newCustomerName, setNewCustomerName] = useState("");

    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [selectedPriceListType, setSelectedPriceListType] = useState("");

    const handleChange = (event: any) => {
        setSelectedValue(event.target.value);
    };

    const handleSegmentChange = (event: any) => {
        setselectedSegmentValue(Number(event.target.value));
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= mobileBreakpoint);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [mobileBreakpoint]);

    const getTaskPrefix = (taskTypeId: number) => {
        switch (taskTypeId) {
            case 1: return "P";
            case 2: return "Q";
            case 3: return "T";
            case 4:
            case 6: return "R";
            case 7: return "QP";
            case 8: return "CH";
            default: return "";
        }
    };

    const fetchNewTaskSegmentId = async () => {
        try {
            const payload = {
                userId: user.userId,
                countryId: user.activeCountryId,
                createTaskType: 1,
                accountIds: [],
                siteIds: [],
                priceLists: [],
                groupId: null
            };
            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetNewTaskSegmentId`,
                payload
            );
            setNewSegmentId(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const fetchTaskType = async () => {
        try {
            const payload = { userId: user.userId };
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Pricing/getTaskTypes`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            setTaskTypes(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const fetchNextTaskNumber = async (arg: any) => {
        try {
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Pricing/GetNextTaskNumber`,
                arg,
                { headers: { "Content-Type": "application/json" } }
            );

            setNextTaskNumber(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const fetchPriceListType = async () => {
        try {
            const payload = {
                viewName: `lkpDirectIndirect`,
                sortBy: "",
                sortByDirection: "",
                filter: ``,
                fieldList: "[Id] AS Value, Name as Text",
                timeout: 0,
            };
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Metadata/getDataNoPaging`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            setPriceListTypes(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const fetchSegments = async () => {
        try {
            const payload = { countryId: user.activeCountryId, deleted: true };

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Strategy/getAllSegments`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            setSegments(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await axios.get(
                `https://10.2.6.130:5000/api/Pricing/getCurrencies`,
                { headers: { "Content-Type": "application/json" } }
            );

            setCurrencies(response.data);
            return response.data;
        } catch {
            return null;
        }
    };

    const baseTaskName = `${getTaskPrefix(selectedTaskTypeId ?? 0)} – New Customer – ${newCustomerName || ""}`;

    const fetchNextNumberWhenReady = () => {
        if (!selectedTaskTypeId) return;
        fetchNextTaskNumber(baseTaskName);
    };

    useEffect(fetchNextNumberWhenReady, [selectedTaskTypeId, newCustomerName]);

    // Fetch all dropdown data
    useEffect(() => {
        fetchTaskType();
        fetchCurrencies();
        fetchPriceListType();
        fetchSegments();
        fetchNewTaskSegmentId();
    }, []);

    // Set default Task Type (first item)
    useEffect(() => {
        fetchTaskType().then(data => {
            if (data && data.length > 0) {
                setSelectedTaskTypeId(data[0].id);
            }
        });
    }, []);

    // ⭐ AUTO-SELECT FIRST CURRENCY IF USER DOES NOT CHANGE
    useEffect(() => {
        if (currencies.length > 0 && !selectedCurrency) {
            setSelectedCurrency(currencies[0]);
        }
    }, [currencies]);

    // ⭐ AUTO-SELECT FIRST PRICE LIST TYPE IF USER DOES NOT CHANGE
    useEffect(() => {
        if (priceListTypes.length > 0 && !selectedPriceListType) {
            setSelectedPriceListType(String(priceListTypes[0].Value));
        }
    }, [priceListTypes]);

    const createTask = async () => {
        console.log("create task called");
        try {

            const payload = {
                userId: user?.userId,
                historyStartDate: 0,
                historyEndDate: 0,
                salesHistoryMaxPeriod: 0,
                countryId: user.activeCountryId,
                createTaskType: 1,
                accounts: [],
                sites: [],
                priceLists: [],
                groupId: null,
                segmentId: selectedSegmentValue,
                taskName: `${baseTaskName}`,
                currencyCode: selectedCurrency,          
                taskTypeId: selectedTaskTypeId,
                approvalId: selectedApprovals?.[0]?.id,
                newCustomerName: newCustomerName,
                dataSource: 0,
                sales: 0,
                directIndirect: Number(selectedPriceListType), 
                priceListExpiry: null,
                priceChange: null,
                baseURL: "",
                specifiedItems: []
            };

            console.log("new customer payload", payload);

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Pricing/AddTask`,
                payload
            );

            console.log("create response", response.data);
            return response.data;

        } catch (err) {
            console.error("createTask() ERROR:", err);
            return null;
        }
    };


    const navigate = useNavigate();

    const save = async () => {
        if (!newCustomerName.trim()) {
            alert("Please enter a New Customer Name.");
            return;
        }

        if (selectedSegmentValue === 0) {
            alert("Please select a Customer Segment.");
            return;
        }

        if (!selectedApprovals?.length) {
            alert("No approvals selected");
            return;
        }

        const response = await createTask();
        console.log('res', response);
        if (response?.taskId > 0) navigate("/taskDetails");
    };

    return (
        <div>
            <div>
                <div className="px-6 py-5 min-h-[14rem]">
                    <div className={`flex ${isMobile ? "flex-col items-start gap-2" : "items-center"} mb-4`}>
                        <label className={`font-semibold  ${isMobile ? "w-auto" : "w-[200px]"}`}>
                            New Customer Name
                        </label>
                        <input
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            className="flex-1 max-w-[600px] w-full px-2 py-2 border border-gray-300 rounded-sm bg-white"
                        />
                    </div>

                    <div className={`flex ${isMobile ? "flex-col items-start gap-2" : "items-center"} mb-4`}>
                        <label className={`font-semibold  ${isMobile ? "w-auto" : "w-[200px]"}`}>
                            Country
                        </label>
                        <select value={selectedValue} onChange={handleChange}
                            className="w-[200] border border-gray-300 rounded-md px-3 py-0 text-gray-700 bg-white">
                            {countries.map((option: any) => (
                                <option key={option.countryId} value={option.countryId}>
                                    {option.countryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h3 className="text-base font-semibold  mb-3">Options</h3>

                    <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"} mb-4`}>

                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Task Type</label>
                            <select
                                value={selectedTaskTypeId ?? ""}
                                onChange={(e) => setSelectedTaskTypeId(Number(e.target.value))}
                                className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                {taskTypes?.map((option: any) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Customer Segment</label>
                            <select
                                id="segments"
                                value={selectedSegmentValue}
                                onChange={handleSegmentChange}
                                className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                <option value="0">Please select segment</option>
                                {segments.map((option: any) => (
                                    <option key={option.segmentId} value={option.segmentId}>
                                        {option.segmentName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* CURRENCY DROPDOWN (FIXED) */}
                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Currency</label>
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                <option value="">Select currency</option>
                                {currencies?.map((option: any) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PRICE LIST TYPE DROPDOWN (FIXED) */}
                        <div className="flex flex-col">
                            <label className="mb-1 font-semibold text-slate-800">Price List Type</label>
                            <select
                                value={selectedPriceListType}
                                onChange={(e) => setSelectedPriceListType(e.target.value)}
                                className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                <option value="">Select price list type</option>
                                {priceListTypes?.map((option: any) => (
                                    <option key={option.Value} value={option.Value}>
                                        {option.Text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`${isMobile ? "hidden" : "block"}`} />
                    </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/pricingAccount')}
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
