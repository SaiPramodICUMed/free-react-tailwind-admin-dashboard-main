import axios from "axios";
import React, { useEffect, useState } from "react";
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

const ConfirmSelectionMultiple: React.FC<Props> = ({
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
    const selected = useSelector((state: any) => state.user.selectedRecords);
    const selectedApprovals = useSelector((state: any) => state.user.userApprovals);

    const [taskTypes, setTaskTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [priceListTypes, setPriceListTypes] = useState([]);
    const [allSegments, setAllSegments] = useState([]);
    const [nextTaskNumber, setNextTaskNumber] = useState<any>({});
    const [newSegmentId, setNewSegmentId] = useState<any>({});
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<number | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
    const [localDataPeriod, setLocalDataPeriod] = useState(dataPeriod);

    // ------------ RESPONSIVE ----------------
    useEffect(() => {
        setIsMobile(window.innerWidth <= 760);
        window.addEventListener("resize", () =>
            setIsMobile(window.innerWidth <= 760)
        );
    }, []);


    // ------------ PREFIX ----------------
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


    // ------------ MULTI-ACCOUNT TASK NAME ----------------
    const accountIds = selected.map((x: any) => x.AccountNumber);
    const accountCount = selected.length;

    const baseTaskName = `${getTaskPrefix(selectedTaskTypeId ?? 0)} – ${accountCount} Accounts – ${accountIds.join(", ")}`;


    // ------------ API CALLS -------------
    const fetchTaskType = async () => {
        const response = await axios.post(
            `https://10.2.6.130:5000/api/Pricing/getTaskTypes`,
            { userId: user.userId }
        );
        setTaskTypes(response.data);
        return response.data;
    };

    const fetchNextTaskNumber = async (arg: string) => {
        try {
            console.log("arg", arg);

            const response = await axios.post(
                "https://10.2.6.130:5000/api/Pricing/GetNextTaskNumber",
                JSON.stringify(arg),   // 🔥 VERY IMPORTANT
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            setNextTaskNumber(response.data);
            return response.data;
        } catch (error) {
            console.error("NextTaskNumber ERROR:", error);
            return null;
        }
    };


    const fetchPriceListType = async () => {
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
            payload
        );
        setPriceListTypes(response.data);
    };

    const fetchCurrencies = async () => {
        const response = await axios.get(
            `https://10.2.6.130:5000/api/Pricing/getCurrencies`
        );
        setCurrencies(response.data);
    };

    const fetchNewTaskSegmentId = async () => {
        const payload = {
            userId: user.userId,
            countryId: selected[0].CountryID,
            createTaskType: 2,
            accountIds: [selected[0].AccountId],
            siteIds: [],
            priceLists: [],
            groupId: null
        };

        const response = await axios.post(
            `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetNewTaskSegmentId`,
            payload
        );
        setNewSegmentId(response.data);
    };

    const fetchAllSegments = async () => {
        const payload = {
            countryId: user.activeCountryId,
            deleted: true
        };

        const response = await axios.post(
            `https://vm-www-dprice01.icumed.com:5000/api/Strategy/getAllSegments`,
            payload
        );
        console.log('allsegments', response.data);
        setAllSegments(response.data);
    };

    const fetchSalesHistoryMaxPeriod = async () => {
        const payload = {
            userId: user.userId,
            countryId: selected[0].CountryID,
            createTaskType: 2,
            accounts: selected.map((x: any) => x.AccountId),
            siteIds: [],
            priceLists: [],
            groupId: null
        };

        const response = await axios.post(
            `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetSalesHistoryMaxPeriod`,
            payload
        );
        setSalesHistory(response.data);
    };


    // ------------ INIT API LOAD -------------
    useEffect(() => {
        fetchTaskType().then(data => {
            if (data?.length > 0) setSelectedTaskTypeId(data[0].id);
        });

        fetchCurrencies();
        fetchPriceListType();

        fetchNewTaskSegmentId();
        fetchSalesHistoryMaxPeriod();
        fetchAllSegments();
    }, []);


    useEffect(() => {
        if (selectedTaskTypeId) fetchNextTaskNumber(baseTaskName);
    }, [selectedTaskTypeId]);


    // ------------ SAVE TASK -------------
    const navigate = useNavigate();

    const save = async () => {
        const payload = {
            userId: user.userId,
            historyStartDate: 365,
            historyEndDate: 0,
            salesHistoryMaxPeriod: salesHistory[0]?.maxPeriod,
            countryId: selected[0].CountryID,
            createTaskType: 3,
            accounts: selected.map((x: any) => x.AccountId),
            sites: [],
            priceLists: [],
            groupId: null,
            segmentId: newSegmentId.segmentId,
            taskName: `${baseTaskName}${nextTaskNumber?.nextNumber ? ` (${nextTaskNumber.nextNumber})` : ""}`,
            currencyCode: user.currencyCode,
            taskTypeId: selectedTaskTypeId,
            approvalId: selectedApprovals[0].id,
            newCustomerName: "",
            dataSource: 0,
            sales: 0,
            directIndirect: 1,
            priceListExpiry: null,
            priceChange: null,
            baseURL: "",
            specifiedItems: []
        };

        const response = await axios.post(
            `https://vm-www-dprice01.icumed.com:5000/api/Pricing/AddTask`,
            payload
        );

        if (response.data?.taskId > 0) navigate("/taskDetails");
        else navigate("/pricingAccount");
    };



    // =======================  UI START  ============================
    return (
        <div className="px-6 py-3">

            {/* -------------------- TASK NAME -------------------- */}
            <div className={`flex ${isMobile ? "flex-col gap-1" : "items-center"} mb-2`}>
                <label className={`font-semibold ${isMobile ? "" : "w-[150px]"}`}>
                    Task Name
                </label>

                <input
                    readOnly
                    value={`${baseTaskName}${nextTaskNumber?.nextNumber ? ` (${nextTaskNumber.nextNumber})` : ""}`}
                    className="flex-1 max-w-[600px] w-full px-2 py-2 border border-gray-300 rounded-sm bg-white"
                />
            </div>


            {/* -------------------- OPTIONS -------------------- */}
            <h3 className="text-base font-semibold mb-2">Options</h3>
            <div className="border-b border-gray-300 mb-2"></div>

            <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-2"} mb-2`}>

                {/* Data Period */}
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-slate-800">Data Period</label>
                    <select
                        value={localDataPeriod}
                        onChange={(e) => {
                            setLocalDataPeriod(e.target.value);       // update locally
                            onChangeDataPeriod && onChangeDataPeriod(e.target.value); // update parent
                        }}
                        className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                    >
                        <option value="1month">1 month</option>
                        <option value="3months">3 months</option>
                        <option value="6months">6 months</option>
                        <option value="1year">1 year</option>
                        <option value="2years">2 years</option>
                        <option value="3years">3 years</option>
                        <option value="4years">4 years</option>
                        <option value="5years">5 years</option>
                        <option value="6years">6 years</option>
                        <option value="7years">7 years</option>
                    </select>
                    <div className="mt-1 text-sm text-slate-500">* 2.1 years of Data Available</div>
                </div>

                {/* Task Type */}
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-slate-800">Task Type</label>
                    <select
                        value={selectedTaskTypeId ?? ""}
                        onChange={(e) => setSelectedTaskTypeId(Number(e.target.value))}
                        className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                    >
                        {taskTypes.map((option: any) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Customer Segment */}
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-slate-800">Customer Segment</label>
                    <select
                        value={selectedSegment ?? ""}
                        onChange={(e) => setSelectedSegment(Number(e.target.value))}
                        className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white"
                    >
                        {allSegments.map((option: any) => (
                            <option key={option.segmentId} value={option.segmentName}>
                                {option.segmentName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Currency */}
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-slate-800">Currency</label>
                    <select className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white">
                        {currencies.map((c: any) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className={`${isMobile ? "hidden" : "block"}`} />

                {/* Price List Type */}
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold text-slate-800">Price List Type</label>
                    <select className="w-64 px-2 py-1 border border-gray-300 rounded-sm bg-white">
                        {priceListTypes.map((option: any) => (
                            <option key={option.Value} value={option.Text}>
                                {option.Text}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {/* -------------------- ITEM SELECTION -------------------- */}
            <h3 className="text-base font-semibold mb-2">Items selection</h3>
            <div className="border-b border-gray-300 mb-2"></div>

            <div className={`${isMobile ? "flex flex-col" : "flex items-center gap-4"} mb-1`}>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="items"
                        checked={itemsSelection === "blank"}
                        onChange={() => setItemsSelection("blank")}
                    />
                    <span className="text-sky-700">Blank</span>
                </label>
                <div className="text-sky-700 text-sm">(Pick your items from SKU catalogue)</div>
            </div>

            <div className={`${isMobile ? "flex flex-col" : "flex items-center gap-4"} mb-2`}>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="items"
                        checked={itemsSelection === "advanced"}
                        onChange={() => setItemsSelection("advanced")}
                    />
                    <span className="text-sky-700">Advanced</span>
                </label>
                <div className="text-sky-700 text-sm">(Choose items by price list / contract)</div>
            </div>


            {/* -------------------- SUMMARY -------------------- */}
            <h3 className="text-base font-semibold mb-2">Summary</h3>
            <div className="border-b border-gray-300 mb-2"></div>
            <div className={`flex ${isMobile ? "flex-col gap-3" : "items-start gap-6"}`}>

                <div className="w-32 font-semibold">Customer(s)</div>

                <div className="flex flex-col gap-1">
                    {selected.map((acc: any) => (
                        <div key={acc.AccountId} className="text-sky-700">
                            • {acc.AccountName}
                        </div>
                    ))}
                </div>

                <div className={`${isMobile ? "mt-4" : "ml-auto"} flex gap-3`}>
                    <button
                        type="button"
                        className="bg-gray-100 border border-gray-300 px-4 py-1 rounded-md"
                        onClick={() => navigate('/pricingAccount')}
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={save}
                        className="bg-gradient-to-b from-sky-400 to-sky-600 text-white px-4 py-1 rounded-md border border-sky-700"
                    >
                        Confirm
                    </button>
                </div>

            </div>

        </div>
    );
};

export default ConfirmSelectionMultiple;
