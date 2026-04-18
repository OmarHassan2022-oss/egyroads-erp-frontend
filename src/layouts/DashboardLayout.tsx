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
    <div dir="rtl" className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - RTL: positioned on the right */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-orange-600 to-amber-700 text-white transition-all duration-300 fixed top-0 bottom-0 end-0`}
        style={{ right: 0 }}
      >
        <div className="p-4 border-b border-orange-500/30">
          <h1 className="text-xl font-bold">EgyRoads ERP</h1>
          <p className="text-sm text-orange-100">نظام المقاولات</p>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 hover:bg-orange-500/30 text-orange-100 hover:text-white rounded-md mx-2"
            >
              <span className="text-xl ml-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-orange-500/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-2 bg-orange-500/50 rounded mb-2 hover:bg-orange-500 transition-colors"
          >
            {sidebarOpen ? "إخفاء" : "إظهار"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/80 rounded hover:bg-red-600 transition-colors"
          >
            خروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ marginRight: sidebarOpen ? "16rem" : "5rem" }}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-orange-600 hover:text-orange-700"
          >
            ☰
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.fullName}</span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
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