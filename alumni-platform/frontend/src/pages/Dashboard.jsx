import { useEffect, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CalendarDays, Shield, Users } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

function Dashboard() {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    async function load() {
      const requests = [
        api.get("/announcements"),
        api.get("/events"),
        api.get("/opportunities")
      ];

      if (user?.role === "admin") {
        requests.push(api.get("/admin/overview"));
      }

      const results = await Promise.allSettled(requests);
      setAnnouncements(results[0].status === "fulfilled" ? results[0].value.data : []);
      setEvents(results[1].status === "fulfilled" ? results[1].value.data : []);
      setOpportunities(results[2].status === "fulfilled" ? results[2].value.data : []);

      if (user?.role === "admin" && results[3]?.status === "fulfilled") {
        setAdminStats(results[3].value.data);
      }
    }

    load();
  }, [user?.role]);

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard label="Upcoming events" value={events.length} icon={CalendarDays} tone="blue" />
        <StatCard label="Opportunities" value={opportunities.length} icon={BriefcaseBusiness} tone="green" />
        <StatCard label="Announcements" value={announcements.length} icon={Users} tone="amber" />
        {user?.role === "admin" && (
          <StatCard
            label="Critical alerts"
            value={adminStats?.criticalAlerts ?? 0}
            icon={AlertTriangle}
            tone="red"
          />
        )}
      </section>

      {user?.role === "admin" && adminStats && (
        <section className="panel-row">
          <div className="panel">
            <div className="panel-heading">
              <h2>Institution Snapshot</h2>
            </div>
            <div className="metric-strip">
              <span>{adminStats.totalUsers} users</span>
              <span>{adminStats.alumni} alumni</span>
              <span>{adminStats.students} students</span>
              <span>{adminStats.pendingMentorships} pending mentorships</span>
              <span>{adminStats.blockedIps} blocked IPs</span>
            </div>
          </div>
          <div className="panel security-pulse">
            <Shield size={22} />
            <div>
              <h2>Security Pulse</h2>
              <p>{adminStats.criticalAlerts} severe or critical alerts are awaiting review.</p>
            </div>
          </div>
        </section>
      )}

      <section className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h2>Announcements</h2>
          </div>
          <div className="list-stack">
            {announcements.length ? (
              announcements.slice(0, 5).map((announcement) => (
                <article className="list-item" key={announcement._id}>
                  <strong>{announcement.title}</strong>
                  <p>{announcement.body}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No announcements yet." />
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Upcoming Events</h2>
          </div>
          <div className="list-stack">
            {events.length ? (
              events.slice(0, 5).map((event) => (
                <article className="list-item" key={event._id}>
                  <strong>{event.title}</strong>
                  <p>{new Date(event.date).toLocaleString()} · {event.mode}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No events scheduled." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
