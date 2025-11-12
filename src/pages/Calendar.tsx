import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { useSelector } from "react-redux";
import PageMeta from "../components/common/PageMeta";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  extendedProps: {
    calendar: string;
  };
}

const TABS = [
  { id: 1, label: "About to expire" },
  { id: 2, label: "Expired" },
  { id: 3, label: "Manual" },
  { id: 4, label: "Error" },
  { id: 0, label: "All" },
];

const Calendar: React.FC = () => {
  const user = useSelector((state: any) => state.user.users);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const calendarRef = useRef<FullCalendar>(null);
  const [loading, setLoading] = useState(false);

  /** 🔹 Fetch data dynamically */
  const fetchData = async (year: number, month: number, tabId: number) => {
    try {
      setLoading(true);
      const payload = {
        viewName: `dbo.ExpiredPriceListsCal(${user.userId}, ${tabId})`,
        sortBy: "",
        sortByDirection: "",
        filter: `AND YearNumber = ${year} AND MonthNumber = ${month}`,
        fieldList: "*",
        timeout: 0,
      };

      const response = await axios.post(
        `https://10.2.6.130:5000/api/Metadata/getData`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // 🧠 Dynamic mapping logic
      const mappedEvents: CalendarEvent[] = data.flatMap((item: any, index: number) => {
        const date = `${item.YearNumber}-${String(item.MonthNumber).padStart(2, "0")}-${String(
          item.DayNumber
        ).padStart(2, "0")}`;

        const eventsForDay: CalendarEvent[] = [];

        // 🔹 Handle "About to expire" data
        if (item.Expiring > 0) {
          eventsForDay.push({
            id: `expiring-${index}`,
            title: `Expiring (${item.Expiring})`,
            start: date,
            allDay: true,
            extendedProps: { calendar: "Expiring" },
          });
        }
        if (item.PartiallyExpiring > 0) {
          eventsForDay.push({
            id: `partially-expiring-${index}`,
            title: `Partially Expiring (${item.PartiallyExpiring})`,
            start: date,
            allDay: true,
            extendedProps: { calendar: "PartiallyExpiring" },
          });
        }

        // 🔹 Handle "Expired" data
        if (item.Expired > 0) {
          eventsForDay.push({
            id: `expired-${index}`,
            title: `Expired (${item.Expired})`,
            start: date,
            allDay: true,
            extendedProps: { calendar: "Expired" },
          });
        }
        if (item.PartiallyExpired > 0) {
          eventsForDay.push({
            id: `partially-expired-${index}`,
            title: `Partially Expired (${item.PartiallyExpired})`,
            start: date,
            allDay: true,
            extendedProps: { calendar: "PartiallyExpired" },
          });
        }

        // 🔹 You can extend this for Manual, Error, All when data formats are known.

        return eventsForDay;
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Handle month navigation */
  const handleDatesSet = (arg: any) => {
    const currentDate = arg.view.currentStart;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    fetchData(year, month, activeTab);
  };

  /** 🔹 Initial fetch */
  useEffect(() => {
    const today = new Date();
    fetchData(today.getFullYear(), today.getMonth() + 1, activeTab);
  }, [user.userId, activeTab]);

  return (
    <>
      <PageMeta title="Calendar Tabs | Expiry Tracker" description="Calendar with Expiry Categories" />
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        {/* Tabs Header */}
        <div className="flex border-b border-gray-300 mb-4 space-x-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border border-gray-300 
                ${
                  activeTab === tab.id
                    ? "bg-white border-b-0 text-orange-600 font-semibold shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 text-gray-600">
              Loading events...
            </div>
          )}

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "",
            }}
            events={events}
            datesSet={handleDatesSet}
            eventContent={renderEventContent}
          />
        </div>
      </div>
    </>
  );
};

/** 🔹 Custom event rendering */
const renderEventContent = (eventInfo: any) => {
  const title = eventInfo.event.title || "";
  const type = eventInfo.event.extendedProps.calendar;

  // 🎨 Dynamic color per type
  const colorMap: Record<string, string> = {
    Expiring: "#b8abdd",
    PartiallyExpiring: "#9dc3e6",
    Expired: "#b8abdd",
    PartiallyExpired: "#9dc3e6",
  };

  const bgColor = colorMap[type] || "#666";
  const textColor = "#ffffff";

  return (
    <div
      className="flex flex-col items-start justify-center rounded-md px-2 py-1 w-full shadow-sm"
      style={{
        whiteSpace: "normal",
        wordBreak: "break-word",
        backgroundColor: bgColor,
      }}
    >
      <span
        className="text-[12px] sm:text-[13px] leading-tight tracking-tight"
        style={{
          color: textColor,
          fontWeight: 700,
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default Calendar;
