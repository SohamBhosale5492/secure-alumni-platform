import { useEffect, useState } from "react";
import { CheckCircle2, GraduationCap, Send } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";

function Mentorship() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [goals, setGoals] = useState("");

  async function load() {
    const [mentorResponse, requestResponse] = await Promise.all([
      api.get("/mentorships/mentors"),
      api.get("/mentorships")
    ]);
    setMentors(mentorResponse.data);
    setRequests(requestResponse.data);
  }

  useEffect(() => {
    load().catch(() => {
      setMentors([]);
      setRequests([]);
    });
  }, []);

  async function submitRequest(event) {
    event.preventDefault();
    await api.post("/mentorships", {
      mentor: selectedMentor,
      goals
    });
    setSelectedMentor("");
    setGoals("");
    await load();
  }

  async function updateStatus(id, status) {
    await api.patch(`/mentorships/${id}/status`, { status });
    await load();
  }

  return (
    <div className="page-stack">
      {user?.role !== "alumni" && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Request Mentorship</h2>
          </div>
          <form className="form-grid" onSubmit={submitRequest}>
            <select
              className="form-select"
              value={selectedMentor}
              onChange={(event) => setSelectedMentor(event.target.value)}
              required
            >
              <option value="">Select mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.username} · {mentor.jobTitle || mentor.company || "Alumni mentor"}
                </option>
              ))}
            </select>
            <textarea
              className="form-control grid-span"
              value={goals}
              onChange={(event) => setGoals(event.target.value)}
              placeholder="Career goals, preferred topics, and expectations"
              required
            />
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
              <Send size={16} />
              Request
            </button>
          </form>
        </section>
      )}

      <section className="two-column">
        <div className="panel">
          <div className="panel-heading">
            <h2>Available Mentors</h2>
          </div>
          <div className="list-stack">
            {mentors.length ? (
              mentors.map((mentor) => (
                <article className="list-item" key={mentor._id}>
                  <strong>{mentor.username}</strong>
                  <p>{mentor.jobTitle || "Alumni"} {mentor.company ? `at ${mentor.company}` : ""}</p>
                  <div className="pill-row">
                    {(mentor.mentorshipTopics || []).slice(0, 3).map((topic) => (
                      <span key={topic}>{topic}</span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No mentors are listed." />
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Requests</h2>
          </div>
          <div className="list-stack">
            {requests.length ? (
              requests.map((request) => (
                <article className="list-item" key={request._id}>
                  <strong>
                    <GraduationCap size={17} />
                    {request.student?.username} to {request.mentor?.username}
                  </strong>
                  <p>{request.goals}</p>
                  <div className="resource-footer">
                    <span className={`status-badge status-${request.status}`}>{request.status}</span>
                    {(user?.role === "admin" || user?.id === request.mentor?._id) && (
                      <button
                        className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-2"
                        type="button"
                        onClick={() => updateStatus(request._id, "approved")}
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No mentorship requests." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Mentorship;
