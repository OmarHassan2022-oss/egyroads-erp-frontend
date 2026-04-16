import { useEffect, useState } from "react";
import api from "../../api/axios";

interface IPC {
  ipcId: string;
  ipcNumber: string;
  projectId: string;
  projectName?: string;
  ipcDate: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: "draft" | "submitted" | "approved" | "paid" | "rejected";
  notes?: string;
  contractorName?: string;
}

interface IPCFormData {
  ipcNumber: string;
  projectId: string;
  ipcDate: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: "draft" | "submitted" | "approved" | "paid" | "rejected";
  notes?: string;
}

interface Project {
  projectId: string;
  projectName: string;
  projectCode: string;
}

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  submitted: "مقدم",
  approved: "معتمد",
  paid: "مدفوع",
  rejected: "مرفوض",
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

export default function IPCs() {
  const [ipcs, setIPCs] = useState<IPC[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIPC, setEditingIPC] = useState<IPC | null>(null);
  const [formData, setFormData] = useState<IPCFormData>({
    ipcNumber: "",
    projectId: "",
    ipcDate: new Date().toISOString().split("T")[0],
    periodStart: "",
    periodEnd: "",
    grossAmount: 0,
    deductions: 0,
    netAmount: 0,
    status: "draft",
    notes: "",
  });

  const fetchData = async () => {
    try {
      const [ipcsRes, projectsRes] = await Promise.all([
        api.get("/api/v1/finance/ipcs"),
        api.get("/api/v1/projects"),
      ]);
      setIPCs(ipcsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateNetAmount = (gross: number, deductions: number) => {
    return gross - deductions;
  };

  const handleGrossChange = (value: number) => {
    const net = calculateNetAmount(value, formData.deductions);
    setFormData({ ...formData, grossAmount: value, netAmount: net });
  };

  const handleDeductionsChange = (value: number) => {
    const net = calculateNetAmount(formData.grossAmount, value);
    setFormData({ ...formData, deductions: value, netAmount: net });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        netAmount: calculateNetAmount(
          formData.grossAmount,
          formData.deductions,
        ),
      };
      if (editingIPC) {
        await api.put(`/api/v1/finance/ipcs/${editingIPC.ipcId}`, payload);
      } else {
        await api.post("/api/v1/finance/ipcs", payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving IPC:", error);
    }
  };

  const handleEdit = (ipc: IPC) => {
    setEditingIPC(ipc);
    setFormData({
      ipcNumber: ipc.ipcNumber,
      projectId: ipc.projectId,
      ipcDate: ipc.ipcDate.split("T")[0],
      periodStart: ipc.periodStart.split("T")[0],
      periodEnd: ipc.periodEnd.split("T")[0],
      grossAmount: ipc.grossAmount,
      deductions: ipc.deductions,
      netAmount: ipc.netAmount,
      status: ipc.status,
      notes: ipc.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخلص؟")) return;
    try {
      await api.delete(`/api/v1/finance/ipcs/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting IPC:", error);
    }
  };

  const resetForm = () => {
    setEditingIPC(null);
    setFormData({
      ipcNumber: "",
      projectId: "",
      ipcDate: new Date().toISOString().split("T")[0],
      periodStart: "",
      periodEnd: "",
      grossAmount: 0,
      deductions: 0,
      netAmount: 0,
      status: "draft",
      notes: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">المستخلصات المالية</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + إضافة مستخلص
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                رقم المستخلص
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المشروع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                فترة العمل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المبلغ الإجمالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الاستقطاعات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الصافي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ipcs.map((ipc) => (
              <tr key={ipc.ipcId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ipc.ipcNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ipc.projectName || ipc.projectId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ipc.ipcDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ipc.periodStart)} - {formatDate(ipc.periodEnd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(ipc.grossAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                  -{formatCurrency(ipc.deductions)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(ipc.netAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      ipc.status,
                    )}`}
                  >
                    {statusLabels[ipc.status] || ipc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(ipc)}
                    className="text-blue-600 hover:text-blue-900 ml-3"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(ipc.ipcId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {ipcs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  لا توجد مستخلصات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingIPC ? "تعديل مستخلص" : "إضافة مستخلص جديد"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم المستخلص *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ipcNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, ipcNumber: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المشروع *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">اختر المشروع</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName} ({project.projectCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ المستخلص
                  </label>
                  <input
                    type="date"
                    value={formData.ipcDate}
                    onChange={(e) =>
                      setFormData({ ...formData, ipcDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as IPCFormData["status"],
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">مسودة</option>
                    <option value="submitted">مقدم</option>
                    <option value="approved">معتمد</option>
                    <option value="paid">مدفوع</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ بداية الفترة
                  </label>
                  <input
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) =>
                      setFormData({ ...formData, periodStart: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ نهاية الفترة
                  </label>
                  <input
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, periodEnd: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ الإجمالي
                  </label>
                  <input
                    type="number"
                    value={formData.grossAmount}
                    onChange={(e) => handleGrossChange(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاستقطاعات
                  </label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) =>
                      handleDeductionsChange(Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ الصافي
                  </label>
                  <input
                    type="number"
                    disabled
                    value={formData.netAmount}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingIPC ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
