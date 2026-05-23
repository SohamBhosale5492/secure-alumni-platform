import { useEffect, useState } from "react";
import { CalendarPlus, UserPlus } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";

function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    mode: "offline",
    location: ""
  });

  async function loadEvents() {
    const { data } = await api.get("/events");
    setEvents(data);
  }

  useEffect(() => {
    loadEvents().catch(() => setEvents([]));
  }, []);

  async function createEvent(event) {
    event.preventDefault();
    await api.post("/events", form);
    setForm({ title: "", description: "", date: "", mode: "offline", location: "" });
    await loadEvents();
  }

  async function register(eventId) {
    await api.post(`/events/${eventId}/register`);
    await loadEvents();
  }

  return (
    <div className="page-stack">
      {user?.role === "admin" && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Create Event</h2>
          </div>
          <form className="form-grid" onSubmit={createEvent}>
            <input
              className="form-control"
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
            <input
              className="form-control"
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
            />
            <select
              className="form-select"
              value={form.mode}
              onChange={(event) => setForm({ ...form, mode: event.target.value })}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input
              className="form-control"
              placeholder="Location or link"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
            />
            <textarea
              className="form-control grid-span"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
              <CalendarPlus size={16} />
              Create
            </button>
          </form>
        </section>
      )}

      <section className="resource-grid">
        {events.length ? (
          events.map((item) => (
            <article className="resource-card" key={item._id}>
              <div>
                <span className="resource-kicker">{item.mode}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="resource-footer">
                <span>{new Date(item.date).toLocaleString()}</span>
                <button
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                  type="button"
                  onClick={() => register(item._id)}
                >
                  <UserPlus size={15} />
                  Register
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No events available." />
        )}
      </section>
    </div>
  );
}

export default Events;
