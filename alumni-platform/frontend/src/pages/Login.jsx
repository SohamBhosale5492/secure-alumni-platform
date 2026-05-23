import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", captchaToken: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      setSession(data.token, data.user);
      navigate("/");
    } catch (requestError) {
      const response = requestError.response?.data;
      setError(response?.message || "Login failed.");

      if (response?.actionTaken) {
        setNotice(`Security action: ${response.actionTaken}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-badge">
          <ShieldCheck size={24} />
        </div>
        <h1>Secure Alumni</h1>
        <p className="muted-text">Access the alumni workspace and security operations console.</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {notice && <div className="alert alert-warning py-2">{notice}</div>}

        <form className="stacked-form" onSubmit={handleSubmit}>
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
              required
            />
          </label>
          <label>
            CAPTCHA token
            <input
              className="form-control"
              value={form.captchaToken}
              onChange={(event) => setForm({ ...form, captchaToken: event.target.value })}
              placeholder="Required after repeated failures"
            />
          </label>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/register">Create an account</Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
