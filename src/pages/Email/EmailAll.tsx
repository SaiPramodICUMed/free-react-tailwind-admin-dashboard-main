// EmailInbox.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type Letter = {
  Id: number;
  UserId?: number;
  Sender: string;
  Subject: string;
  Body: string;
  DateCreated: string;
  IsRead: number; // 1 => read, 0 => unread
  IsArchive?: number; // optional
  Status?: string;
  RowNum?: number;
};

const API_BASE = "https://vm-www-dprice01.icumed.com:5000";
const USER_ID = 8367; // change if needed

export default function EmailInbox() {
  const [loading, setLoading] = useState(false);

  // page data
  const [letters, setLetters] = useState<Letter[]>([]);
  // selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // expanded row
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // pagination & counts
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // tab
  const [tab, setTab] = useState<"all" | "unread" | "archive">("all");

  // filters (client-side for current page)
  const [filterDate, setFilterDate] = useState("");
  const [filterSender, setFilterSender] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // hover preview
  const [hoverPreview, setHoverPreview] = useState<{ id: number; text: string } | null>(null);

  // counts for tabs (displayed)
  const [countAll, setCountAll] = useState(0);
  const [countUnread, setCountUnread] = useState(0);
  const [countArchive, setCountArchive] = useState(0);

  // helper: build filter string for API
  const buildApiFilter = (forTab: typeof tab) => {
    if (forTab === "all") {
      return " AND Status <> 'Archive'";
    } else if (forTab === "unread") {
      return " AND Status = 'Unread'";
    } else {
      return " AND Status = 'Archive'";
    }
  };

  // fetch page (server-side)
  const fetchPage = async (pageNumber = 1, currentTab = tab, currentPageSize = pageSize) => {
    setLoading(true);
    setSelectedIds([]);
    setExpandedId(null);

    const firstRow = (pageNumber - 1) * currentPageSize + 1;
    const lastRow = pageNumber * currentPageSize;

    const payload = {
      viewName: `dbo.UserLetters(${USER_ID})`,
      firstRow,
      lastRow,
      sortBy: "DateCreated",
      sortByDirection: "desc",
      filter: buildApiFilter(currentTab),
      fieldList: "*",
      timeout: 0,
    };
    console.log('fetch data payload', payload);

    try {
      const resp = await axios.post(`${API_BASE}/api/Metadata/getData`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log('data', resp.data);
      const data: Letter[] = resp.data || [];
      // normalize IsRead
      const normalized = data.map((d) => ({
        ...d,
        IsRead: typeof d.IsRead === "number" ? d.IsRead : d.Status === "Read" ? 1 : d.Status === "Unread" ? 0 : d.IsRead ?? 0,
      }));
      setLetters(normalized);
      setPage(pageNumber);
    } catch (err) {
      console.error("Fetch page error:", err);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch counts using getViewCount
  const fetchCountForFilter = async (filter: string) => {
    try {
      const payload = {
        viewName: `dbo.UserLetters(${USER_ID})`,
        filter,
        timeout: 0,
      };
      console.log('fetch count',filter, payload);
      const resp = await axios.post(`${API_BASE}/api/Metadata/getViewCount`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log('fetch all count response', Number(resp.data?.count ?? 0));
      return Number(resp.data?.count ?? 0);
    } catch (err) {
      console.warn("Count fetch failed", err);
      return 0;
    }
  };

  // load counts + initial page
  const loadCountsAndPage = async (currentTab = tab) => {
    setLoading(true);
    try {
      // counts
      const [allC, unreadC, archiveC] = await Promise.all([
        fetchCountForFilter("  AND Status <> 'Archive'"),
        fetchCountForFilter("  AND Status = 'Unread'"),
        fetchCountForFilter("  AND Status = 'Archive'"),
      ]);
      setCountAll(allC);
      setCountUnread(unreadC);
      setCountArchive(archiveC);

      // set totalCount based on active tab
      if (currentTab === "all") setTotalCount(allC);
      else if (currentTab === "unread") setTotalCount(unreadC);
      else setTotalCount(archiveC);

      // fetch page 1 for tab
      await fetchPage(1, currentTab, pageSize);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load & whenever tab or pageSize changes
    (async () => {
      await loadCountsAndPage(tab);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, pageSize]);

  // client-side filtered view of current page results
  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      const dateOk = filterDate ? l.DateCreated?.includes(filterDate) : true;
      const senderOk = filterSender ? l.Sender?.toLowerCase().includes(filterSender.toLowerCase()) : true;
      const subjOk = filterSubject ? l.Subject?.toLowerCase().includes(filterSubject.toLowerCase()) : true;
      return dateOk && senderOk && subjOk;
    });
  }, [letters, filterDate, filterSender, filterSubject]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  // selection helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = (checked: boolean) => {
    if (checked) setSelectedIds(filteredLetters.map((l) => l.Id));
    else setSelectedIds([]);
  };

  // MarkLetter API wrapper (single letter)
  const markLetter = async (letterId: number, markRead: boolean | null, markArchive: boolean | null) => {
    const payload = {
      userId: USER_ID,
      letterId,
      markSent: null,
      markRead,
      markArchive,
    };
    const resp = await axios.post(`${API_BASE}/api/Email/MarkLetter`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return resp.data;
  };

  // batch action via markLetter (parallel)
  const doBatchAction = async (action: "read" | "unread" | "archive" | "restore") => {
    if (!selectedIds.length) {
      alert("Please select at least one email.");
      return;
    }
    setLoading(true);

    // prepare calls
    const calls = selectedIds.map((id) => {
      if (action === "read") return markLetter(id, true, null);
      if (action === "unread") return markLetter(id, false, null);
      if (action === "archive") return markLetter(id, null, true);
      if (action === "restore") return markLetter(id, null, false);
      return Promise.resolve(null);
    });

    // optimistic UI update: update in-memory letters
    const prevLetters = letters;
    const updatedLetters = letters.map((l) =>
      selectedIds.includes(l.Id)
        ? {
            ...l,
            IsRead: action === "read" ? 1 : action === "unread" ? 0 : l.IsRead,
            Status: action === "archive" ? "Archive" : action === "restore" ? (l.IsRead === 1 ? "Read" : "Unread") : l.Status,
            IsArchive: action === "archive" ? 1 : action === "restore" ? 0 : l.IsArchive,
          }
        : l
    );
    setLetters(updatedLetters);

    try {
      await Promise.all(calls);
      // refresh counts & page if archive/restore (items could move between tabs)
      if (action === "archive" || action === "restore") {
        await loadCountsAndPage(tab);
      } else {
        // refresh counts quickly
        const [allC, unreadC, archiveC] = await Promise.all([
          fetchCountForFilter("  AND Status <> 'Archive'"),
          fetchCountForFilter("  AND Status = 'Unread'"),
          fetchCountForFilter("  AND Status = 'Archive'"),
        ]);
        setCountAll(allC);
        setCountUnread(unreadC);
        setCountArchive(archiveC);
        if (tab === "all") setTotalCount(allC);
        if (tab === "unread") setTotalCount(unreadC);
      }
      setSelectedIds([]);
    } catch (err) {
      console.error("Batch action failed:", err);
      alert("Action failed. Please try again.");
      setLetters(prevLetters); // rollback
    } finally {
      setLoading(false);
    }
  };

  // toggle expand row -> mark as read on expand
  const toggleExpand = async (id: number) => {
    const newExpanded = expandedId === id ? null : id;
    setExpandedId(newExpanded);

    // if expanding and letter is unread, mark as read
    if (newExpanded) {
      const letter = letters.find((l) => l.Id === id);
      if (letter && letter.IsRead === 0) {
        // optimistic update
        setLetters((prev) => prev.map((p) => (p.Id === id ? { ...p, IsRead: 1, Status: "Read" } : p)));
        try {
          await markLetter(id, true, null);
          // refresh unread count quickly
          const unreadC = await fetchCountForFilter("  AND Status = 'Unread'");
          setCountUnread(unreadC);
          if (tab === "unread") {
            // if we were on unread tab, the item is now removed; refresh page
            await fetchPage(page, tab, pageSize);
          }
        } catch (err) {
          console.warn("mark read failed", err);
        }
      }
    }
  };

  // page navigation
  const goToPage = (p: number) => {
    if (p < 1 || p > pageCount) return;
    fetchPage(p, tab, pageSize);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-GB");
    } catch {
      return iso;
    }
  };

  const shortPreview = (str: string) => (str ? str.replace(/(<([^>]+)>)/gi, "").slice(0, 240) : "");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Email Notifications</h1>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            setTab("all");
            setSelectedIds([]);
            setExpandedId(null);
          }}
          className={`px-4 py-2 rounded-t ${tab === "all" ? "bg-white border-t border-x border-slate-200" : "bg-slate-100"}`}
        >
          All <span className="text-xs text-slate-600 ml-2">({countAll})</span>
        </button>

        <button
          onClick={() => {
            setTab("unread");
            setSelectedIds([]);
            setExpandedId(null);
          }}
          className={`px-4 py-2 ${tab === "unread" ? "bg-white border-t border-x border-slate-200" : "bg-slate-100"}`}
        >
          Unread <span className="text-xs text-slate-600 ml-2">({countUnread})</span>
        </button>

        <button
          onClick={() => {
            setTab("archive");
            setSelectedIds([]);
            setExpandedId(null);
          }}
          className={`px-4 py-2 ${tab === "archive" ? "bg-white border-t border-x border-slate-200" : "bg-slate-100"}`}
        >
          Archive <span className="text-xs text-slate-600 ml-2">({countArchive})</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {/* Buttons vary by tab */}
          {tab !== "archive" && (
            <>
              <button
                onClick={() => doBatchAction("read")}
                disabled={!selectedIds.length || loading}
                className={`px-3 py-1 rounded text-sm ${selectedIds.length ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}
              >
                Mark as read
              </button>

              <button
                onClick={() => doBatchAction("unread")}
                disabled={!selectedIds.length || loading}
                className={`px-3 py-1 rounded text-sm ${selectedIds.length ? "bg-yellow-600 text-white" : "bg-gray-300 text-gray-500"}`}
              >
                Mark as unread
              </button>

              <button
                onClick={() => doBatchAction("archive")}
                disabled={!selectedIds.length || loading}
                className={`px-3 py-1 rounded text-sm ${selectedIds.length ? "bg-red-600 text-white" : "bg-gray-300 text-gray-500"}`}
              >
                Mark as archive
              </button>
            </>
          )}

          {tab === "archive" && (
            <button
              onClick={() => doBatchAction("restore")}
              disabled={!selectedIds.length || loading}
              className={`px-3 py-1 rounded text-sm ${selectedIds.length ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}
            >
              Restore
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Page size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table + Filters */}
      <div className="overflow-auto bg-white border border-slate-200 rounded">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr className="text-left">
              <th className="p-2 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredLetters.length && filteredLetters.length > 0}
                  onChange={(e) => selectAllVisible(e.target.checked)}
                />
              </th>
              <th className="p-2 w-28">DateCreated</th>
              <th className="p-2 w-40">Sender</th>
              <th className="p-2">Subject</th>
            </tr>

            {/* filter row */}
            <tr className="bg-white">
              <th />
              <th className="p-2">
                <input
                  placeholder="DD/MM or ISO"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </th>
              <th className="p-2">
                <input
                  placeholder="Filter sender"
                  value={filterSender}
                  onChange={(e) => setFilterSender(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </th>
              <th className="p-2">
                <input
                  placeholder="Filter subject"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-xs"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredLetters.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No emails to display.
                </td>
              </tr>
            )}

            {filteredLetters.map((email) => {
              const isUnread = email.IsRead === 0 || email.Status === "Unread";
              const isChecked = selectedIds.includes(email.Id);

              return (
                <React.Fragment key={email.Id}>
                  <tr
                    className={`cursor-pointer border-t hover:bg-slate-50 ${isUnread ? "bg-blue-50" : "bg-white"}`}
                    onClick={(e) => {
                      // prevent row expand when clicking checkbox
                      if ((e.target as HTMLElement).tagName.toLowerCase() !== "input") {
                        toggleExpand(email.Id);
                      }
                    }}
                  >
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(email.Id);
                        }}
                      />
                    </td>

                    <td className="p-2 font-medium text-slate-700">{formatDate(email.DateCreated)}</td>

                    <td className="p-2">
                      <span className={`font-semibold ${isUnread ? "text-blue-700" : "text-slate-700"}`}>{email.Sender}</span>
                    </td>

                    <td
                      className="p-2"
                      onMouseEnter={() => setHoverPreview({ id: email.Id, text: shortPreview(email.Body) })}
                      onMouseLeave={() => setHoverPreview(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`font-semibold ${isUnread ? "text-blue-700" : "text-slate-800"}`}>{email.Subject}</span>
                        </div>

                        <div className="text-xs text-slate-500 ml-4">{isUnread ? "Unread" : ""}</div>
                      </div>

                      {/* small preview */}
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{shortPreview(email.Body)}</div>
                    </td>
                  </tr>

                  {/* expanded body */}
                  {expandedId === email.Id && (
                    <tr>
                      <td colSpan={4} className="p-4 bg-slate-50 border-b">
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: email.Body }} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* hover preview tooltip */}
        {hoverPreview && (
          <div className="fixed bottom-6 right-6 max-w-sm bg-white border rounded shadow-lg p-3 text-xs text-slate-700 z-50">
            <div className="font-semibold mb-1">Preview</div>
            <div>{hoverPreview.text}</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-slate-600">
          Showing page {page} of {pageCount} ({totalCount} items)
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">
            Prev
          </button>

          {/* render page numbers with small window */}
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter((p) => {
              if (pageCount <= 7) return true;
              if (p === 1 || p === pageCount) return true;
              if (Math.abs(p - page) <= 2) return true;
              return false;
            })
            .map((p) => (
              <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 border rounded ${p === page ? "bg-blue-600 text-white" : ""}`}>
                {p}
              </button>
            ))}

          <button onClick={() => goToPage(page + 1)} disabled={page >= pageCount} className="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
