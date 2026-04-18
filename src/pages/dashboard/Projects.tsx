import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Project {
  projectId: string;
  projectName: string;
  projectCode: string;
  status: "planning" | "in_progress" | "completed" | "suspended";
  startDate: string;
  endDate: string;
  budget: number;
  location?: string;
  description?: string;
  clientName?: string;
  contractValue?: number;
}

interface ProjectFormData {
  projectName: string;
  projectCode: string;
  status: "planning" | "in_progress" | "completed" | "suspended";
  startDate: string;
  endDate: string;
  budget: number;
  location?: string;
  description?: string;
  clientName?: string;
  contractValue?: number;
}

const statusLabels: Record<string, string> = {
  planning: "تخطيط",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  suspended: "موقوف",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: "",
    projectCode: "",
    status: "planning",
    startDate: "",
    endDate: "",
    budget: 0,
    location: "",
    description: "",
    clientName: "",
    contractValue: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "suspended":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/v1/projects");
      setProjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/api/v1/projects/${editingProject.projectId}`, formData);
      } else {
        await api.post("/api/v1/projects", formData);
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      projectCode: project.projectCode,
      status: project.status,
      startDate: project.startDate.split("T")[0],
      endDate: project.endDate.split("T")[0],
      budget: project.budget,
      location: project.location || "",
      description: project.description || "",
      clientName: project.clientName || "",
      contractValue: project.contractValue || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    try {
      await api.delete(`/api/v1/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      projectName: "",
      projectCode: "",
      status: "planning",
      startDate: "",
      endDate: "",
      budget: 0,
      location: "",
      description: "",
      clientName: "",
      contractValue: 0,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-[#8a95aa]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#e8eef4]">المشروعات</h1>
        <button
          onClick={openCreateModal}
          className="bg-[#f5a623] text-[#0e1117] px-4 py-2 rounded-lg hover:bg-[#d4921e] font-medium"
        >
          + إضافة مشروع
        </button>
      </div>

      <div className="bg-[#161c27] rounded-lg border border-[#2a3448] overflow-hidden">
        <table className="min-w-full divide-y divide-[#2a3448]">
          <thead className="bg-[#1e2738]">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                اسم المشروع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                رمز المشروع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                الميزانية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                تاريخ البداية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                تاريخ النهاية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#161c27] divide-y divide-[#2a3448]">
            {projects.map((project) => (
              <tr key={project.projectId} className="hover:bg-[#1e2738]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#e8eef4]">
                    {project.projectName}
                  </div>
                  {project.clientName && (
                    <div className="text-sm text-[#8a95aa]">
                      {project.clientName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                  {project.projectCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                  {formatCurrency(project.budget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                  {formatDate(project.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                  {formatDate(project.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-[#f5a623] hover:text-[#d4921e] ml-3"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(project.projectId)}
                    className="text-red-400 hover:text-red-300"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-[#8a95aa]">
                  لا توجد مشروعات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#161c27] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#2a3448]">
            <h2 className="text-xl font-bold mb-4 text-[#e8eef4]">
              {editingProject ? "تعديل مشروع" : "إضافة مشروع جديد"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    اسم المشروع *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    رمز المشروع *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectCode}
                    onChange={(e) =>
                      setFormData({ ...formData, projectCode: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    value={formData.clientName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ProjectFormData["status"],
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  >
                    <option value="planning">تخطيط</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الميزانية
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    قيمة العقد
                  </label>
                  <input
                    type="number"
                    value={formData.contractValue || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractValue: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الموقع
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-[#2a3448] text-[#e8eef4] rounded hover:bg-[#1e2738]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5a623] text-[#0e1117] rounded hover:bg-[#d4921e] font-medium"
                >
                  {editingProject ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
