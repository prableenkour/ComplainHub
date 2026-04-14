import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .nb-root {
    position: sticky; top: 0; z-index: 1000;
    background: rgba(11,15,26,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    font-family: 'Sora', sans-serif;
  }

  .nb-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 62px;
  }

  .nb-logo {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; text-decoration: none;
    user-select: none;
  }
  .nb-logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #6366f1, #10b981);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 700; color: #fff;
    font-family: 'JetBrains Mono', monospace;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
    flex-shrink: 0;
  }
  .nb-logo-text {
    font-size: 1.05rem; font-weight: 700;
    color: #f1f5f9; letter-spacing: -0.01em;
    line-height: 1;
  }
  .nb-logo-text span {
    background: linear-gradient(90deg, #6366f1, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nb-right {
    display: flex; align-items: center; gap: 0.75rem;
    position: relative;
  }

  .nb-username {
    font-size: 0.8rem; font-weight: 500; color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    display: none;
  }
  @media(min-width: 640px) { .nb-username { display: block; } }

  /* Avatar button — shared styles for both photo and initials */
  .nb-avatar-btn {
    background: none;
    border: 2px solid rgba(99,102,241,0.35);
    border-radius: 50%;
    width: 38px; height: 38px;
    padding: 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.15s, transform 0.15s;
    flex-shrink: 0;
  }
  .nb-avatar-btn:hover {
    border-color: rgba(99,102,241,0.7);
    transform: scale(1.08);
  }

  /* Photo variant */
  .nb-avatar-photo {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
  }

  /* Initials variant */
  .nb-avatar-initials {
    width: 100%; height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.2));
    display: flex; align-items: center; justify-content: center;
    font-size: 0.78rem; font-weight: 700;
    color: #a5b4fc;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
  }

  /* Dropdown */
  .nb-dropdown {
    position: absolute; right: 0; top: calc(100% + 10px);
    width: 230px;
    background: rgba(17,24,39,0.98);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 0.6rem;
    box-shadow: 0 20px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
    transform-origin: top right;
    transition: opacity 0.18s, transform 0.18s;
    pointer-events: none; opacity: 0; transform: scale(0.95) translateY(-6px);
    z-index: 999;
  }
  .nb-dropdown.open {
    pointer-events: all; opacity: 1; transform: scale(1) translateY(0);
  }
  .nb-dropdown::before {
    content: '';
    position: absolute; top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, #10b981, transparent);
    border-radius: 999px;
  }

  /* Dropdown header with avatar */
  .nb-dd-header {
    padding: 0.6rem 0.6rem 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 0.4rem;
    display: flex; align-items: center; gap: 10px;
  }

  .nb-dd-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(99,102,241,0.3);
    overflow: hidden;
    flex-shrink: 0;
  }
  .nb-dd-avatar img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
  }
  .nb-dd-avatar-initials {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.2));
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700;
    color: #a5b4fc;
    font-family: 'JetBrains Mono', monospace;
  }

  .nb-dd-info { min-width: 0; flex: 1; }
  .nb-dd-name {
    font-size: 0.88rem; font-weight: 700; color: #f1f5f9;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .nb-dd-email {
    font-size: 0.72rem; color: #475569; margin-top: 2px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .nb-dd-btn {
    width: 100%; text-align: left;
    padding: 0.55rem 0.75rem;
    border-radius: 10px;
    border: none; background: none;
    font-size: 0.83rem; font-family: 'Sora', sans-serif;
    color: #94a3b8; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.15s, color 0.15s;
  }
  .nb-dd-btn:hover {
    background: rgba(99,102,241,0.1);
    color: #f1f5f9;
  }
  .nb-dd-btn.logout {
    color: #fca5a5; margin-top: 2px;
  }
  .nb-dd-btn.logout:hover {
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
  }

  .nb-dd-icon { font-size: 14px; }
`;

function Navbar() {
  const [open, setOpen]     = useState(false);
  const [user, setUser]     = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const dropdownRef         = useRef(null);
  const navigate            = useNavigate();

  // Load user + build avatar URL
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      if (storedUser.avatar) {
        setAvatarSrc(`${API_URL}/${storedUser.avatar}`);
      }
    }
  }, []);

  // Re-sync whenever localStorage changes (e.g. after Profile saves)
  useEffect(() => {
    const onStorage = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
        setAvatarSrc(storedUser.avatar ? `${API_URL}/${storedUser.avatar}` : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <style>{STYLES}</style>
      <nav className="nb-root">
        <div className="nb-inner">

          {/* Logo */}
          <div className="nb-logo" onClick={() => navigate("/dashboard")}>
            <div className="nb-logo-icon">CH</div>
            <div className="nb-logo-text">Complain<span>Hub</span></div>
          </div>

          {/* Right side */}
          <div ref={dropdownRef} className="nb-right">
            {user && <span className="nb-username">{user.name}</span>}

            {/* Avatar button */}
            <button
              className="nb-avatar-btn"
              onClick={() => setOpen(!open)}
              aria-label="User menu"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name || "Avatar"}
                  className="nb-avatar-photo"
                  onError={() => setAvatarSrc(null)}
                />
              ) : (
                <div className="nb-avatar-initials">{initials}</div>
              )}
            </button>

            {/* Dropdown */}
            <div className={`nb-dropdown ${open ? "open" : ""}`}>

              {/* Header with mini avatar */}
              <div className="nb-dd-header">
                <div className="nb-dd-avatar">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name || "Avatar"}
                      onError={() => setAvatarSrc(null)}
                    />
                  ) : (
                    <div className="nb-dd-avatar-initials">{initials}</div>
                  )}
                </div>
                <div className="nb-dd-info">
                  <div className="nb-dd-name">{user?.name || "User"}</div>
                  <div className="nb-dd-email">{user?.email || ""}</div>
                </div>
              </div>

              <button
                className="nb-dd-btn"
                onClick={() => { setOpen(false); navigate("/profile"); }}
              >
                <span className="nb-dd-icon">👤</span> View Profile
              </button>

              <button
                className="nb-dd-btn logout"
                onClick={() => { setOpen(false); handleLogout(); }}
              >
                <span className="nb-dd-icon">🚪</span> Logout
              </button>
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}

export default Navbar;