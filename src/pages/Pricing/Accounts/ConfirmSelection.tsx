import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { taskId } from "../../../store/userSlice";
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

const ConfirmSelection: React.FC<Props> = ({
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
    const [taskTypes, setTaskTypes] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [priceListTypes, setPriceListTypes] = useState<any[]>([]);
    const [nextTaskNumber, setNextTaskNumber] = useState<any>({});
    const [newSegmentId, setNewSegmentId] = useState<any>({});
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const selected = useSelector((state: any) => state.user.selectedRecords);
    const [createTaskId, setCreateTaskId] = useState<any>({});
    const selectedApprovals = useSelector((state: any) => state.user.userApprovals);
    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<number | null>(null);
    const [localDataPeriod, setLocalDataPeriod] = useState<string | undefined>(dataPeriod);
    const dispatch = useDispatch();

    // NOTE: selectedPriceListType is number OR empty string initially
    const [selectedCurrency, setSelectedCurrency] = useState<string>(currency || "");
    const [selectedPriceListType, setSelectedPriceListType] = useState<number | "">(priceListType ? Number(priceListType) : "");

    // Resize handler
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
            const hasAccount = selected[0].AccountId !== undefined && selected[0].AccountId !== null;
            const hasSite = selected[0].SiteId !== undefined && selected[0].SiteId !== null;

            const payload = {
                userId: user.userId,
                countryId: selected[0].CountryID,
                createTaskType: 2,
                accountIds: hasAccount ? [selected[0].AccountId] : [],
                siteIds: hasSite ? [selected[0].SiteId] : [],
                priceLists: [],
                groupId: null
            };

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetNewTaskSegmentId`,
                payload
            );

            setNewSegmentId(response.data);
            return response.data;

        } catch (error: any) {
            return null;
        }
    };

    const fetchSalesHistoryMaxPeriod = async () => {
        try {
            const hasAccount = selected[0].AccountId !== undefined && selected[0].AccountId !== null;
            const hasSite = selected[0].SiteId !== undefined && selected[0].SiteId !== null;

            const payload = {
                userId: user.userId,
                countryId: selected[0].CountryID,
                createTaskType: 2,
                accounts: hasAccount ? [selected[0].AccountId] : [],
                siteIds: hasSite ? [selected[0].SiteId] : [],
                priceLists: [],
                groupId: null
            };

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Pricing/GetSalesHistoryMaxPeriod`,
                payload
            );

            setSalesHistory(response.data);
            return response.data;

        } catch (error: any) {
            return null;
        }
    };

    const createTask = async () => {
        try {

            const hasAccount = selected[0].AccountId !== undefined && selected[0].AccountId !== null;
            const hasSite = selected[0].SiteId !== undefined && selected[0].SiteId !== null;

            const payload = {
                userId: user.userId,
                historyStartDate: 365,
                historyEndDate: 0,
                salesHistoryMaxPeriod: salesHistory[0]?.maxPeriod,
                countryId: selected[0].CountryID,
                createTaskType: 3,
                accounts: hasAccount ? [selected[0].AccountId] : [],
                sites: hasSite ? [selected[0].SiteId] : [],
                priceLists: [],
                groupId: null,
                segmentId: newSegmentId.segmentId,
                taskName: `${baseTaskName}${nextTaskNumber?.nextNumber ? ` (${nextTaskNumber.nextNumber})` : ""}`,
                // ensure currencyCode uses selectedCurrency (string)
                currencyCode: selectedCurrency || user.currencyCode || "",

                taskTypeId: selectedTaskTypeId,
                approvalId: selectedApprovals[0].id,
                newCustomerName: "",
                dataSource: 0,
                sales: 0,
                // ensure directIndirect is numeric (if blank, fallback to 0)
                directIndirect: selectedPriceListType === "" ? 0 : Number(selectedPriceListType),
                priceListExpiry: null,
                priceChange: null,
                baseURL: "",
                specifiedItems: []
            };

            console.log("CreateTask Payload", payload);

            const response = await axios.post(
                `https://vm-www-dprice01.icumed.com:5000/api/Pricing/AddTask`,
                payload
            );
            console.log('Task Details', response.data);
            dispatch(taskId(response.data));
            setCreateTaskId(response.data);
            return response.data;

        } catch (error: any) {
            console.error("createTask error", error);
            return null;
        }
    };

    const fetchTaskType = async () => {
        try {
            const payload = { userId: user.userId };
            const response = await axios.post(
                `https://10.2.6.130:5000/api/Pricing/getTaskTypes`,
                payload
            );
            setTaskTypes(response.data);
            return response.data;
        } catch { return null; }
    };

    const fetchNextTaskNumber = async (arg: string) => {
        try {
            const response = await axios.post(
                "https://10.2.6.130:5000/api/Pricing/GetNextTaskNumber",
                JSON.stringify(arg),
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
                payload
            );
            setPriceListTypes(response.data || []);

            // set default numeric selection if not already set
            if ((priceListType === "" || selectedPriceListType === "") && response.data && response.data.length > 0) {
                const firstVal = response.data[0].Value;
                setSelectedPriceListType(Number(firstVal));
                // also notify parent if callback exists
                onChangePriceListType && onChangePriceListType(Number(firstVal));
            }

            return response.data;
        } catch (error: any) {
            return null;
        }
    };

    const fetchCurrencies = async () => {
  try {
    const response = await axios.get(
      `https://10.2.6.130:5000/api/Pricing/getCurrencies`
    );

    const list = response.data || [];
    setCurrencies(list);

    // ✅ DEFAULT FROM REDUX, NOT FIRST ITEM
    if (user?.currencyCode && list.includes(user.currencyCode)) {
      setSelectedCurrency(user.currencyCode);
      onChangeCurrency && onChangeCurrency(user.currencyCode);
    }

    return list;
  } catch (error: any) {
    return null;
  }
};


    const navigate = useNavigate();
    const save = async () => {
        const response = await createTask();
        if (response?.taskId > 0) navigate("/taskDetails");
        else {
            alert("Something went wrong! Please try again.");
            navigate("/pricingAccount");
        }
    };

    useEffect(() => {
        fetchTaskType();
        fetchCurrencies();
        fetchPriceListType();
        fetchNewTaskSegmentId();
        fetchSalesHistoryMaxPeriod();
    }, []);

    useEffect(() => {
        fetchTaskType().then(data => {
            if (data?.length > 0) setSelectedTaskTypeId(data[0].id);
        });
    }, []);

    const baseTaskName = `${getTaskPrefix(selectedTaskTypeId ?? 0)} – ${selected[0].AccountNumber} – ${selected[0].AccountName}`;
    useEffect(() => {
        if (!selectedTaskTypeId || !selected?.length) return;
        fetchNextTaskNumber(baseTaskName);
    }, [selectedTaskTypeId, selected]);

    return (
        <div>
            <div>
                <div className="px-6 py-3 min-h-[14rem]">

                    {/* Task Name */}
                    <div className={`flex ${isMobile ? "flex-col items-start gap-1" : "items-center"} mb-2`}>
                        <label className={` ${isMobile ? "w-auto" : "w-[150px]"}`}>
                            Task Name:
                        </label>
                        <input
                            readOnly
                            value={`${baseTaskName}${nextTaskNumber?.nextNumber ? ` (${nextTaskNumber.nextNumber})` : ""}`}
                            className="flex-1 max-w-[600px] w-full px-2 py-2 border border-gray-300 rounded-sm bg-white"
                        />
                    </div>

                    {/* Options */}
                    <h3 className="text-base font-semibold mb-2">Options</h3>
                    <div className="border-b border-gray-300 mb-2"></div>

                    <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-2"} mb-2`}>
                        <div className="flex flex-col">
                            <label className="mb-1 text-slate-800">Data Period:</label>

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

                        <div className="flex flex-col">
                            <label className="mb-1  text-slate-800">Task Type:</label>
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

                        <div className="flex flex-col">
                            <label className="mb-1  text-slate-800">Customer Segment:</label>
                            <select
                                value={customerSegment}
                                disabled
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-200 rounded-sm bg-slate-100 text-slate-400"
                            >
                                <option>{selected[0].SegmentName}</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
  <label className="mb-1 text-slate-800">Currency:</label>
  <select
    value={selectedCurrency}
    onChange={(e) => {
      setSelectedCurrency(e.target.value);
      onChangeCurrency && onChangeCurrency(e.target.value);
    }}
    className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
  >
    <option value="">Select Currency</option>
    {currencies?.map((option: any) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>


                        <div className={`${isMobile ? "hidden" : "block"}`} />

                        <div className="flex flex-col">
                            <label className="mb-1 text-slate-800">Price List Type:</label>
                            <select
                                value={selectedPriceListType === "" ? "" : selectedPriceListType}
                                onChange={(e) => {
                                    const numericVal = Number(e.target.value);
                                    setSelectedPriceListType(numericVal);
                                    onChangePriceListType && onChangePriceListType(numericVal);
                                }}
                                className="w-64 md:w-64 max-w-full px-2 py-1 border border-gray-300 rounded-sm bg-white"
                            >
                                {priceListTypes?.map((option: any) => (
                                    <option key={option.Value} value={option.Value}>
                                        {option.Text}
                                    </option>
                                ))}
                            </select>



                        </div>
                    </div>

                    {/* Items Selection */}
                    <h3 className="text-base font-semibold mb-2">Items selection</h3>
                    <div className="border-b border-gray-300 mb-2"></div>

                    <div className={`${isMobile ? "flex flex-col gap-1" : "flex items-center gap-2"} mb-1`}>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="items"
                                checked={itemsSelection === "blank"}
                                onChange={() => handleItemsChange("blank")}
                                className="h-4 w-4"
                            />
                            <span className="text-sky-700">Blank</span>
                        </label>
                        <div className="text-sky-700 text-sm">(Pick your items from SKU catalogue)</div>
                    </div>

                    <div className={`${isMobile ? "flex flex-col gap-1" : "flex items-center gap-2"} mb-2`}>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="items"
                                checked={itemsSelection === "advanced"}
                                onChange={() => handleItemsChange("advanced")}
                                className="h-4 w-4"
                            />
                            <span className="text-sky-700">Advanced</span>
                        </label>
                        <div className="text-sky-700 text-sm">(Choose items by price list / contract)</div>
                    </div>

                    {/* Summary */}
                    <h3 className="text-base font-semibold mb-2">Summary</h3>
                    <div className="border-b border-gray-300 mb-2"></div>
                    <div className={`flex ${isMobile ? "flex-col gap-3" : "items-center gap-4"}`}>
                        <div className={`${isMobile ? "font-semibold" : "w-32 font-semibold"}`}>
                            Customer(s)
                        </div>

                        <a className="text-sky-700">{selected[0].AccountName}</a>

                        {/* Buttons */}
                        <div className={`flex gap-3 ${isMobile ? "mt-4" : "ml-auto"}`}>
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
            </div>
        </div>
    );
};

export default ConfirmSelection;
