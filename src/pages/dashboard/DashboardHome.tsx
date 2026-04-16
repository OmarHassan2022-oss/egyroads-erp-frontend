import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    projects: 0,
    contracts: 0,
    equipment: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes] = await Promise.all([api.get("/api/v1/projects")]);
        setStats((prev) => ({
          ...prev,
          projects: projectsRes.data.data?.length || 0,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      title: "المشروعات",
      count: stats.projects,
      icon: "🏗️",
      link: "/dashboard/projects",
      color: "bg-blue-500",
    },
    {
      title: "العقود",
      count: stats.contracts,
      icon: "📄",
      link: "/dashboard/contracts",
      color: "bg-green-500",
    },
    {
      title: "المعدات",
      count: stats.equipment,
      icon: "🚜",
      link: "/dashboard/equipment",
      color: "bg-orange-500",
    },
    {
      title: "الاعتمادات المعلقة",
      count: stats.pendingApprovals,
      icon: "⏳",
      link: "/dashboard/approvals",
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.color} text-white rounded-lg shadow-md p-6 hover:opacity-90 transition`}
          >
            <div className="text-4xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold">{card.count}</div>
            <div className="text-lg">{card.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
