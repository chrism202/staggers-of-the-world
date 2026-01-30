import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id, Doc } from "../../convex/_generated/dataModel";

type Day = "friday" | "saturday" | "sunday";
type Status = "confirmed" | "pending";
type Event = Doc<"events">;

const DAYS: Day[] = ["friday", "saturday", "sunday"];

function AdminPage() {
  const events = useQuery(api.events.list);
  const clearData = useMutation(api.seed.clearData);
  const seedData = useMutation(api.seed.seedData);
  const resetCarAssignments = useMutation(api.seed.resetCarAssignments);
  const reseedEvents = useMutation(api.seed.reseedEvents);
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [editingId, setEditingId] = useState<Id<"events"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDay, setFormDay] = useState<Day>("friday");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formStatus, setFormStatus] = useState<Status>("confirmed");

  const handleClearAndReseed = async () => {
    if (confirm("This will clear all data and reseed with fresh data. Continue?")) {
      await clearData({});
      await seedData({});
    }
  };

  const handleResetCarAssignments = async () => {
    if (confirm("This will unassign all passengers from cars and clear ferry times. Continue?")) {
      await resetCarAssignments({});
    }
  };

  const handleReseedEvents = async () => {
    if (confirm("This will clear all events and reseed with default events. Cars and people will not be affected. Continue?")) {
      await reseedEvents({});
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDay("friday");
    setFormStartTime("");
    setFormEndTime("");
    setFormLocation("");
    setFormStatus("confirmed");
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAddEvent = async () => {
    if (!formTitle.trim() || !formStartTime.trim()) return;
    await createEvent({
      title: formTitle.trim(),
      day: formDay,
      startTime: formStartTime.trim(),
      endTime: formEndTime.trim() || undefined,
      location: formLocation.trim() || undefined,
      status: formStatus,
    });
    resetForm();
  };

  const handleEditEvent = (event: Event) => {
    setEditingId(event._id);
    setFormTitle(event.title);
    setFormDay(event.day);
    setFormStartTime(event.startTime);
    setFormEndTime(event.endTime || "");
    setFormLocation(event.location || "");
    setFormStatus(event.status);
    setShowAddForm(false);
  };

  const handleUpdateEvent = async () => {
    if (!editingId || !formTitle.trim() || !formStartTime.trim()) return;
    await updateEvent({
      id: editingId,
      title: formTitle.trim(),
      day: formDay,
      startTime: formStartTime.trim(),
      endTime: formEndTime.trim() || undefined,
      location: formLocation.trim() || undefined,
      status: formStatus,
    });
    resetForm();
  };

  const handleDeleteEvent = async (id: Id<"events">) => {
    if (confirm("Delete this event?")) {
      await removeEvent({ id });
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const sortedEvents: Event[] = events
    ? [...events].sort((a: Event, b: Event) => {
        const dayOrder: Record<Day, number> = { friday: 0, saturday: 1, sunday: 2 };
        if (dayOrder[a.day] !== dayOrder[b.day]) {
          return dayOrder[a.day] - dayOrder[b.day];
        }
        return a.startTime.localeCompare(b.startTime);
      })
    : [];

  return (
    <div className="admin-container">
      <h1>Admin</h1>
      <a href="/" className="back-link">Back to main app</a>

      <div className="admin-section">
        <h2>Data Management</h2>
        <div className="admin-buttons">
          <button className="admin-button danger" onClick={handleClearAndReseed}>
            Clear & Reseed All Data
          </button>
          <button className="admin-button warning" onClick={handleResetCarAssignments}>
            Reset Car Assignments
          </button>
          <button className="admin-button warning" onClick={handleReseedEvents}>
            Reseed Events Only
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h2>Events</h2>

        {(showAddForm || editingId) && (
          <div className="event-form">
            <h3>{editingId ? "Edit Event" : "Add Event"}</h3>
            <div className="form-row">
              <label>Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Event title"
              />
            </div>
            <div className="form-row">
              <label>Day *</label>
              <select value={formDay} onChange={(e) => setFormDay(e.target.value as Day)}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Start Time *</label>
              <input
                type="text"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                placeholder="18:00"
              />
            </div>
            <div className="form-row">
              <label>End Time</label>
              <input
                type="text"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                placeholder="20:00 (optional)"
              />
            </div>
            <div className="form-row">
              <label>Location</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Location (optional)"
              />
            </div>
            <div className="form-row">
              <label>Status *</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as Status)}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="form-actions">
              {editingId ? (
                <button className="admin-button primary" onClick={handleUpdateEvent}>
                  Save Changes
                </button>
              ) : (
                <button className="admin-button primary" onClick={handleAddEvent}>
                  Add Event
                </button>
              )}
              <button className="admin-button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showAddForm && !editingId && (
          <button className="admin-button primary" onClick={() => setShowAddForm(true)}>
            + Add Event
          </button>
        )}

        <div className="events-list">
          {events === undefined ? (
            <p>Loading...</p>
          ) : sortedEvents.length === 0 ? (
            <p className="no-events">No events. Add one above or reseed data.</p>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event._id}
                className={`event-row ${event.status === "pending" ? "pending" : ""}`}
              >
                <div className="event-info">
                  <span className="event-day">{event.day.slice(0, 3).toUpperCase()}</span>
                  <span className="event-time">
                    {event.startTime}
                    {event.endTime && `-${event.endTime}`}
                  </span>
                  <span className="event-title">{event.title}</span>
                  {event.location && <span className="event-location">@ {event.location}</span>}
                  {event.status === "pending" && (
                    <span className="status-badge pending">TBC</span>
                  )}
                </div>
                <div className="event-actions">
                  <button className="edit-btn" onClick={() => handleEditEvent(event)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteEvent(event._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
