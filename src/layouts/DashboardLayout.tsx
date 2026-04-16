import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import type { User } from "../types";

const getUserFromStorage = (): User | null => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return getUserFromStorage();
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const menuItems = [
    { name: "الرئيسية", icon: "📊", path: "/dashboard" },
    { name: "المشروعات", icon: "🏗️", path: "/dashboard/projects" },
    { name: "العقود", icon: "📄", path: "/dashboard/contracts" },
    { name: "المستخلصات", icon: "💰", path: "/dashboard/ipcs" },
    { name: "المعدات", icon: "🚜", path: "/dashboard/equipment" },
    { name: "اللوازم", icon: "📦", path: "/dashboard/supplies" },
    { name: "المقاولين", icon: "👷", path: "/dashboard/subcontractors" },
    { name: "سلسلة التوريد", icon: "🚚", path: "/dashboard/supply-chain" },
    { name: "التقارير", icon: "📈", path: "/dashboard/reports" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-800 text-white transition-all duration-300`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">EgyRoads ERP</h1>
          <p className="text-sm text-gray-400">نظام المقاولات</p>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 hover:bg-gray-700 text-gray-300 hover:text-white"
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-2 bg-gray-700 rounded mb-2"
          >
            {sidebarOpen ? "إخفاء" : "إظهار"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 rounded hover:bg-red-700"
          >
            خروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.fullName}</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {user.role}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
