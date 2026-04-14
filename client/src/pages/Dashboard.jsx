import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .db-root {
    min-height: 100vh;
    background: #0b0f1a;
    font-family: 'Sora', sans-serif;
    color: #f1f5f9;
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient blobs */
  .db-root::before {
    content: '';
    position: fixed;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%);
    top: -160px; right: -120px;
    pointer-events: none; z-index: 0;
  }
  .db-root::after {
    content: '';
    position: fixed;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    pointer-events: none; z-index: 0;
  }

  .db-inner {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  /* ── PAGE HEADER */
  .db-page-header {
    margin-bottom: 2rem;
    animation: dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .db-site-badge {
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
    margin-bottom: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }
  .db-page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  .db-page-title span {
    background: linear-gradient(90deg, #6366f1, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .db-page-sub {
    font-size: 0.85rem;
    color: #475569;
    margin-top: 0.35rem;
    font-weight: 400;
  }

  /* ── GLASS CARD */
  .db-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(99,102,241,0.07),
      0 20px 40px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
  }
  .db-card::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(16,185,129,0.4), transparent);
  }

  /* ── STAT CARDS */
  .db-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    animation: dbFadeUp 0.5s 0.05s cubic-bezier(0.22,1,0.36,1) both;
  }
  @media(min-width: 768px) {
    .db-stats-grid { grid-template-columns: repeat(4, 1fr); }
  }
  .db-stat-card {
    padding: 1.25rem 1.5rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .db-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .db-stat-total    { background: rgba(255,255,255,0.04); }
  .db-stat-pending  { background: rgba(234,179,8,0.08);   border-color: rgba(234,179,8,0.2); }
  .db-stat-progress { background: rgba(99,102,241,0.08);  border-color: rgba(99,102,241,0.2); }
  .db-stat-resolved { background: rgba(16,185,129,0.08);  border-color: rgba(16,185,129,0.2); }
  .db-stat-icon { font-size: 1.75rem; line-height: 1; }
  .db-stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'JetBrains Mono', monospace;
  }
  .db-stat-total    .db-stat-value { color: #f1f5f9; }
  .db-stat-pending  .db-stat-value { color: #fde047; }
  .db-stat-progress .db-stat-value { color: #a5b4fc; }
  .db-stat-resolved .db-stat-value { color: #6ee7b7; }
  .db-stat-label {
    font-size: 0.72rem;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 2px;
    color: #64748b;
  }

  /* ── SECTION */
  .db-section { margin-bottom: 1.5rem; }
  .db-section-anim  { animation: dbFadeUp 0.5s 0.10s cubic-bezier(0.22,1,0.36,1) both; }
  .db-section-anim2 { animation: dbFadeUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
  .db-section-anim3 { animation: dbFadeUp 0.5s 0.20s cubic-bezier(0.22,1,0.36,1) both; }

  .db-section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .db-section-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── FORM ELEMENTS */
  .db-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 6px;
  }
  .db-input, .db-select, .db-textarea {
    width: 100%;
    padding: 0.78rem 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #f1f5f9;
    font-size: 0.88rem;
    font-family: 'Sora', sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .db-input::placeholder, .db-textarea::placeholder { color: #475569; }
  .db-input:focus, .db-select:focus, .db-textarea:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.06);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .db-input:hover:not(:focus),
  .db-select:hover:not(:focus),
  .db-textarea:hover:not(:focus) { border-color: rgba(255,255,255,0.18); }
  .db-select option { background: #1e293b; color: #f1f5f9; }
  .db-textarea { resize: none; }

  .db-grid-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media(min-width: 640px) { .db-grid-2 { grid-template-columns: 1fr 1fr; } }

  .db-char-count {
    position: absolute;
    bottom: 10px; right: 12px;
    font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace;
    color: #475569;
    pointer-events: none;
  }
  .db-char-count.warn { color: #f87171; }

  /* ── BUTTONS */
  .db-btn-primary {
    padding: 0.78rem 2rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #fff;
    font-size: 0.88rem;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  }
  .db-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(99,102,241,0.5);
  }
  .db-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .db-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .db-btn-loc {
    padding: 0.78rem 1.25rem;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
    font-size: 0.82rem;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .db-btn-loc:hover:not(:disabled) {
    background: rgba(99,102,241,0.25);
    border-color: rgba(99,102,241,0.5);
  }
  .db-btn-loc:disabled { opacity: 0.6; cursor: not-allowed; }

  .db-btn-admin {
    padding: 0.78rem 1.5rem;
    background: rgba(139,92,246,0.15);
    border: 1px solid rgba(139,92,246,0.3);
    color: #c4b5fd;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    border-radius: 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .db-btn-admin:hover {
    background: rgba(139,92,246,0.25);
    border-color: rgba(139,92,246,0.5);
  }

  /* ── CONTROLS ROW */
  .db-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .db-controls .db-select { width: auto; min-width: 150px; }

  /* ── COMPLAINT CARDS */
  .db-complaints-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media(min-width: 640px)  { .db-complaints-grid { grid-template-columns: repeat(2, 1fr); } }
  @media(min-width: 1024px) { .db-complaints-grid { grid-template-columns: repeat(3, 1fr); } }

  .db-complaint-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.25rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    position: relative;
    overflow: hidden;
  }
  .db-complaint-card::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .db-complaint-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
    border-color: rgba(99,102,241,0.25);
  }
  .db-complaint-card:hover::before { opacity: 1; }

  .db-complaint-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    transition: color 0.15s;
  }
  .db-complaint-card:hover .db-complaint-title { color: #a5b4fc; }

  .db-complaint-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0.4rem 0 0.75rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5;
  }

  .db-meta {
    font-size: 0.72rem;
    color: #475569;
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 3px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* ── TAGS */
  .db-tag {
    display: inline-block;
    font-size: 0.68rem;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 3px 10px;
    border-radius: 999px;
  }
  .db-tag-category { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc; }
  .db-tag-pending  { background: rgba(234,179,8,0.12);   border: 1px solid rgba(234,179,8,0.25);   color: #fde047; }
  .db-tag-progress { background: rgba(99,102,241,0.12);  border: 1px solid rgba(99,102,241,0.25);  color: #a5b4fc; }
  .db-tag-resolved { background: rgba(16,185,129,0.12);  border: 1px solid rgba(16,185,129,0.25);  color: #6ee7b7; }
  .db-tag-default  { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);  color: #94a3b8; }

  /* ── CARD ACTION BUTTONS */
  .db-card-actions { display: flex; gap: 6px; }
  .db-btn-edit {
    font-size: 0.7rem; padding: 4px 10px;
    background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.25); color: #fde047;
    border-radius: 8px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
    transition: background 0.15s;
  }
  .db-btn-edit:hover { background: rgba(234,179,8,0.2); }
  .db-btn-del {
    font-size: 0.7rem; padding: 4px 10px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5;
    border-radius: 8px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
    transition: background 0.15s;
  }
  .db-btn-del:hover { background: rgba(239,68,68,0.2); }

  /* ── EDIT MODE */
  .db-edit-input, .db-edit-textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: #f1f5f9;
    font-size: 0.82rem;
    font-family: 'Sora', sans-serif;
    outline: none;
    margin-bottom: 8px;
  }
  .db-edit-input:focus, .db-edit-textarea:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
  }
  .db-edit-textarea { resize: none; }
  .db-btn-save {
    flex: 1; padding: 0.5rem;
    background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7;
    border-radius: 8px; cursor: pointer; font-size: 0.78rem; font-weight: 600;
    font-family: 'Sora', sans-serif; transition: background 0.15s;
  }
  .db-btn-save:hover { background: rgba(16,185,129,0.25); }
  .db-btn-cancel {
    flex: 1; padding: 0.5rem;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8;
    border-radius: 8px; cursor: pointer; font-size: 0.78rem; font-weight: 600;
    font-family: 'Sora', sans-serif; transition: background 0.15s;
  }
  .db-btn-cancel:hover { background: rgba(255,255,255,0.1); }

  /* ── EMPTY STATE */
  .db-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 5rem 2rem; gap: 0.75rem; color: #334155;
  }
  .db-empty-icon { font-size: 3.5rem; }
  .db-empty-title { font-size: 1rem; font-weight: 700; color: #475569; font-family: 'JetBrains Mono', monospace; }
  .db-empty-sub { font-size: 0.8rem; color: #334155; text-align: center; }

  /* ── SKELETON */
  .db-skeleton-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; padding: 1.25rem;
  }
  .db-skel-line {
    background: rgba(255,255,255,0.07);
    border-radius: 6px;
    animation: dbPulse 1.4s ease-in-out infinite;
  }
  @keyframes dbPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* ── PAGINATION */
  .db-pagination {
    display: flex; justify-content: center;
    flex-wrap: wrap; gap: 6px; margin-top: 2rem;
  }
  .db-page-btn {
    padding: 0.5rem 0.9rem; border-radius: 10px;
    font-size: 0.8rem; font-weight: 600; font-family: 'JetBrains Mono', monospace;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04); color: #94a3b8; transition: all 0.15s;
  }
  .db-page-btn:hover:not(:disabled):not(.active) {
    background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.3); color: #a5b4fc;
  }
  .db-page-btn.active {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border-color: transparent; color: #fff;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
  }
  .db-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── ERROR BANNER */
  .db-error-banner {
    padding: 0.9rem 1.25rem;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 12px; display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 1rem;
    font-size: 0.82rem; color: #fca5a5; font-family: 'JetBrains Mono', monospace;
  }
  .db-retry-btn {
    background: none; border: none; color: #fca5a5; text-decoration: underline;
    cursor: pointer; font-size: 0.78rem; font-family: 'JetBrains Mono', monospace;
  }

  /* ── TOAST */
  .db-toast-wrap {
    position: fixed; top: 1.25rem; right: 1.25rem;
    z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;
  }
  .db-toast {
    padding: 0.7rem 1.2rem; border-radius: 12px;
    font-size: 0.82rem; font-weight: 600; font-family: 'Sora', sans-serif; color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: dbToastIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .db-toast-success { background: rgba(16,185,129,0.92);  border-color: rgba(16,185,129,0.4); }
  .db-toast-error   { background: rgba(239,68,68,0.92);   border-color: rgba(239,68,68,0.4); }
  .db-toast-info    { background: rgba(99,102,241,0.92);  border-color: rgba(99,102,241,0.4); }
  @keyframes dbToastIn {
    from { opacity: 0; transform: translateX(20px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  /* ── MODAL */
  .db-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
    z-index: 5000; display: flex; align-items: center;
    justify-content: center; padding: 1rem;
    animation: dbFadeIn 0.2s ease both;
  }
  .db-modal {
    background: #111827; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 2rem; max-width: 500px; width: 100%;
    box-shadow: 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
    animation: dbScaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
  }
  .db-modal::before {
    content: '';
    position: absolute; top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, #10b981, transparent);
  }
  .db-modal-close {
    position: absolute; top: 1rem; right: 1.25rem;
    background: none; border: none; color: #475569;
    font-size: 1.5rem; line-height: 1; cursor: pointer; transition: color 0.15s;
  }
  .db-modal-close:hover { color: #f1f5f9; }
  .db-modal-title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.75rem; padding-right: 2rem; }
  .db-modal-desc  { font-size: 0.83rem; color: #64748b; line-height: 1.6; margin-bottom: 1rem; }
  .db-modal-meta  {
    font-size: 0.75rem; color: #475569; font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px;
  }

  /* ── KEYFRAMES */
  @keyframes dbFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dbFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dbScaleIn {
    from { opacity: 0; transform: scale(0.96) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes dbSpin { to { transform: rotate(360deg); } }

  .db-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff; border-radius: 50%;
    animation: dbSpin 0.7s linear infinite; display: inline-block;
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getStatusTag(status) {
  switch (status) {
    case "Pending":     return "db-tag db-tag-pending";
    case "In Progress": return "db-tag db-tag-progress";
    case "Resolved":    return "db-tag db-tag-resolved";
    default:            return "db-tag db-tag-default";
  }
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="db-toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`db-toast db-toast-${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function ComplaintModal({ complaint, onClose }) {
  if (!complaint) return null;
  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={(e) => e.stopPropagation()}>
        <button className="db-modal-close" onClick={onClose}>&times;</button>
        <h3 className="db-modal-title">{complaint.title}</h3>
        <p className="db-modal-desc">{complaint.description || "No description provided."}</p>
        {complaint.location && (
          <div className="db-modal-meta"><span>📍</span><span>{complaint.location}</span></div>
        )}
        <div className="db-modal-meta">
          <span>🕐</span><span>{new Date(complaint.createdAt).toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "1rem", flexWrap: "wrap" }}>
          <span className="db-tag db-tag-category">📂 {complaint.category}</span>
          <span className={getStatusTag(complaint.status)}>{complaint.status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, colorClass, icon }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 20));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className={`db-stat-card ${colorClass}`}>
      <div className="db-stat-icon">{icon}</div>
      <div>
        <div className="db-stat-value">{display}</div>
        <div className="db-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="db-complaints-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="db-skeleton-card">
          <div className="db-skel-line" style={{ height: 14, width: "70%", marginBottom: 12 }}></div>
          <div className="db-skel-line" style={{ height: 11, width: "100%", marginBottom: 8 }}></div>
          <div className="db-skel-line" style={{ height: 11, width: "60%", marginBottom: 16 }}></div>
          <div className="db-skel-line" style={{ height: 20, width: "30%", borderRadius: 999 }}></div>
        </div>
      ))}
    </div>
  );
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Water Issue", "Electricity", "Road Damage", "Garbage", "Internet", "Other"];
const TITLES     = ["No Water Supply", "Power Cut", "Road Damaged", "Garbage Not Collected", "Slow Internet", "Other"];
const ITEMS_PER_PAGE = 6;

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [complaints, setComplaints]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [fetchError, setFetchError]         = useState(false);
  const [title, setTitle]                   = useState("");
  const [customTitle, setCustomTitle]       = useState("");
  const [description, setDescription]       = useState("");
  const [category, setCategory]             = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [location, setLocation]             = useState("");
  const [locLoading, setLocLoading]         = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [adminSecret, setAdminSecret]       = useState("");
  const [filterStatus, setFilterStatus]     = useState("All");
  const [sortOrder, setSortOrder]           = useState("newest");
  const [page, setPage]                     = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toasts, setToasts]                 = useState([]);
  const [editingId, setEditingId]           = useState(null);
  const [editTitle, setEditTitle]           = useState("");
  const [editDesc, setEditDesc]             = useState("");

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const tokenRef = useRef(localStorage.getItem("token"));
  useEffect(() => { tokenRef.current = localStorage.getItem("token"); });
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${tokenRef.current}` } });

  const fetchComplaints = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    setLoading(true); setFetchError(false);
    try {
      const res = await axios.get(`${API_URL}/api/complaints/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.complaints) ? res.data.complaints : [];
      setComplaints(data);
    } catch (err) { console.error(err); setFetchError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) { toast("Geolocation not supported.", "error"); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setLocation(data.display_name || `${latitude}, ${longitude}`);
          toast("Location detected! 📍");
        } catch { setLocation(`${latitude}, ${longitude}`); toast("Location set (coordinates)."); }
        finally { setLocLoading(false); }
      },
      () => { setLocLoading(false); toast("Location access denied.", "error"); }
    );
  }, [toast]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) { toast("Description must be at least 10 characters.", "error"); return; }
    const finalTitle    = title === "Other" ? customTitle.trim() : title;
    const finalCategory = category === "Other" ? customCategory.trim() : category;
    if (!finalTitle)    { toast("Please provide a title.", "error"); return; }
    if (!finalCategory) { toast("Please provide a category.", "error"); return; }
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/complaints`,
        { title: finalTitle, description: description.trim(), category: finalCategory, ...(location.trim() && { location: location.trim() }) },
        getAuthHeader()
      );
      setTitle(""); setCustomTitle(""); setDescription(""); setCategory(""); setCustomCategory(""); setLocation("");
      toast("Complaint submitted! ✅");
      fetchComplaints();
    } catch (err) { toast(err.response?.data?.message || "Failed to submit.", "error"); }
    finally { setSubmitting(false); }
  }, [title, customTitle, description, category, customCategory, location, toast, fetchComplaints]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try { await axios.delete(`${API_URL}/api/complaints/${id}`, getAuthHeader()); toast("Complaint deleted."); fetchComplaints(); }
    catch { toast("Failed to delete.", "error"); }
  }, [toast, fetchComplaints]);

  const handleEditSave = useCallback(async (id) => {
    if (!editTitle.trim() || !editDesc.trim()) { toast("Title and description required.", "error"); return; }
    try {
      await axios.put(`${API_URL}/api/complaints/${id}`, { title: editTitle, description: editDesc }, getAuthHeader());
      setEditingId(null); toast("Updated! ✏️"); fetchComplaints();
    } catch { toast("Failed to update.", "error"); }
  }, [editTitle, editDesc, toast, fetchComplaints]);

  const applyAdmin = useCallback(async () => {
    if (!adminSecret.trim()) { toast("Enter admin secret.", "error"); return; }
    try {
      await axios.post(`${API_URL}/api/auth/apply-admin`, { adminSecret }, getAuthHeader());
      toast("You are now admin! Logging out...");
      setTimeout(() => { localStorage.clear(); window.location.href = "/"; }, 1500);
    } catch { toast("Invalid admin secret.", "error"); }
  }, [adminSecret, toast]);

  const filtered = useMemo(() => {
    let r = [...complaints];
    if (filterStatus !== "All") r = r.filter((c) => c.status === filterStatus);
    r.sort((a, b) => { const d = new Date(b.createdAt) - new Date(a.createdAt); return sortOrder === "newest" ? d : -d; });
    return r;
  }, [complaints, filterStatus, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const stats = useMemo(() => ({
    total:      complaints.length,
    pending:    complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved:   complaints.filter((c) => c.status === "Resolved").length,
  }), [complaints]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="db-root">
        <Navbar />
        <Toast toasts={toasts} />
        <ComplaintModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />

        <div className="db-inner">

          {/* ── PAGE HEADER */}
          <div className="db-page-header">
            <div className="db-site-badge">✦ ComplainHub</div>
            <h1 className="db-page-title">My <span>Dashboard</span></h1>
            <p className="db-page-sub">Track and manage your complaints</p>
          </div>

          {/* ── STATS */}
          <div className="db-stats-grid">
            <StatCard label="Total"       value={stats.total}      icon="📋" colorClass="db-stat-total" />
            <StatCard label="Pending"     value={stats.pending}    icon="⏳" colorClass="db-stat-pending" />
            <StatCard label="In Progress" value={stats.inProgress} icon="🔄" colorClass="db-stat-progress" />
            <StatCard label="Resolved"    value={stats.resolved}   icon="✅" colorClass="db-stat-resolved" />
          </div>

          {/* ── SUBMIT FORM */}
          <div className="db-section db-section-anim">
            <div className="db-card" style={{ padding: "1.75rem 2rem" }}>
              <div className="db-section-title">
                Submit New Complaint
                <span className="db-section-mono">/ new</span>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="db-grid-2">
                  <div>
                    <label className="db-label">Title *</label>
                    <select value={title} onChange={(e) => setTitle(e.target.value)} required className="db-select">
                      <option value="">Select a title</option>
                      {TITLES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="db-label">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required className="db-select">
                      <option value="">Select a category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {(title === "Other" || category === "Other") && (
                  <div className="db-grid-2">
                    {title === "Other" && (
                      <div>
                        <label className="db-label">Custom Title *</label>
                        <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} required placeholder="Enter custom title" className="db-input" />
                      </div>
                    )}
                    {category === "Other" && (
                      <div>
                        <label className="db-label">Custom Category *</label>
                        <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required placeholder="Enter custom category" className="db-input" />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="db-label">Description *</label>
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      required minLength={10} maxLength={500} rows={4}
                      placeholder="Describe your complaint in detail (min 10 characters)..."
                      className="db-textarea db-input" style={{ paddingBottom: "2rem" }}
                    />
                    <span className={`db-char-count ${description.length > 450 ? "warn" : ""}`}>{description.length}/500</span>
                  </div>
                </div>

                <div>
                  <label className="db-label">
                    Location <span style={{ color: "#334155", textTransform: "none", letterSpacing: 0, fontFamily: "Sora, sans-serif" }}></span>
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location or use current location" className="db-input" style={{ flex: 1 }} />
                    <button type="button" onClick={handleUseLocation} disabled={locLoading} className="db-btn-loc">
                      {locLoading ? <span className="db-spinner"></span> : "📍"}
                      {locLoading ? "Detecting..." : "Use My Location"}
                    </button>
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={submitting} className="db-btn-primary">
                    {submitting && <span className="db-spinner"></span>}
                    {submitting ? "Submitting..." : "Submit Complaint →"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── COMPLAINTS LIST */}
          <div className="db-section db-section-anim2">
            <div className="db-section-title">
              My Complaints
              <span className="db-section-mono">/ {filtered.length} found</span>
            </div>

            <div className="db-controls">
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="db-select">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="db-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {fetchError && (
              <div className="db-error-banner">
                <span>⚠️ Could not load complaints. Data below may be stale.</span>
                <button onClick={fetchComplaints} className="db-retry-btn">Retry</button>
              </div>
            )}

            {loading ? <Skeleton /> : paginated.length === 0 ? (
              <div className="db-empty">
                <span className="db-empty-icon">📭</span>
                <p className="db-empty-title">No complaints found</p>
                <p className="db-empty-sub">{complaints.length === 0 ? "Submit your first complaint above." : "Try adjusting your filters."}</p>
              </div>
            ) : (
              <div className="db-complaints-grid">
                {paginated.map((c) => (
                  <div key={c._id} className="db-complaint-card" onClick={() => { if (editingId !== c._id) setSelectedComplaint(c); }}>
                    {editingId === c._id ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className="db-edit-input" />
                        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} placeholder="Description" className="db-edit-textarea" />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleEditSave(c._id)} className="db-btn-save">Save</button>
                          <button onClick={() => setEditingId(null)} className="db-btn-cancel">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                          <div className="db-complaint-title">{c.title}</div>
                          <span className={getStatusTag(c.status)} style={{ flexShrink: 0 }}>{c.status}</span>
                        </div>
                        <p className="db-complaint-desc">{c.description}</p>
                        <div style={{ marginBottom: "0.75rem" }}>
                          {c.location && <div className="db-meta"><span>📍</span><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</span></div>}
                          <div className="db-meta"><span>🕐</span><span>{new Date(c.createdAt).toLocaleString()}</span></div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                          <span className="db-tag db-tag-category">{c.category}</span>
                          {c.status === "Pending" && (
                            <div className="db-card-actions" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setEditingId(c._id); setEditTitle(c.title); setEditDesc(c.description); }} className="db-btn-edit">✏️ Edit</button>
                              <button onClick={() => handleDelete(c._id)} className="db-btn-del">🗑️</button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="db-pagination">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="db-page-btn">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`db-page-btn ${page === p ? "active" : ""}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="db-page-btn">Next →</button>
              </div>
            )}
          </div>

          {/* ── ADMIN SECTION */}
          <div className="db-section db-section-anim3" style={{ maxWidth: 480 }}>
            <div className="db-card" style={{ padding: "1.75rem 2rem" }}>
              <div className="db-section-title">
                Apply for Admin
                <span className="db-section-mono">/ restricted</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: "1rem", fontFamily: "'JetBrains Mono', monospace" }}>
                Enter the secret key to upgrade your account to admin.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Admin secret key" className="db-input" style={{ flex: 1 }} />
                <button onClick={applyAdmin} className="db-btn-admin">Apply →</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}