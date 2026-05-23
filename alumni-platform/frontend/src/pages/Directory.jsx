import { useEffect, useState } from "react";
import { Search, UserRoundCheck } from "lucide-react";
import api, { assetUrl } from "../services/api";
import EmptyState from "../components/EmptyState";

function Directory() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "alumni", mentor: false });

  useEffect(() => {
    async function loadUsers() {
      const { data } = await api.get("/users/directory", {
        params: {
          search: filters.search || undefined,
          role: filters.role || undefined,
          mentor: filters.mentor || undefined
        }
      });
      setUsers(data);
    }

    loadUsers().catch(() => setUsers([]));
  }, [filters]);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Alumni Directory</h2>
            <p className="muted-text mb-0">Search by name, company, role, skill, or mentor status.</p>
          </div>
          <div className="filter-row">
            <div className="input-with-icon">
              <Search size={16} />
              <input
                className="form-control"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search"
              />
            </div>
            <select
              className="form-select"
              value={filters.role}
              onChange={(event) => setFilters({ ...filters, role: event.target.value })}
            >
              <option value="">All roles</option>
              <option value="alumni">Alumni</option>
              <option value="student">Students</option>
            </select>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={filters.mentor}
                onChange={(event) => setFilters({ ...filters, mentor: event.target.checked })}
              />
              Mentors
            </label>
          </div>
        </div>
      </section>

      <section className="directory-grid">
        {users.length ? (
          users.map((person) => (
            <article className="person-card" key={person._id}>
              <img
                src={assetUrl(person.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.username)}`}
                alt=""
              />
              <div>
                <h3>{person.username}</h3>
                <p>{person.jobTitle || person.role} {person.company ? `at ${person.company}` : ""}</p>
                <div className="pill-row">
                  <span>{person.role}</span>
                  {person.isMentor && (
                    <span className="pill-success">
                      <UserRoundCheck size={14} />
                      Mentor
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No matching people found." />
        )}
      </section>
    </div>
  );
}

export default Directory;
