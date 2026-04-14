import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-4 py-3 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "hover:bg-gray-200 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 min-h-screen p-6 shadow-lg hidden md:block">
      
      <h2 className="text-2xl font-bold mb-8 text-blue-600 dark:text-blue-400">
        Complaint Panel
      </h2>

      <nav className="space-y-3">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          User Dashboard
        </Link>

        <Link to="/admin" className={linkClass("/admin")}>
          Admin Dashboard
        </Link>
      </nav>

    </div>
  );
}

export default Sidebar;