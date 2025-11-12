import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  /** 🔹 Fetch and map API data to FullCalendar events */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await fetch("https://your-api-endpoint.com/api/data");
        const data = [
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 15,
            PartiallyExpiring: 0,
            Expiring: 1,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 16,
            PartiallyExpiring: 0,
            Expiring: 1,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 20,
            PartiallyExpiring: 2,
            Expiring: 0,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 21,
            PartiallyExpiring: 1,
            Expiring: 0,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 23,
            PartiallyExpiring: 4,
            Expiring: 0,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 26,
            PartiallyExpiring: 0,
            Expiring: 1,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 28,
            PartiallyExpiring: 1,
            Expiring: 1,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 29,
            PartiallyExpiring: 1,
            Expiring: 0,
            PartiallyExpired: 0,
            Expired: 0,
          },
          {
            YearNumber: 2025,
            MonthNumber: 11,
            DayNumber: 30,
            PartiallyExpiring: 39,
            Expiring: 9,
            PartiallyExpired: 0,
            Expired: 0,
          },
        ];

        // ✅ FIX: avoid UTC conversion shift
        const mappedEvents: CalendarEvent[] = data.flatMap((item: any, index: number) => {
          const date = `${item.YearNumber}-${String(item.MonthNumber).padStart(2, "0")}-${String(
            item.DayNumber
          ).padStart(2, "0")}`;

          const eventsForDay: CalendarEvent[] = [];

          if (item.Expiring > 0) {
            eventsForDay.push({
              id: `expiring-${index}`,
              title: `Expiring (${item.Expiring})`,
              start: date,
              allDay: true,
              extendedProps: { calendar: "Danger" },
            });
          }

          if (item.PartiallyExpiring > 0) {
            eventsForDay.push({
              id: `partially-expiring-${index}`,
              title: `Partially Expiring (${item.PartiallyExpiring})`,
              start: date,
              allDay: true,
              extendedProps: { calendar: "Warning" },
            });
          }

          return eventsForDay;
        });

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };

    fetchData();
  }, []);

  /** 🔹 Date select handler */
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  /** 🔹 Event click handler */
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  /** 🔹 Add / Update event manually */
  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard | TailAdmin"
        description="Calendar Dashboard with API data"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
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
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
          />
        </div>
      </div>
    </>
  );
};

/** 🔹 Custom event rendering */
const renderEventContent = (eventInfo: any) => {
  const isExpiring = eventInfo.event.title.includes("Expiring");
  const bgColor = isExpiring ? "bg-red-50" : "bg-orange-50";
  const borderColor = isExpiring ? "border-red-500" : "border-orange-500";
  const textColor = isExpiring ? "text-red-700" : "text-orange-700";

  return (
    <div
      className={`flex flex-col items-start justify-center ${bgColor} border-l-4 ${borderColor} rounded-lg px-2 py-1 w-full`}
      style={{ whiteSpace: "normal", wordBreak: "break-word" }}
    >
      <span className={`text-[11px] sm:text-xs font-medium leading-tight ${textColor}`}>
        {eventInfo.event.title}
      </span>
    </div>
  );
};

export default Calendar;
