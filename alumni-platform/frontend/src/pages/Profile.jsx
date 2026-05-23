import { useEffect, useState } from "react";
import { Save, UploadCloud } from "lucide-react";
import api, { assetUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/users/me/profile").then(({ data }) => setProfile(data));
  }, []);

  if (!profile) {
    return <div className="panel">Loading profile...</div>;
  }

  function update(field, value) {
    setProfile({ ...profile, [field]: value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    const payload = {
      username: profile.username,
      company: profile.company,
      jobTitle: profile.jobTitle,
      location: profile.location,
      linkedIn: profile.linkedIn || undefined,
      website: profile.website || undefined,
      bio: profile.bio,
      skills: typeof profile.skills === "string" ? profile.skills.split(",").map((item) => item.trim()) : profile.skills,
      isMentor: profile.isMentor,
      mentorshipTopics:
        typeof profile.mentorshipTopics === "string"
          ? profile.mentorshipTopics.split(",").map((item) => item.trim())
          : profile.mentorshipTopics
    };
    const { data } = await api.put("/users/me/profile", payload);
    setProfile(data);
    await refreshUser();
    setMessage("Profile saved.");
  }

  async function uploadFile(event, endpoint, fieldName) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const data = new FormData();
    data.append(fieldName, file);
    await api.post(endpoint, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const response = await api.get("/users/me/profile");
    setProfile(response.data);
    await refreshUser();
    setMessage("File uploaded.");
  }

  return (
    <div className="page-stack">
      <section className="panel profile-panel">
        <div>
          <img
            className="profile-avatar"
            src={assetUrl(profile.profileImage) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}`}
            alt=""
          />
          <h2>{profile.username}</h2>
          <p className="muted-text">{profile.email}</p>
        </div>
        <div className="upload-actions">
          <label className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <UploadCloud size={16} />
            Image
            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadFile(event, "/uploads/profile-image", "profileImage")}
            />
          </label>
          <label className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
            <UploadCloud size={16} />
            Resume
            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => uploadFile(event, "/uploads/resume", "resume")}
            />
          </label>
        </div>
      </section>

      {message && <div className="alert alert-success py-2">{message}</div>}

      <section className="panel">
        <form className="form-grid" onSubmit={saveProfile}>
          <input
            className="form-control"
            value={profile.username || ""}
            onChange={(event) => update("username", event.target.value)}
            placeholder="Name"
          />
          <input
            className="form-control"
            value={profile.company || ""}
            onChange={(event) => update("company", event.target.value)}
            placeholder="Company"
          />
          <input
            className="form-control"
            value={profile.jobTitle || ""}
            onChange={(event) => update("jobTitle", event.target.value)}
            placeholder="Job title"
          />
          <input
            className="form-control"
            value={profile.location || ""}
            onChange={(event) => update("location", event.target.value)}
            placeholder="Location"
          />
          <input
            className="form-control"
            value={profile.linkedIn || ""}
            onChange={(event) => update("linkedIn", event.target.value)}
            placeholder="LinkedIn URL"
          />
          <input
            className="form-control"
            value={profile.website || ""}
            onChange={(event) => update("website", event.target.value)}
            placeholder="Website URL"
          />
          <textarea
            className="form-control grid-span"
            value={profile.bio || ""}
            onChange={(event) => update("bio", event.target.value)}
            placeholder="Bio"
          />
          <input
            className="form-control"
            value={(profile.skills || []).join ? (profile.skills || []).join(", ") : profile.skills}
            onChange={(event) => update("skills", event.target.value)}
            placeholder="Skills"
          />
          <input
            className="form-control"
            value={
              (profile.mentorshipTopics || []).join
                ? (profile.mentorshipTopics || []).join(", ")
                : profile.mentorshipTopics
            }
            onChange={(event) => update("mentorshipTopics", event.target.value)}
            placeholder="Mentorship topics"
          />
          <label className="toggle-row grid-span">
            <input
              type="checkbox"
              checked={Boolean(profile.isMentor)}
              onChange={(event) => update("isMentor", event.target.checked)}
            />
            Available as mentor
          </label>
          <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
            <Save size={16} />
            Save
          </button>
        </form>
      </section>
    </div>
  );
}

export default Profile;
