import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import type { User } from "../types";

const getUserFromStorage = (): User | null => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return getUserFromStorage();
  }, []);
  const [selectedProject, setSelectedProject] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  if (!user && !localStorage.getItem("token")) return null;

  const menuItems = [
    { section: "الرئيسية", items: [
      { name: "لوحة القيادة", icon: "📊", path: "/dashboard" },
    ]},
    { section: "إدارة المشاريع", items: [
      { name: "المشاريع", icon: "🏗️", path: "/dashboard/projects" },
      { name: "العقود والمستخلصات", icon: "📋", path: "/dashboard/contracts" },
      { name: "المكتب الفني — BOQ", icon: "📐", path: "/dashboard/ipcs" },
    ]},
    { section: "العمليات الميدانية", items: [
      { name: "تسليمات AI", icon: "🤖", path: "/dashboard/ai-deliveries", badge: "3" },
      { name: "نظام المركبات OCR", icon: "🚚", path: "/dashboard/ocr", badge: "7" },
      { name: "المعدات والآليات", icon: "🔧", path: "/dashboard/equipment" },
    ]},
    { section: "الإدارة", items: [
      { name: "التوريدات والمخازن", icon: "🏪", path: "/dashboard/supplies" },
      { name: "الموارد البشرية", icon: "👷", path: "/dashboard/hr" },
      { name: "مقاولو الباطن", icon: "🤝", path: "/dashboard/subcontractors" },
      { name: "الحسابات والمالية", icon: "💰", path: "/dashboard/finance" },
    ]},
    { section: "النظام", items: [
      { name: "الإعدادات", icon: "⚙️", path: "/dashboard/settings" },
      { name: "دليل المستخدم", icon: "❓", path: "/dashboard/help" },
    ]},
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname === path;
  };

  const getTitle = () => {
    if (selectedProject === "all") return "لوحة القيادة التنفيذية";
    const projects: Record<string, string> = {
      p1: "محور الضبعة — امتداد",
      p2: "طريق العاشر — إنشاء",
      p3: "كوبري العبور — صيانة"
    };
    return "مشروع: " + (projects[selectedProject] || "جميع المشاريع");
  };

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">EgyRoads</div>
          <div className="logo-sub">ERP — نظام إدارة الطرق</div>
        </div>

        {menuItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">ح م</div>
            <div>
              <div className="user-name">م. حسن محمد</div>
              <div className="user-role">مدير عام</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{getTitle()}</div>
          </div>
          <div className="topbar-right">
            <select 
              className="project-selector" 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">جميع المشاريع</option>
              <option value="p1">محور الضبعة — امتداد</option>
              <option value="p2">طريق العاشر — إنشاء</option>
              <option value="p3">كوبري العبور — صيانة</option>
            </select>
            <button className="topbar-btn" title="تنبيهات">
              🔔
              <span className="notif-dot"></span>
            </button>
            <button className="topbar-btn" title="تصدير">📤</button>
            <button className="topbar-btn" title="إعدادات">⚙️</button>
          </div>
        </div>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}