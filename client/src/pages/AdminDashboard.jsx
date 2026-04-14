import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .ad-root {
    min-height: 100vh;
    background: #0b0f1a;
    font-family: 'Sora', sans-serif;
    color: #f1f5f9;
    position: relative;
    overflow-x: hidden;
  }
  .ad-root::before {
    content: '';
    position: fixed;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%);
    top: -160px; right: -120px;
    pointer-events: none; z-index: 0;
  }
  .ad-root::after {
    content: '';
    position: fixed;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    pointer-events: none; z-index: 0;
  }

  .ad-inner {
    position: relative; z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  /* ── PAGE HEADER */
  .ad-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.75rem;
    animation: adFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .ad-header-left {}
  .ad-site-badge {
    display: inline-flex;
    align-items: center; gap: 6px;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.25);
    color: #a5b4fc;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 999px;
    margin-bottom: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }
  .ad-page-title {
    font-size: 2rem; font-weight: 700;
    color: #f1f5f9; letter-spacing: -0.02em; line-height: 1.15;
  }
  .ad-page-title span {
    background: linear-gradient(90deg, #6366f1, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ad-page-sub {
    font-size: 0.85rem; color: #475569; margin-top: 0.35rem;
  }
  .ad-header-actions {
    display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;
  }

  /* ── STATS */
  .ad-stats-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    animation: adFadeUp 0.5s 0.04s cubic-bezier(0.22,1,0.36,1) both;
  }
  @media(max-width: 640px) {
    .ad-stats-bar { grid-template-columns: repeat(2, 1fr); }
  }
  .ad-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1rem 1.1rem;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
  }
  .ad-stat:hover { transform: translateY(-2px); }
  .ad-stat::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: 2px 2px 0 0;
  }
  .ad-stat-all::before   { background: linear-gradient(90deg, #6366f1, #10b981); }
  .ad-stat-pending::before { background: #f59e0b; }
  .ad-stat-progress::before { background: #6366f1; }
  .ad-stat-resolved::before { background: #10b981; }
  .ad-stat.active {
    border-color: rgba(99,102,241,0.4);
    background: rgba(99,102,241,0.08);
  }
  .ad-stat-label {
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 0.3rem;
  }
  .ad-stat-all .ad-stat-label   { color: #64748b; }
  .ad-stat-pending .ad-stat-label { color: #f59e0b; }
  .ad-stat-progress .ad-stat-label { color: #a5b4fc; }
  .ad-stat-resolved .ad-stat-label { color: #6ee7b7; }
  .ad-stat-num {
    font-size: 1.7rem; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
  }

  /* ── CONTROLS */
  .ad-controls {
    display: flex; flex-wrap: wrap; gap: 0.65rem;
    margin-bottom: 1rem;
    animation: adFadeUp 0.5s 0.07s cubic-bezier(0.22,1,0.36,1) both;
  }
  .ad-search-wrap {
    position: relative; flex: 1; min-width: 200px;
  }
  .ad-search-icon {
    position: absolute; left: 11px; top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem; pointer-events: none;
  }
  .ad-search {
    width: 100%;
    padding: 0.68rem 0.9rem 0.68rem 2.1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #f1f5f9;
    font-size: 0.83rem;
    font-family: 'Sora', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ad-search::placeholder { color: #334155; }
  .ad-search:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .ad-select {
    padding: 0.68rem 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #f1f5f9;
    font-size: 0.83rem;
    font-family: 'Sora', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    min-width: 140px;
    cursor: pointer;
  }
  .ad-select option { background: #1e293b; color: #f1f5f9; }
  .ad-select:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  /* ── ICON BUTTONS */
  .ad-icon-btn {
    padding: 0.65rem 1rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #94a3b8;
    font-size: 0.8rem; font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .ad-icon-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.18);
    color: #f1f5f9;
  }
  .ad-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .ad-icon-btn.primary {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.3);
    color: #a5b4fc;
  }
  .ad-icon-btn.primary:hover {
    background: rgba(99,102,241,0.22);
    border-color: rgba(99,102,241,0.5);
    color: #c7d2fe;
  }
  .ad-icon-btn.danger {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.2);
    color: #fca5a5;
  }
  .ad-icon-btn.danger:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
  }

  /* ── BULK BAR */
  .ad-bulk-bar {
    display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 12px;
    padding: 0.65rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.8rem;
    color: #a5b4fc;
    animation: adFadeUp 0.2s ease both;
  }
  .ad-bulk-sep {
    width: 1px; height: 18px;
    background: rgba(99,102,241,0.3);
    flex-shrink: 0;
  }
  .ad-bulk-status {
    padding: 0.38rem 0.7rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: #f1f5f9; font-size: 0.78rem;
    font-family: 'Sora', sans-serif; outline: none;
    cursor: pointer;
  }
  .ad-bulk-status option { background: #1e293b; }

  /* ── GRID */
  .ad-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    animation: adFadeUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }
  @media(min-width: 640px)  { .ad-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── COMPLAINT CARD */
  .ad-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    padding: 1.35rem;
    backdrop-filter: blur(16px);
    box-shadow: 0 0 0 1px rgba(99,102,241,0.06), 0 16px 32px rgba(0,0,0,0.35);
    position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .ad-card::before {
    content: '';
    position: absolute; top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(16,185,129,0.3), transparent);
  }
  .ad-card:hover {
    transform: translateY(-2px);
    border-color: rgba(99,102,241,0.2);
    box-shadow: 0 0 0 1px rgba(99,102,241,0.1), 0 24px 48px rgba(0,0,0,0.4);
  }
  .ad-card.ad-selected {
    border-color: rgba(99,102,241,0.45);
    background: rgba(99,102,241,0.07);
  }

  .ad-card-top {
    display: flex; align-items: flex-start; gap: 0.65rem; margin-bottom: 0.4rem;
  }
  .ad-card-cb {
    width: 16px; height: 16px;
    accent-color: #6366f1;
    cursor: pointer; flex-shrink: 0; margin-top: 3px;
  }
  .ad-card-title {
    font-size: 0.97rem; font-weight: 700; color: #f1f5f9;
    line-height: 1.3; flex: 1;
  }
  .ad-card-desc {
    font-size: 0.8rem; color: #64748b;
    line-height: 1.55; margin-bottom: 0.2rem;
    overflow: hidden;
  }
  .ad-card-desc.collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .ad-expand-btn {
    background: none; border: none;
    color: #6366f1; font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer; padding: 0;
    margin: 0.15rem 0 0.65rem;
    text-decoration: underline;
  }
  .ad-expand-btn:hover { color: #a5b4fc; }

  .ad-meta-row {
    display: flex; flex-direction: column; gap: 3px; margin-bottom: 1rem;
  }
  .ad-meta {
    font-size: 0.73rem; color: #475569;
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; gap: 5px;
  }
  .ad-meta-label { color: #334155; }
  .ad-meta-val   { color: #94a3b8; }

  /* ── CARD FOOTER */
  .ad-card-footer {
    display: flex; align-items: center; gap: 0.55rem;
    flex-wrap: wrap;
  }

  /* ── STATUS SELECT */
  .ad-status-select {
    padding: 0.42rem 0.7rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: #f1f5f9; font-size: 0.78rem;
    font-family: 'Sora', sans-serif; outline: none;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .ad-status-select option { background: #1e293b; }
  .ad-status-select:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
  }

  /* ── STATUS TAGS */
  .ad-tag {
    display: inline-block;
    font-size: 0.68rem; font-family: 'JetBrains Mono', monospace;
    font-weight: 600; letter-spacing: 0.04em;
    padding: 3px 10px; border-radius: 999px;
  }
  .ad-tag-pending  { background: rgba(234,179,8,0.12);  border: 1px solid rgba(234,179,8,0.25);  color: #fde047; }
  .ad-tag-progress { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc; }
  .ad-tag-resolved { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; }

  /* ── DELETE BUTTON */
  .ad-btn-del {
    margin-left: auto;
    padding: 0.42rem 0.9rem;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #fca5a5; font-size: 0.75rem; font-weight: 600;
    font-family: 'Sora', sans-serif;
    border-radius: 10px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .ad-btn-del:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
  }

  /* ── EMPTY STATE */
  .ad-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 5rem 2rem; gap: 0.75rem;
  }
  .ad-empty-icon { font-size: 3.5rem; }
  .ad-empty-title {
    font-size: 1rem; font-weight: 700; color: #475569;
    font-family: 'JetBrains Mono', monospace;
  }
  .ad-empty-sub { font-size: 0.8rem; color: #334155; }

  /* ── PAGINATION */
  .ad-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 0.6rem; margin-top: 2.5rem; flex-wrap: wrap;
    animation: adFadeUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }
  .ad-page-btn {
    padding: 0.5rem 1rem; border-radius: 10px;
    font-size: 0.8rem; font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #94a3b8; transition: all 0.15s;
  }
  .ad-page-btn:hover:not(:disabled) {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.3); color: #a5b4fc;
  }
  .ad-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .ad-page-info {
    font-size: 0.78rem; color: #475569;
    font-family: 'JetBrains Mono', monospace;
    padding: 0 0.5rem;
  }
  .ad-page-info span { color: #a5b4fc; font-weight: 600; }

  /* ── TOAST */
  .ad-toast-container {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    display: flex; flex-direction: column; gap: 0.5rem;
    z-index: 9999; pointer-events: none;
  }
  .ad-toast {
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.12);
    color: #f1f5f9;
    font-size: 0.78rem; font-family: 'JetBrains Mono', monospace;
    padding: 0.6rem 1rem; border-radius: 10px;
    animation: adToastIn 0.25s ease;
    max-width: 280px;
  }
  @keyframes adToastIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── KEYFRAMES */
  @keyframes adFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getStatusTag(status) {
  switch (status) {
    case "Pending":     return "ad-tag ad-tag-pending";
    case "In Progress": return "ad-tag ad-tag-progress";
    case "Resolved":    return "ad-tag ad-tag-resolved";
    default:            return "ad-tag";
  }
}

// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);
  return { toasts, addToast };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [complaints, setComplaints]     = useState([]);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortBy, setSortBy]             = useState("date-desc");
  const [selected, setSelected]         = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [bulkStatus, setBulkStatus]     = useState("");
  const [allComplaints, setAllComplaints] = useState([]);
  const { toasts, addToast }            = useToast();

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Fetch all complaints for stats + client-side search/sort
  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/complaints?page=${page}&limit=6&status=${statusFilter}`,
        getAuthHeader()
      );
      setComplaints(data.complaints);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [page, statusFilter]);

  // Fetch all (no limit) for stats
  const fetchAllForStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/complaints?page=1&limit=1000`,
        getAuthHeader()
      );
      setAllComplaints(data.complaints || []);
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);
  useEffect(() => { fetchAllForStats(); }, [fetchAllForStats]);

  // ── STATS ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allComplaints.length,
    pending:  allComplaints.filter((c) => c.status === "Pending").length,
    progress: allComplaints.filter((c) => c.status === "In Progress").length,
    resolved: allComplaints.filter((c) => c.status === "Resolved").length,
  }), [allComplaints]);

  // ── CLIENT-SIDE SEARCH + SORT ──────────────────────────────────────────────
  const displayedComplaints = useMemo(() => {
    let list = [...complaints];
    const q = searchQuery.toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.user?.name?.toLowerCase().includes(q) ||
          c.user?.email?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q)
      );
    }
    const order = { Pending: 0, "In Progress": 1, Resolved: 2 };
    if (sortBy === "date-asc")  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "date-desc") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "status")    list.sort((a, b) => (order[a.status] ?? 0) - (order[b.status] ?? 0));
    if (sortBy === "user")      list.sort((a, b) => (a.user?.name || "").localeCompare(b.user?.name || ""));
    return list;
  }, [complaints, searchQuery, sortBy]);

  // ── STATUS UPDATE ──────────────────────────────────────────────────────────
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/complaints/status/${id}`,
        { status: newStatus },
        getAuthHeader()
      );
      fetchComplaints();
      fetchAllForStats();
      addToast("✔ Status updated");
    } catch (error) {
      console.error("Status update error:", error);
      addToast("✗ Error updating status");
    }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await axios.delete(`${API_URL}/api/complaints/${id}`, getAuthHeader());
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      fetchComplaints();
      fetchAllForStats();
      addToast("🗑 Complaint deleted");
    } catch (error) {
      console.error("Delete error:", error);
      addToast("✗ Error deleting complaint");
    }
  };

  // ── EXPAND / COLLAPSE ──────────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedCards((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── SELECT ─────────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    const allIds = displayedComplaints.map((c) => c._id);
    setSelected((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      if (allSelected) {
        const n = new Set(prev);
        allIds.forEach((id) => n.delete(id));
        return n;
      }
      const n = new Set(prev);
      allIds.forEach((id) => n.add(id));
      return n;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // ── BULK STATUS ────────────────────────────────────────────────────────────
  const applyBulkStatus = async () => {
    if (!bulkStatus) { addToast("⚠ Pick a status first"); return; }
    try {
      await Promise.all(
        [...selected].map((id) =>
          axios.put(
            `${API_URL}/api/complaints/status/${id}`,
            { status: bulkStatus },
            getAuthHeader()
          )
        )
      );
      addToast(`✔ Updated ${selected.size} complaints`);
      setSelected(new Set());
      setBulkStatus("");
      fetchComplaints();
      fetchAllForStats();
    } catch (error) {
      console.error("Bulk status error:", error);
      addToast("✗ Bulk update failed");
    }
  };

  // ── BULK DELETE ────────────────────────────────────────────────────────────
  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected complaint(s)?`)) return;
    try {
      await Promise.all(
        [...selected].map((id) =>
          axios.delete(`${API_URL}/api/complaints/${id}`, getAuthHeader())
        )
      );
      addToast(`🗑 Deleted ${selected.size} complaints`);
      setSelected(new Set());
      fetchComplaints();
      fetchAllForStats();
    } catch (error) {
      console.error("Bulk delete error:", error);
      addToast("✗ Bulk delete failed");
    }
  };

  // ── EXPORT CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [["Title", "Description", "User", "Email", "Location", "Status", "Filed"]];
    displayedComplaints.forEach((c) => {
      rows.push([
        `"${(c.title || "").replace(/"/g, '""')}"`,
        `"${(c.description || "").replace(/"/g, '""')}"`,
        `"${c.user?.name || ""}"`,
        `"${c.user?.email || ""}"`,
        `"${c.location || ""}"`,
        c.status,
        new Date(c.createdAt).toLocaleString(),
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "complaints.csv"; a.click();
    URL.revokeObjectURL(url);
    addToast("⬇ CSV exported");
  };

  // ── STAT CLICK FILTER ──────────────────────────────────────────────────────
  const handleStatClick = (filter) => {
    setStatusFilter(statusFilter === filter ? "" : filter);
    setPage(1);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="ad-root">
        <Navbar />
        <div className="ad-inner">

          {/* ── PAGE HEADER */}
          <div className="ad-page-header">
            <div className="ad-header-left">
              <div className="ad-site-badge">✦ ComplainHub</div>
              <h1 className="ad-page-title">Admin <span>Dashboard</span></h1>
              <p className="ad-page-sub">Manage and moderate all complaints</p>
            </div>
            <div className="ad-header-actions">
              <button className="ad-icon-btn primary" onClick={exportCSV}>
                ⬇ Export CSV
              </button>
              <button
                className="ad-icon-btn"
                onClick={selectAll}
              >
                ☑ Select All
              </button>
            </div>
          </div>

          {/* ── STATS BAR */}
          <div className="ad-stats-bar">
            <div
              className={`ad-stat ad-stat-all${statusFilter === "" ? " active" : ""}`}
              onClick={() => handleStatClick("")}
            >
              <div className="ad-stat-label">Total</div>
              <div className="ad-stat-num">{stats.total}</div>
            </div>
            <div
              className={`ad-stat ad-stat-pending${statusFilter === "Pending" ? " active" : ""}`}
              onClick={() => handleStatClick("Pending")}
            >
              <div className="ad-stat-label">Pending</div>
              <div className="ad-stat-num">{stats.pending}</div>
            </div>
            <div
              className={`ad-stat ad-stat-progress${statusFilter === "In Progress" ? " active" : ""}`}
              onClick={() => handleStatClick("In Progress")}
            >
              <div className="ad-stat-label">In Progress</div>
              <div className="ad-stat-num">{stats.progress}</div>
            </div>
            <div
              className={`ad-stat ad-stat-resolved${statusFilter === "Resolved" ? " active" : ""}`}
              onClick={() => handleStatClick("Resolved")}
            >
              <div className="ad-stat-label">Resolved</div>
              <div className="ad-stat-num">{stats.resolved}</div>
            </div>
          </div>

          {/* ── CONTROLS */}
          <div className="ad-controls">
            <div className="ad-search-wrap">
              <span className="ad-search-icon">🔍</span>
              <input
                className="ad-search"
                type="text"
                placeholder="Search title, description, user, email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="ad-select"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ad-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="status">By Status</option>
              <option value="user">By User</option>
            </select>
          </div>

          {/* ── BULK ACTION BAR */}
          {selected.size > 0 && (
            <div className="ad-bulk-bar">
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {selected.size} selected
              </span>
              <div className="ad-bulk-sep" />
              <select
                className="ad-bulk-status"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <option value="">Set status…</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <button className="ad-icon-btn primary" onClick={applyBulkStatus}>
                ✔ Apply
              </button>
              <button className="ad-icon-btn danger" onClick={bulkDelete}>
                🗑 Delete
              </button>
              <div className="ad-bulk-sep" />
              <button className="ad-icon-btn" onClick={clearSelection}>
                ✕ Clear
              </button>
            </div>
          )}

          {/* ── COMPLAINTS */}
          {displayedComplaints.length === 0 ? (
            <div className="ad-empty">
              <span className="ad-empty-icon">📭</span>
              <p className="ad-empty-title">No complaints found</p>
              <p className="ad-empty-sub">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="ad-grid">
              {displayedComplaints.map((c) => {
                const isExpanded = expandedCards.has(c._id);
                const isSelected = selected.has(c._id);
                return (
                  <div
                    key={c._id}
                    className={`ad-card${isSelected ? " ad-selected" : ""}`}
                  >
                    {/* Top row: checkbox + title */}
                    <div className="ad-card-top">
                      <input
                        type="checkbox"
                        className="ad-card-cb"
                        checked={isSelected}
                        onChange={() => toggleSelect(c._id)}
                      />
                      <h4 className="ad-card-title">{c.title}</h4>
                    </div>

                    {/* Description with expand toggle */}
                    <p className={`ad-card-desc${isExpanded ? "" : " collapsed"}`}>
                      {c.description}
                    </p>
                    <button
                      className="ad-expand-btn"
                      onClick={() => toggleExpand(c._id)}
                    >
                      {isExpanded ? "▲ Show less" : "▼ Show more"}
                    </button>

                    {/* Meta */}
                    <div className="ad-meta-row">
                      <div className="ad-meta">
                        <span>👤</span>
                        <span className="ad-meta-label">User:</span>
                        <span className="ad-meta-val">{c.user?.name || "—"}</span>
                      </div>
                      <div className="ad-meta">
                        <span>✉️</span>
                        <span className="ad-meta-label">Email:</span>
                        <span className="ad-meta-val">{c.user?.email || "—"}</span>
                      </div>
                      {c.location && (
                        <div className="ad-meta">
                          <span>📍</span>
                          <span className="ad-meta-label">Location:</span>
                          <span
                            className="ad-meta-val"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {c.location}
                          </span>
                        </div>
                      )}
                      <div className="ad-meta">
                        <span>🕐</span>
                        <span className="ad-meta-label">Filed:</span>
                        <span className="ad-meta-val">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer: status select + tag + delete */}
                    <div className="ad-card-footer">
                      <select
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className="ad-status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <span className={getStatusTag(c.status)}>{c.status}</span>
                      <button
                        onClick={() => deleteComplaint(c._id)}
                        className="ad-btn-del"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAGINATION */}
          {totalPages > 1 && (
            <div className="ad-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="ad-page-btn"
              >
                ← Prev
              </button>
              <span className="ad-page-info">
                Page <span>{page}</span> of <span>{totalPages}</span>
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="ad-page-btn"
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── TOASTS */}
      <div className="ad-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="ad-toast">{t.msg}</div>
        ))}
      </div>
    </>
  );
}

export default AdminDashboard;