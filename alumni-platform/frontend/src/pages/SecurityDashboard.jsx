import { useCallback, useEffect, useState } from "react";
import {
  AlertOctagon,
  Ban,
  RadioTower,
  RefreshCcw,
  ShieldAlert,
  UserX
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

const severityColors = {
  Low: "#6ee7b7",
  Medium: "#fbbf24",
  High: "#fb7185",
  Severe: "#f97316",
  Critical: "#ef4444"
};

function SecurityDashboard() {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [charts, setCharts] = useState({
    trends: [],
    distribution: [],
    requestFrequency: []
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    const [statsResponse, logsResponse, alertsResponse, blockedResponse, chartResponse] =
      await Promise.all([
        api.get("/security/stats"),
        api.get("/security/logs", { params: { limit: 50 } }),
        api.get("/security/alerts", { params: { limit: 50 } }),
        api.get("/security/blocked-ips"),
        api.get("/security/charts/threats")
      ]);

    setStats(statsResponse.data);
    setLogs(logsResponse.data);
    setAlerts(alertsResponse.data);
    setBlockedIps(blockedResponse.data);
    setCharts(chartResponse.data);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    load().catch(() => {});
    const interval = window.setInterval(() => {
      load().catch(() => {});
    }, 5000);

    return () => window.clearInterval(interval);
  }, [load]);

  async function simulateAlert() {
    await api.post("/security/simulate-alert", {
      type: "Brute Force Attack",
      severity: "High",
      actionTaken: "Cooldown",
      message: "Demo repeated login failures detected."
    });
    await load();
  }

  async function unblock(ip) {
    await api.delete(`/security/blocked-ips/${encodeURIComponent(ip)}`);
    await load();
  }

  async function acknowledge(id) {
    await api.patch(`/security/alerts/${id}/acknowledge`);
    await load();
  }

  const trendData = charts.trends.map((item) => ({
    name: `${item._id.day} ${item._id.status}`,
    count: item.count
  }));
  const distributionData = charts.distribution.map((item) => ({
    name: item._id,
    count: item.count
  }));
  const frequencyData = charts.requestFrequency.map((item) => ({
    name: item._id.minute,
    count: item.count
  }));

  return (
    <div className="security-console page-stack">
      <section className="security-header">
        <div>
          <p className="eyebrow mb-1">Security operations center</p>
          <h2>Live Threat Monitoring</h2>
          <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Waiting for telemetry"}</span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2"
            type="button"
            onClick={load}
          >
            <RefreshCcw size={15} />
            Refresh
          </button>
          <button
            className="btn btn-danger btn-sm d-inline-flex align-items-center gap-2"
            type="button"
            onClick={simulateAlert}
          >
            <ShieldAlert size={15} />
            Simulate alert
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Total users" value={stats.totalUsers ?? 0} icon={RadioTower} tone="blue" />
        <StatCard label="Failed logins" value={stats.failedLogins ?? 0} icon={UserX} tone="amber" />
        <StatCard label="Blocked IPs" value={stats.blockedIps ?? 0} icon={Ban} tone="red" />
        <StatCard label="Active threats" value={stats.activeThreats ?? 0} icon={AlertOctagon} tone="red" />
      </section>

      <section className="chart-grid">
        <div className="soc-panel">
          <h3>Request Frequency</h3>
          <ResponsiveContainer height={220}>
            <LineChart data={frequencyData}>
              <CartesianGrid stroke="#263347" />
              <XAxis dataKey="name" stroke="#9aa8bd" />
              <YAxis stroke="#9aa8bd" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="soc-panel">
          <h3>Threat Distribution</h3>
          <ResponsiveContainer height={220}>
            <PieChart>
              <Pie data={distributionData} dataKey="count" nameKey="name" innerRadius={52} outerRadius={82}>
                {distributionData.map((entry) => (
                  <Cell key={entry.name} fill={severityColors[entry.name] || "#93c5fd"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="soc-panel wide">
          <h3>Attack Trends</h3>
          <ResponsiveContainer height={240}>
            <BarChart data={trendData}>
              <CartesianGrid stroke="#263347" />
              <XAxis dataKey="name" stroke="#9aa8bd" hide />
              <YAxis stroke="#9aa8bd" />
              <Tooltip />
              <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="two-column">
        <div className="soc-panel">
          <h3>Alerts</h3>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 10).map((alert) => (
                  <tr key={alert._id}>
                    <td>{alert.type}</td>
                    <td>
                      <span className={`severity severity-${alert.severity}`}>{alert.severity}</span>
                    </td>
                    <td>{alert.actionTaken}</td>
                    <td>
                      {!alert.acknowledged && (
                        <button
                          className="btn btn-outline-light btn-sm"
                          type="button"
                          onClick={() => acknowledge(alert._id)}
                        >
                          Ack
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!alerts.length && <EmptyState title="No alerts recorded." />}
          </div>
        </div>

        <div className="soc-panel">
          <h3>Blocked IPs</h3>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>Until</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((blocked) => (
                  <tr key={blocked._id}>
                    <td>{blocked.ip}</td>
                    <td>{new Date(blocked.blockedUntil).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-outline-light btn-sm"
                        type="button"
                        onClick={() => unblock(blocked.ip)}
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!blockedIps.length && <EmptyState title="No blocked IPs." />}
          </div>
        </div>
      </section>

      <section className="soc-panel">
        <h3>Live Activity Feed</h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th>Time</th>
                <th>IP</th>
                <th>Route</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 20).map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td>{log.ip}</td>
                  <td>{log.method} {log.route}</td>
                  <td>{log.status}</td>
                  <td>{log.threatScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <EmptyState title="No telemetry yet." />}
        </div>
      </section>
    </div>
  );
}

export default SecurityDashboard;
