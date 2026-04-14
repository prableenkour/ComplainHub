import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      alert("Registration successful");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b0f1a;
          font-family: 'Sora', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background blobs */
        .reg-root::before {
          content: '';
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -120px;
          right: -100px;
          pointer-events: none;
        }
        .reg-root::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          pointer-events: none;
        }

        .reg-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08),
            0 32px 64px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.07);
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top accent line */
        .reg-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, #10b981, transparent);
          border-radius: 999px;
        }

        .reg-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .reg-title {
          font-size: 1.85rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.15;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }

        .reg-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .reg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: fieldIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .reg-field:nth-child(1) { animation-delay: 0.08s; }
        .reg-field:nth-child(2) { animation-delay: 0.14s; }
        .reg-field:nth-child(3) { animation-delay: 0.20s; }

        @keyframes fieldIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .reg-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        .reg-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 0.92rem;
          font-family: 'Sora', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .reg-input::placeholder { color: #475569; }
        .reg-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .reg-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.18);
        }

        .reg-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          font-size: 0.92rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          letter-spacing: 0.01em;
          animation: fieldIn 0.4s 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5);
        }
        .reg-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .reg-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .reg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .reg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 1.25rem 0 0;
        }
        .reg-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .reg-divider-text {
          font-size: 0.72rem;
          color: #475569;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        .reg-login-link {
          display: block;
          text-align: center;
          margin-top: 1rem;
          font-size: 0.84rem;
          color: #64748b;
        }
        .reg-login-link a {
          color: #818cf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .reg-login-link a:hover { color: #a5b4fc; text-decoration: underline; }
      `}</style>

      <div className="reg-root">
        <div className="reg-card">
          <div className="reg-badge">
            <span>✦</span> New Account
          </div>

          <h2 className="reg-title">Create your account</h2>
          <p className="reg-subtitle">Join the complaint management system</p>

          <form onSubmit={handleRegister} className="reg-form">
            <div className="reg-field">
              <label className="reg-label">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="reg-input"
                autoComplete="name"
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="reg-input"
                autoComplete="email"
              />
            </div>

            <div className="reg-field">
              <label className="reg-label">Password</label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="reg-input"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className="reg-btn">
              {loading ? (
                <><span className="reg-spinner"></span> Creating account…</>
              ) : (
                <>Create Account →</>
              )}
            </button>
          </form>

          <div className="reg-divider">
            <div className="reg-divider-line"></div>
            <span className="reg-divider-text">already have one?</span>
            <div className="reg-divider-line"></div>
          </div>

          <p className="reg-login-link">
            <Link to="/">Sign in to your account</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;