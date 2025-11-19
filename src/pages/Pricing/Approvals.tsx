// src/pages/DealOverviewPage.tsx
import React, { useMemo, useState } from "react";

type CommentItem = {
    id: number;
    date: string;
    author: string;
    role?: string;
    text: string;
};

const formatCurrency = (v: number) =>
    v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Approvals: React.FC = () => {
    // ----- Mock / example data (replace with real props/API) -----
    const task = {
        customersLabel: "4 Accounts",
        segment: "Direct Hospital",
        taskType: "Renewal",
        dataPeriod: "1 year from 1.7 years historic data",
        priceLists: "8 Price Lists",
        buyingGroups: "8 Buying Groups",
        country: "Canada",
    };

    const gauge = {
        floorPct: 50,
        targetPct: 100,
        segmentAvgPct: 82, // example marker
        dealPct: 64, // yellow diamond marker
    };

    
    const previousGrossSales = 51619;
    const changes = {
        newVolume: 0,
        price: 5162,
        newItems: 16,
        unsaleable: 0,
    };
    const currentGrossSales = previousGrossSales + changes.price + changes.newItems + changes.newVolume - changes.unsaleable;

    const approvalControls = [
        { code: "C1", label: "Floor Breaks (Sales Rep)", current: 2 },
        { code: "C2", label: "Floor Breaks (Manager)", current: 2 },
        { code: "C4", label: "% Price Change", current: "+ 10 %" },
        { code: "C7", label: "GM % Floor", current: "48.4 %" },
        { code: "C9", label: "Total Value", current: formatCurrency(currentGrossSales) },
        { code: "C20", label: "Margin Floor Break", current: 2 },
        { code: "C21", label: "Group Price Violation", current: 0 },
    ];

    const priceSummary = [
  { label: "Price increase", color: "text-green-600", count: 6, percent: "100%" },
  { label: "Same price", color: "text-slate-600", count: 0, percent: "0%" },
  { label: "Price decrease", color: "text-orange-500", count: 0, percent: "0%" },
  { label: "Floor breaks", color: "text-red-600", count: 2, percent: "0%" },
  { label: "No Rule", color: "text-slate-600", count: 0, percent: "0%" }
];


    const reviewers = [
        { name: "Denise Desjardins", role: "Creator", date: "29/3/2023", notes: ["C2 - Floor Breaks (Manager)"] },
        { name: "Mat Dinneen", role: "Marketing Manager", date: "29/3/2023", notes: ["C2 - Floor Breaks (Manager)"] },
        { name: "Beth Pasceri", role: "Finance Business Partner", date: "29/3/2023", notes: ["C9 - Total Value", "C20 - Margin Floor Break"] },
        { name: "Mat Dinneen", role: "VP Sales", date: "29/3/2023", notes: ["C9 - Total Value", "C20 - Margin Floor Break"] },
        { name: "Contracts team", role: "Contracts team", date: "29/3/2023", notes: ["Customer Services"] },
    ];

    const [comments, setComments] = useState<CommentItem[]>([
        { id: 1, date: "29/03/2023 22:12", author: "Denise Desjardins - RBM - EASTERN", role: "Regional Business Manager", text: "This is a two year convective contract renewal. The price of the blankets have a high margin. Customer wants to add 14 x carts and 14 x shelves on consignment." },
        { id: 2, date: "30/03/2023 01:03", author: "Diane McMillan", role: "Contracts team", text: "working on thi" },
    ]);

    const [commentText, setCommentText] = useState("");
    const [selectedCustomReviewers, setSelectedCustomReviewers] = useState<string[]>([]);

    // ----- Calculations -----
    const variance = {
        previous: previousGrossSales,
        diff: currentGrossSales - previousGrossSales,
        current: currentGrossSales,
    };

    const percentChange = Math.round(((currentGrossSales - previousGrossSales) / previousGrossSales) * 100);

    // position helpers for painting gauge markers (0..100)
    const markerPos = (pct: number) => `${Math.min(Math.max(pct, 0), 100)}%`;

    // ----- Handlers -----
    const postComment = () => {
        if (!commentText.trim()) return;
        const newComment: CommentItem = {
            id: comments.length + 1,
            date: new Date().toLocaleString(),
            author: "You",
            text: commentText,
        };
        setComments([newComment, ...comments]);
        setCommentText("");
    };

    const toggleCustomReviewer = (name: string) => {
        setSelectedCustomReviewers(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
    };

    // ----- Render -----
    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6 font-sans text-sm text-gray-800">
            {/* TOP ROW: Task details + Deal gauge */}
            {/* stacked vertically: Task details then Deal gauge */}
            <div className="flex flex-col gap-6">
                {/* Task details (full width, each field on its own line) */}
                {/* Task details */}
                <section className="bg-slate-50 border border-slate-200 rounded shadow-sm p-5">
                    <h3 className="bg-slate-200 text-slate-700 px-3 py-2 rounded text-base font-semibold mb-4">
                        Task details
                    </h3>

                    {/* 2 columns per row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">

                        {/* Customer */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Customer:</div>
                            <div className="text-sky-700 font-medium">{task.customersLabel}</div>
                        </div>

                        {/* Segment */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Segment:</div>
                            <div>{task.segment}</div>
                        </div>

                        {/* Task Type */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Task Type:</div>
                            <div>{task.taskType}</div>
                        </div>

                        {/* Data Period */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Data Period:</div>
                            <div>{task.dataPeriod}</div>
                        </div>

                        {/* Price Lists */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Price Lists:</div>
                            <div>{task.priceLists}</div>
                        </div>

                        {/* Buying Groups */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Buying Groups:</div>
                            <div className="text-sky-700 font-medium">{task.buyingGroups}</div>
                        </div>

                        {/* Country */}
                        <div className="flex items-start gap-3">
                            <div className="w-28 text-slate-600">Country:</div>
                            <div>{task.country}</div>
                        </div>

                    </div>
                </section>


                {/* Deal gauge (full width, stacked under Task details) */}
                <section className="bg-slate-50 border border-slate-200 rounded shadow-sm p-5">
                    <h3 className="bg-slate-200 text-slate-700 px-3 py-2 rounded text-base font-semibold mb-4">
                        Deal Gauge
                    </h3>

                    <div className="flex flex-col gap-4">
                        <div className="relative h-14 flex items-center">
                            {/* bar background */}
                            <div className="w-full h-8 rounded border border-slate-200 overflow-hidden relative">
                                {/* left red zone */}
                                <div
                                    style={{ width: `${gauge.floorPct}%` }}
                                    className="absolute left-0 top-0 bottom-0 bg-red-600"
                                />
                                {/* right green zone */}
                                <div
                                    style={{ left: `${gauge.floorPct}%`, right: 0 }}
                                    className="absolute top-0 bottom-0 bg-green-300"
                                />

                                {/* floor vertical marker */}
                                <div
                                    style={{ left: markerPos(gauge.floorPct) }}
                                    className="absolute top-0 bottom-0 w-px bg-slate-300"
                                />

                                {/* target vertical marker */}
                                <div
                                    style={{ left: markerPos(gauge.targetPct) }}
                                    className="absolute top-0 bottom-0 w-px bg-slate-300"
                                />

                                {/* segment avg marker (small grey circle) */}
                                <div
                                    style={{ left: markerPos(gauge.segmentAvgPct) }}
                                    className="absolute -top-2 transform -translate-x-1/2"
                                >
                                    <div className="w-3 h-3 rounded-full bg-slate-700 border border-white" />
                                </div>

                                {/* deal marker (yellow diamond) */}
                                <div
                                    style={{ left: markerPos(gauge.dealPct) }}
                                    className="absolute -top-3 transform -translate-x-1/2"
                                >
                                    <div
                                        style={{ rotate: "45deg" }}
                                        className="w-4 h-4 bg-yellow-300 border border-yellow-600 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-sm text-slate-600 gap-3">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-700 font-semibold">Floor</span>
                                <span className="text-slate-400">Your deal</span>
                                <span className="inline-block w-3 h-3 bg-yellow-300 rounded-sm" />
                                <span className="text-slate-400 ml-3">Cus. Segment Avg.</span>
                                <span className="inline-block w-3 h-3 bg-slate-700 rounded-full" />
                            </div>

                            <div className="text-right">
                                <div className="text-sky-700 font-semibold">
                                    Your deal is <span className="text-green-600">-11.59% below</span> the Target Price.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>


            {/* VARIANCE */}
            <section className="bg-slate-50 border border-slate-200 rounded shadow-sm p-5">
                <h3 className="bg-slate-200 text-slate-700 px-3 py-2 rounded text-base font-semibold mb-4">Variance to previous sales</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* left summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="font-semibold text-slate-700">Previous Gross Sales</div>
                            <div className="font-semibold text-slate-700">{formatCurrency(previousGrossSales)}</div>
                        </div>

                        <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <div className="text-slate-600">New volume</div>
                                <div>{formatCurrency(changes.newVolume)}</div>
                            </div>
                            <div className="flex justify-between">
                                <div className="text-slate-600">Price</div>
                                <div className="text-green-600">{formatCurrency(changes.price)}</div>
                            </div>
                            <div className="flex justify-between">
                                <div className="text-slate-600">New Items</div>
                                <div className="text-green-600">{formatCurrency(changes.newItems)}</div>
                            </div>
                            <div className="flex justify-between">
                                <div className="text-slate-600">Unsaleable</div>
                                <div>{formatCurrency(changes.unsaleable)}</div>
                            </div>

                            <div className="flex justify-between border-t pt-2 mt-2">
                                <div className="font-semibold">Current Gross Sales</div>
                                <div className="font-semibold">{formatCurrency(currentGrossSales)}</div>
                            </div>
                        </div>
                    </div>

                    {/* center explanation */}
                    <div className="px-4">
                        <div className="text-sky-700 font-semibold">Your deal is priced at <span className="text-green-600">10 %</span> above previous sales.</div>
                        <p className="mt-3 text-sm text-slate-600">The overall change in Gross Sales is <span className="text-green-600">10 %</span>.</p>
                    </div>

                    {/* right grid of previous/variance/new */}
                    {/* right grid of previous/variance/new */}
                    <div className="text-sm w-full">

                        {/* Title Row */}
                        <div className="grid grid-cols-4 gap-4 text-slate-700 font-semibold mb-2">
                            <div></div>
                            <div>Previous</div>
                            <div>Variance</div>
                            <div className="text-right">New</div>
                        </div>

                        {/* Gross Sales */}
                        <div className="grid grid-cols-4 gap-4 mt-1">
                            <div className="text-slate-600">Gross Sales</div>
                            <div className="text-slate-600">{formatCurrency(previousGrossSales)}</div>
                            <div className="text-green-600">{formatCurrency(currentGrossSales - previousGrossSales)}</div>
                            <div className="text-right text-slate-700">{formatCurrency(currentGrossSales)}</div>
                        </div>

                        {/* Net Sales */}
                        <div className="grid grid-cols-4 gap-4 mt-1">
                            <div className="text-slate-600">Net sales</div>
                            <div className="text-slate-600">{formatCurrency(previousGrossSales)}</div>
                            <div className="text-green-600">{formatCurrency(currentGrossSales - previousGrossSales)}</div>
                            <div className="text-right text-slate-700">{formatCurrency(currentGrossSales)}</div>
                        </div>

                        {/* Gross Margin */}
                        <div className="grid grid-cols-4 gap-4 mt-1">
                            <div className="text-slate-600">Gross Margin</div>
                            <div className="text-slate-600">{formatCurrency(26150)}</div>
                            <div className="text-green-600">{formatCurrency(27512 - 26150)}</div>
                            <div className="text-right text-slate-700">{formatCurrency(27512)}</div>
                        </div>

                        {/* GM% */}
                        <div className="grid grid-cols-4 gap-4 mt-1">
                            <div className="text-slate-600">GM%</div>
                            <div className="text-slate-600">51 %</div>
                            <div className="text-red-600">-2 %</div>
                            <div className="text-right text-slate-700">48 %</div>
                        </div>

                    </div>

                </div>
            </section>

            {/* Approval controls + Price Summary */}
            <section className="bg-slate-50 border border-slate-200 rounded shadow-sm p-5">
                <h4 className="bg-slate-200 text-slate-700 px-3 py-2 rounded text-base font-semibold mb-4">
                    Approval Controls
                </h4>

                {/* Headers */}
                <div className="grid grid-cols-3 pb-2 border-b text-sm font-semibold text-slate-700">
                    <div>Rule</div>
                    <div className="text-center">Current</div>
                    <div className="text-right pr-2">Approval Status</div>
                </div>

                {/* Rows */}
                {approvalControls.map((a) => (
                    <div
                        key={a.code}
                        className="grid grid-cols-3 text-sm py-1 border-b last:border-b-0"
                    >
                        <div className="text-slate-700">
                            {a.code} - {a.label}
                        </div>

                        <div
                            className={`text-center font-medium ${a.isNegative ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {a.current}
                        </div>

                        <div className="text-right pr-2 text-green-600">✔</div>
                    </div>
                ))}

                {/* Allocation row */}
                <div className="pt-3 text-sm text-slate-600">
                    Allocation: <span className="font-medium">Group</span>
                </div>

            </section>


            {/* Price Summary (FULL WIDTH) */}
            <section className="bg-slate-50 border border-slate-200 rounded shadow-sm p-5 mt-6">
                <h4 className="bg-slate-200 text-slate-700 px-3 py-2 rounded text-base font-semibold mb-4">
                    Price Summary
                </h4>

                {/* Header Row */}
                <div className="grid grid-cols-3 text-sm font-semibold text-slate-700 mb-2 pb-1 border-b">
                    <div></div>
                    <div className="text-center">No of SKUs</div>
                    <div className="text-right">% of Sales</div>
                </div>

                {/* Rows */}
                {priceSummary.map((ps, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-sm py-1">
                        <div className={`${ps.color}`}>{ps.label}</div>

                        <div className="text-center font-medium">{ps.count}</div>

                        <div
                            className={`text-right font-medium ${ps.percent === "0%" ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {ps.percent}
                        </div>
                    </div>
                ))}

                {/* Footer */}
                <div className="grid grid-cols-3 border-t pt-3 text-sm font-semibold mt-3">
                    <div>Prices to be submitted</div>
                    <div className="text-center">8</div>
                    <div className="text-right">100%</div>
                </div>
            </section>




            {/* Reviewers timeline (horizontal) */}
            <div className="bg-white rounded p-4 border border-slate-100">
                <div className="flex gap-8 overflow-x-auto pb-3">
                    {reviewers.map((r, i) => (
                        <div key={i} className="min-w-[220px] flex-shrink-0">
                            <div className="text-sm text-slate-600">{r.name}</div>
                            <div className="text-xs text-slate-500">{r.date}</div>
                            <div className="mt-2 text-xs text-slate-500">
                                {r.notes.map((n, idx) => <div key={idx}>• {n}</div>)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments + custom reviewers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-slate-50 border border-slate-200 rounded p-4">
                    <h4 className="bg-slate-200 px-3 py-2 rounded text-base font-semibold mb-3">Comments</h4>

                    <div className="space-y-3 mb-3">
                        {comments.map(c => (
                            <div key={c.id} className="border rounded p-3 bg-white">
                                <div className="text-xs text-slate-500">{c.date}</div>
                                <div className="font-semibold">{c.author} {c.role && <span className="text-xs text-slate-400"> - {c.role}</span>}</div>
                                <div className="italic text-slate-700 mt-1">{c.text}</div>
                            </div>
                        ))}
                    </div>

                    <textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full border rounded p-3 h-36 resize-none mb-3"
                    />

                    <div className="flex gap-3">
                        <button onClick={postComment} className="bg-sky-600 text-white px-4 py-1 rounded">Post Comment</button>
                        <button onClick={() => setCommentText("")} className="bg-white border px-4 py-1 rounded">Clear</button>
                    </div>
                </section>

                <section className="bg-slate-50 border border-slate-200 rounded p-4">
                    <h4 className="bg-slate-200 px-3 py-2 rounded text-base font-semibold mb-3">Custom Reviewers</h4>

                    <div className="flex gap-4">
                        <div className="w-1/2 text-sm text-slate-600">
                            Custom reviewers will be able to view and comment on the task. They will be emailed to notify them they have been added to the task.
                        </div>

                        <div className="w-1/2">
                            <div className="h-40 border rounded bg-white p-2 overflow-auto">
                                {/* mock selectable reviewers */}
                                {["Alice", "Bob", "Charlie", "Denise"].map(name => (
                                    <div key={name} className="flex items-center gap-2 py-1">
                                        <input id={name} checked={selectedCustomReviewers.includes(name)} onChange={() => toggleCustomReviewer(name)} type="checkbox" />
                                        <label htmlFor={name} className="text-sm">{name}</label>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button className="bg-white border px-3 py-1 rounded">Add</button>
                                <button className="bg-white border px-3 py-1 rounded">Remove</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-4 left-0 right-0 flex justify-end gap-4">
                <button className="bg-white border px-6 py-2 rounded shadow">Decline ✖</button>
                <button className="bg-sky-600 text-white px-6 py-2 rounded shadow">Approve ✓</button>
            </div>
        </div>
    );
};

export default Approvals;
