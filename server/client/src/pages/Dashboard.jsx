import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { api } from "../services/api.js";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "" });

  // === Load Data ===
  async function load() {
    try {
      const evs = await api.get("/events", token);
      setEvents(evs || []);
    } catch (err) {
      console.error("Load failed:", err);
      toast.error(err.message || "Failed to load events");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Optional: Auto-refresh events every few seconds
  useEffect(() => {
    const interval = setInterval(() => load(), 7000);
    return () => clearInterval(interval);
  }, []);

  // === Create Event ===
  async function createEvent(e) {
    e.preventDefault();
    try {
      await api.post("/events", form, token);
      toast.success(`"${form.title}" added to your calendar`);
      setShowAddModal(false);
      setForm({ title: "", startTime: "", endTime: "" });
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to create event");
    }
  }

  // === Toggle Event Status ===
  async function toggleStatus(ev) {
    const newStatus = ev.status === "SWAPPABLE" ? "BUSY" : "SWAPPABLE";
    try {
      await api.put(`/events/${ev._id}`, { status: newStatus }, token);
      if (newStatus === "SWAPPABLE") {
        toast.success(`"${ev.title}" marked as swappable`);
      } else {
        toast(`"${ev.title}" set back to busy`, { icon: "🟦" });
      }
      setSelectedEvent(null);
      await load();
    } catch (err) {
      toast.error("Failed to update status");
    }
  }

  // === Delete Event ===
  async function deleteEvent(ev) {
    if (!window.confirm(`Delete "${ev.title}"?`)) return;
    try {
      await api.del(`/events/${ev._id}`, token);
      toast.success(`"${ev.title}" deleted`);
      setSelectedEvent(null);
      await load();
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  // === Calendar Logic ===
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const weeks = [];
  let dayCount = 1 - startDay;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(year, month, dayCount);
      week.push(d);
      dayCount++;
    }
    weeks.push(week);
  }

  const eventDays = events.reduce((map, ev) => {
    const day = new Date(ev.startTime).getDate();
    if (!map[day]) map[day] = [];
    map[day].push(ev);
    return map;
  }, {});

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="container">
      <Toaster />
      <div className="page-header">
        <h1>My Calendar</h1>
        <div>
          <button
            className="btn-ghost"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            ◀ Prev
          </button>
          <button
            className="btn-ghost"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            Next ▶
          </button>
        </div>
      </div>

      <h2 className="text-center">
        {monthNames[month]} {year}
      </h2>

      {/* === CALENDAR === */}
      <div className="card">
        <div className="calendar-grid">
          <div className="calendar-header">
            {dayNames.map((d) => (
              <div key={d} className="calendar-day-name">
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="calendar-week">
              {week.map((day, di) => {
                const isCurrentMonth = day.getMonth() === month;
                const dayNum = day.getDate();
                const evs = eventDays[dayNum] || [];
                return (
                  <div
                    key={di}
                    className={`calendar-cell ${isCurrentMonth ? "" : "faded"}`}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setSelectedDay(day);
                        setForm({
                          title: "",
                          startTime: day.toISOString(),
                          endTime: day.toISOString(),
                        });
                        setShowAddModal(true);
                      }
                    }}
                  >
                    <div className="calendar-date">{dayNum}</div>
                    {evs.map((ev) => (
                      <div
                        key={ev._id}
                        className={`event-tag ${
                          ev.status === "SWAPPABLE"
                            ? "swappable"
                            : ev.status === "SWAP_PENDING"
                            ? "pending"
                            : ""
                        }`}
                        title={ev.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* === EVENT MODAL === */}
      {selectedEvent && (
        <div className="modal">
          <div className="card">
            <h3>{selectedEvent.title}</h3>
            <p className="muted">
              {new Date(selectedEvent.startTime).toLocaleString()}
            </p>
            <p>Status: {selectedEvent.status}</p>
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={() => toggleStatus(selectedEvent)}
              >
                {selectedEvent.status === "SWAPPABLE"
                  ? "Set Busy"
                  : "Make Swappable"}
              </button>
              <button
                className="btn-danger"
                onClick={() => deleteEvent(selectedEvent)}
              >
                Delete
              </button>
              <button
                className="btn-ghost"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ADD EVENT MODAL === */}
      {showAddModal && (
        <div className="modal">
          <div className="card">
            <h3>Add Event</h3>
            <form onSubmit={createEvent}>
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
              <div className="muted" style={{ marginBottom: 8 }}>
                Date: {selectedDay?.toDateString()}
              </div>
              <button className="btn" type="submit">
                Create
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
