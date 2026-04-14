import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [editMode, setEditMode] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load fresh user data from server on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/me`, authHeaders)
      .then(({ data }) => {
        setUser(data.user);
        setOriginalUser(data.user);
        // Keep localStorage in sync
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        // Fallback to localStorage if request fails
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored) { setUser(stored); setOriginalUser(stored); }
      });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSavingProfile(true);
      const { data } = await axios.put(
        `${API_URL}/api/auth/update-profile`,
        { name: user.name, email: user.email },
        authHeaders
      );
      setUser(data.user);
      setOriginalUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditMode(false);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save changes", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setEditMode(false);
  };

  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("Image must be under 3 MB", "error");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await axios.post(
        `${API_URL}/api/auth/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(data.user);
      setOriginalUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Profile photo updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarChange = (e) => processImageFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processImageFile(e.dataTransfer.files[0]);
  };

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const avatarSrc = user.avatar ? `${API_URL}/${user.avatar}` : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .profile-root {
          min-height: 100vh;
          background: #0b0f1a;
          font-family: 'Sora', sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        .profile-root::before {
          content: '';
          position: fixed;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -120px; right: -100px;
          pointer-events: none; z-index: 0;
        }
        .profile-root::after {
          content: '';
          position: fixed;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          bottom: -80px; left: -80px;
          pointer-events: none; z-index: 0;
        }

        .profile-body {
          position: relative; z-index: 1;
          display: flex; justify-content: center;
          padding: 2.5rem 1.5rem 3rem;
        }

        .profile-card {
          position: relative;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.08), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .profile-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%; height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, #10b981, transparent);
          border-radius: 999px;
        }

        .profile-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 999px;
          margin-bottom: 1.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .avatar-zone {
          display: flex; flex-direction: column;
          align-items: center; margin-bottom: 1.75rem; gap: 0.75rem;
        }

        .avatar-ring {
          position: relative; width: 100px; height: 100px;
          border-radius: 50%; cursor: pointer;
          transition: transform 0.2s;
        }
        .avatar-ring:hover { transform: scale(1.04); }

        .avatar-img {
          width: 100px; height: 100px; border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(99,102,241,0.4);
          display: block;
        }
        .avatar-initials {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(16,185,129,0.15));
          border: 2px solid rgba(99,102,241,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; font-weight: 700;
          color: #a5b4fc; letter-spacing: -0.03em;
        }

        .avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(10,12,24,0.65);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          opacity: 0; transition: opacity 0.2s; pointer-events: none;
        }
        .avatar-ring:hover .avatar-overlay { opacity: 1; }
        .avatar-overlay-text {
          font-size: 0.65rem; font-weight: 600;
          color: #e2e8f0; letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .avatar-uploading {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(10,12,24,0.75);
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-spinner {
          width: 22px; height: 22px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .avatar-drop-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px dashed #6366f1;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 600;
          color: #a5b4fc; text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: 'JetBrains Mono', monospace;
          pointer-events: none;
        }

        .avatar-hint {
          font-size: 0.73rem; color: #475569;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
        }

        .avatar-upload-btn {
          font-size: 0.75rem; font-weight: 600;
          color: #818cf8;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 8px; padding: 5px 14px;
          cursor: pointer; font-family: 'Sora', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .avatar-upload-btn:hover { background: rgba(99,102,241,0.2); color: #a5b4fc; }
        .avatar-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .profile-title {
          font-size: 1.6rem; font-weight: 700;
          color: #f1f5f9; line-height: 1.15;
          margin-bottom: 0.3rem;
          letter-spacing: -0.02em; text-align: center;
        }
        .profile-email-sub {
          font-size: 0.82rem; color: #475569;
          text-align: center; margin-bottom: 1.75rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .profile-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 1.25rem 0;
        }

        .profile-section-label {
          font-size: 0.68rem; font-weight: 600;
          color: #475569; letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.85rem;
        }

        .profile-form { display: flex; flex-direction: column; gap: 1rem; }

        .profile-field { display: flex; flex-direction: column; gap: 6px; }

        .profile-label {
          font-size: 0.75rem; font-weight: 600;
          color: #94a3b8; letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .profile-input {
          width: 100%; padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #f1f5f9;
          font-size: 0.92rem; font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .profile-input::placeholder { color: #475569; }
        .profile-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .profile-input:hover:not(:focus):not(:disabled) {
          border-color: rgba(255,255,255,0.18);
        }
        .profile-input:disabled { opacity: 0.5; cursor: default; }

        .profile-btn-row {
          display: flex; gap: 10px; margin-top: 0.25rem;
        }
        .profile-btn {
          flex: 1; padding: 0.82rem;
          font-size: 0.9rem; font-weight: 600;
          font-family: 'Sora', sans-serif;
          border: none; border-radius: 12px;
          cursor: pointer;
          display: flex; align-items: center;
          justify-content: center; gap: 7px;
          transition: transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.01em;
        }
        .profile-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(16,185,129,0.3);
        }
        .btn-success:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16,185,129,0.45);
        }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
        }
        .btn-ghost:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          color: #cbd5e1;
        }

        .btn-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Toast */
        .toast {
          position: fixed; bottom: 1.5rem; left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px; border-radius: 10px;
          font-size: 0.82rem; font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
          z-index: 9999; white-space: nowrap;
          animation: toastIn 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .toast-success {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.35);
          color: #6ee7b7;
        }
        .toast-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="profile-root">
        <Navbar />

        <div className="profile-body">
          <div className="profile-card">
            <div className="profile-badge"><span>✦</span> Your Account</div>

            {/* Avatar */}
            <div className="avatar-zone">
              <div
                className="avatar-ring"
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-initials">{initials}</div>
                )}

                {uploadingAvatar ? (
                  <div className="avatar-uploading">
                    <div className="avatar-spinner" />
                  </div>
                ) : dragOver ? (
                  <div className="avatar-drop-ring">Drop</div>
                ) : (
                  <div className="avatar-overlay">
                    <span style={{ fontSize: "1.2rem" }}>📷</span>
                    <span className="avatar-overlay-text">Change</span>
                  </div>
                )}
              </div>

              <span className="avatar-hint">click or drag &amp; drop · max 3 MB</span>

              <button
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading…" : "Upload Photo"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <h2 className="profile-title">{user.name || "Your Profile"}</h2>
            <p className="profile-email-sub">{user.email || "no email set"}</p>

            <div className="profile-divider" />
            <p className="profile-section-label">Account Details</p>

            <div className="profile-form">
              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <input
                  type="text" name="name"
                  value={user.name} onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Your full name"
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label className="profile-label">Email Address</label>
                <input
                  type="email" name="email"
                  value={user.email} onChange={handleChange}
                  disabled={!editMode}
                  placeholder="you@example.com"
                  className="profile-input"
                />
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-btn-row">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={savingProfile}
                    className="profile-btn btn-success"
                    type="button"
                  >
                    {savingProfile
                      ? <><span className="btn-spinner" /> Saving…</>
                      : "Save Changes ✓"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={savingProfile}
                    className="profile-btn btn-ghost"
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="profile-btn btn-primary"
                  type="button"
                >
                  Edit Profile →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}

export default Profile;