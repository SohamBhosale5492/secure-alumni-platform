import { useEffect, useState } from "react";
import { BriefcaseBusiness, Send } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";

function Opportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState({
    title: "",
    type: "internship",
    company: "",
    location: "",
    description: "",
    applicationUrl: ""
  });

  async function load() {
    const { data } = await api.get("/opportunities");
    setOpportunities(data);
  }

  useEffect(() => {
    load().catch(() => setOpportunities([]));
  }, []);

  async function createOpportunity(event) {
    event.preventDefault();
    await api.post("/opportunities", form);
    setForm({
      title: "",
      type: "internship",
      company: "",
      location: "",
      description: "",
      applicationUrl: ""
    });
    await load();
  }

  async function apply(id) {
    await api.post(`/opportunities/${id}/apply`, { note: "Interested in this opportunity." });
    await load();
  }

  return (
    <div className="page-stack">
      {(user?.role === "alumni" || user?.role === "admin") && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Post Opportunity</h2>
          </div>
          <form className="form-grid" onSubmit={createOpportunity}>
            <input
              className="form-control"
              placeholder="Title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
            <input
              className="form-control"
              placeholder="Company"
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              required
            />
            <select
              className="form-select"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="internship">Internship</option>
              <option value="job">Job</option>
            </select>
            <input
              className="form-control"
              placeholder="Location"
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
              <BriefcaseBusiness size={16} />
              Publish
            </button>
          </form>
        </section>
      )}

      <section className="resource-grid">
        {opportunities.length ? (
          opportunities.map((item) => (
            <article className="resource-card" key={item._id}>
              <div>
                <span className="resource-kicker">{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="resource-footer">
                <span>{item.company} · {item.location || "Remote"}</span>
                {user?.role !== "alumni" && (
                  <button
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                    type="button"
                    onClick={() => apply(item._id)}
                  >
                    <Send size={15} />
                    Apply
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No opportunities posted." />
        )}
      </section>
    </div>
  );
}

export default Opportunities;
