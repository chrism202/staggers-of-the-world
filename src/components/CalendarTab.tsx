import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";

type Day = "friday" | "saturday" | "sunday";
type Event = Doc<"events">;

const DAY_LABELS: Record<Day, string> = {
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const DAY_FULL_LABELS: Record<Day, string> = {
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function CalendarTab() {
  const [selectedDay, setSelectedDay] = useState<Day>("friday");
  const events = useQuery(api.events.list);

  if (events === undefined) {
    return <div className="loading">Loading events...</div>;
  }

  const dayEvents = events
    .filter((e: Event) => e.day === selectedDay)
    .sort((a: Event, b: Event) => a.startTime.localeCompare(b.startTime));

  const formatTime = (start: string, end?: string) => {
    if (end) {
      return `${start} - ${end}`;
    }
    return start;
  };

  return (
    <div className="tab-content calendar-tab">
      <div className="day-selector">
        {(["friday", "saturday", "sunday"] as Day[]).map((day) => (
          <button
            key={day}
            className={`day-tab ${selectedDay === day ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>

      <h2 className="day-heading">{DAY_FULL_LABELS[selectedDay]}</h2>

      <div className="timeline">
        {dayEvents.length === 0 ? (
          <p className="no-events">No events scheduled for {DAY_FULL_LABELS[selectedDay]}</p>
        ) : (
          dayEvents.map((event: Event) => (
            <div
              key={event._id}
              className={`event-card ${event.status === "pending" ? "pending" : ""}`}
            >
              <div className="event-time">{formatTime(event.startTime, event.endTime)}</div>
              <div className="event-details">
                <div className="event-title">
                  {event.title}
                  {event.status === "pending" && (
                    <span className="status-badge pending">TBC</span>
                  )}
                </div>
                {event.location && <div className="event-location">{event.location}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CalendarTab;
