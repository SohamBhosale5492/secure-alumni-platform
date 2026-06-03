import { useEffect, useState } from "react";
import { CalendarCheck, Save, Unlock, Users } from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [overview, setOverview] = useState(null);
  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
    audience: "all"
  });

  async function load() {
    const [usersResponse, overviewResponse, eventsResponse] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/overview"),
      api.get("/events")
    ]);

    setUsers(usersResponse.data);
    setOverview(overviewResponse.data);
    setEvents(eventsResponse.data);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function updateUser(id, updates) {
    await api.patch(`/admin/users/${id}`, updates);
    await load();
  }

  async function unblockUser(id) {
    await api.post(`/admin/users/${id}/unblock`);
    await load();
  }

  async function publishAnnouncement(event) {
    event.preventDefault();
    await api.post("/announcements", announcement);
    setAnnouncement({ title: "", body: "", audience: "all" });
  }

  return (
    <div className="page-stack">
      {overview && (
        <section className="metric-strip admin-strip">
          <span>{overview.totalUsers} users</span>
          <span>{overview.alumni} alumni</span>
          <span>{overview.students} students</span>
          <span>{overview.opportunities} opportunities</span>
          <span>{overview.blockedIps} blocked IPs</span>
        </section>
      )}

      <section className="panel">
        <div className="panel-heading">
          <h2>Publish Announcement</h2>
        </div>
        <form className="form-grid" onSubmit={publishAnnouncement}>
          <input
            className="form-control"
            value={announcement.title}
            onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })}
            placeholder="Title"
            required
          />
          <select
            className="form-select"
            value={announcement.audience}
            onChange={(event) => setAnnouncement({ ...announcement, audience: event.target.value })}
          >
            <option value="all">All</option>
            <option value="alumni">Alumni</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
          <textarea
            className="form-control grid-span"
            value={announcement.body}
            onChange={(event) => setAnnouncement({ ...announcement, body: event.target.value })}
            placeholder="Message"
            required
          />
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
            <Save size={16} />
            Publish
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Event Registrations</h2>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Registered</th>
                <th>Students / Alumni</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const attendees = Array.isArray(event.attendees) ? event.attendees : [];

                return (
                  <tr key={event._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <CalendarCheck size={16} />
                        <strong>{event.title}</strong>
                      </div>
                    </td>
                    <td>{new Date(event.date).toLocaleString()}</td>
                    <td>
                      <span className="status-badge">
                        <Users size={14} />
                        {event.attendeeCount ?? attendees.length}
                      </span>
                    </td>
                    <td>
                      {attendees.length ? (
                        <div className="registration-chips">
                          {attendees.map((attendee) => (
                            <span key={attendee._id}>
                              {attendee.username}
                              <small>
                                {attendee.email} - {attendee.role}
                              </small>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted-text">No registrations yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!events.length && <EmptyState title="No event registrations yet." />}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>User Management</h2>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Threat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentAdmin = user._id === currentUser?.id;

                return (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span>{user.username}</span>
                      {isCurrentAdmin && <span className="status-badge">Current admin</span>}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.role}
                      onChange={(event) => updateUser(user._id, { role: event.target.value })}
                      disabled={isCurrentAdmin}
                    >
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.status}
                      onChange={(event) => updateUser(user._id, { status: event.target.value })}
                      disabled={isCurrentAdmin}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </td>
                  <td>
                    <span className={user.threatScore > 60 ? "text-danger fw-semibold" : ""}>
                      {user.threatScore}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                      type="button"
                      onClick={() => unblockUser(user._id)}
                      disabled={isCurrentAdmin}
                      title={
                        isCurrentAdmin
                          ? "You cannot block or reset your own admin account."
                          : "Reset user security restrictions"
                      }
                    >
                      <Unlock size={14} />
                      Reset
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {!users.length && <EmptyState title="No users found." />}
        </div>
      </section>
    </div>
  );
}

export default AdminPanel;
