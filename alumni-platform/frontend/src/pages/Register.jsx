import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldPlus } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", form);
      setSession(data.token, data.user);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-badge">
          <ShieldPlus size={24} />
        </div>
        <h1>Create Account</h1>
        <p className="muted-text">The first registered account is automatically assigned admin access.</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              className="form-control"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              minLength={3}
              required
            />
          </label>
          <label>
            Email
            <input
              className="form-control"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              className="form-control"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              minLength={8}
              required
            />
          </label>
          <label>
            Role
            <select
              className="form-select"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </label>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;
