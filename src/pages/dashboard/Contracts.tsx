import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Contract {
  contractId: string;
  contractNumber: string;
  contractName: string;
  projectId: string;
  projectName?: string;
  contractType:
    | "FIDIC_RED_BOOK"
    | "FIDIC_YELLOW_BOOK"
    | "FIDIC_SILVER_BOOK"
    | "CUSTOM";
  status: "draft" | "active" | "completed" | "terminated";
  contractValue: number;
  startDate: string;
  endDate: string;
  clientName?: string;
  contractorName?: string;
  notes?: string;
}

interface ContractFormData {
  contractNumber: string;
  contractName: string;
  projectId: string;
  contractType:
    | "FIDIC_RED_BOOK"
    | "FIDIC_YELLOW_BOOK"
    | "FIDIC_SILVER_BOOK"
    | "CUSTOM";
  status: "draft" | "active" | "completed" | "terminated";
  contractValue: number;
  startDate: string;
  endDate: string;
  clientName?: string;
  contractorName?: string;
  notes?: string;
}

const contractTypeLabels: Record<string, string> = {
  FIDIC_RED_BOOK: "فيديك الكتاب الأحمر",
  FIDIC_YELLOW_BOOK: "فيديك الكتاب الأصفر",
  FIDIC_SILVER_BOOK: "فيديك الكتاب الفضي",
  CUSTOM: "مخصص",
};

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  active: "نشط",
  completed: "مكتمل",
  terminated: "منتهي",
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

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [projects, setProjects] = useState<
    { projectId: string; projectName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>({
    contractNumber: "",
    contractName: "",
    projectId: "",
    contractType: "FIDIC_RED_BOOK",
    status: "draft",
    contractValue: 0,
    startDate: "",
    endDate: "",
    clientName: "",
    contractorName: "",
    notes: "",
  });

  const fetchContracts = async () => {
    try {
      const [contractsRes, projectsRes] = await Promise.all([
        api.get("/api/v1/contracts"),
        api.get("/api/v1/projects"),
      ]);
      setContracts(contractsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContract) {
        await api.put(
          `/api/v1/contracts/${editingContract.contractId}`,
          formData,
        );
      } else {
        await api.post("/api/v1/contracts", formData);
      }
      setShowModal(false);
      resetForm();
      fetchContracts();
    } catch (error) {
      console.error("Error saving contract:", error);
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      contractNumber: contract.contractNumber,
      contractName: contract.contractName,
      projectId: contract.projectId,
      contractType: contract.contractType,
      status: contract.status,
      contractValue: contract.contractValue,
      startDate: contract.startDate.split("T")[0],
      endDate: contract.endDate.split("T")[0],
      clientName: contract.clientName || "",
      contractorName: contract.contractorName || "",
      notes: contract.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العقد؟")) return;
    try {
      await api.delete(`/api/v1/contracts/${id}`);
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  const resetForm = () => {
    setEditingContract(null);
    setFormData({
      contractNumber: "",
      contractName: "",
      projectId: "",
      contractType: "FIDIC_RED_BOOK",
      status: "draft",
      contractValue: 0,
      startDate: "",
      endDate: "",
      clientName: "",
      contractorName: "",
      notes: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FIDIC_RED_BOOK":
        return "bg-red-100 text-red-800";
      case "FIDIC_YELLOW_BOOK":
        return "bg-yellow-100 text-yellow-800";
      case "FIDIC_SILVER_BOOK":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800";
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
        <h1 className="text-2xl font-bold">العقود (فيديك)</h1>
        <button
          onClick={openCreateModal}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          + إضافة عقد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                رقم العقد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                اسم العقد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المشروع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                نوع العقد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                القيمة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                تاريخ البداية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                تاريخ النهاية
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
            {contracts.map((contract) => (
              <tr key={contract.contractId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contract.contractNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {contract.contractName}
                  </div>
                  {contract.clientName && (
                    <div className="text-sm text-gray-500">
                      العميل: {contract.clientName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contract.projectName || contract.projectId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                      contract.contractType,
                    )}`}
                  >
                    {contractTypeLabels[contract.contractType] ||
                      contract.contractType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(contract.contractValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(contract.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(contract.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      contract.status,
                    )}`}
                  >
                    {statusLabels[contract.status] || contract.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(contract)}
                    className="text-blue-600 hover:text-blue-900 ml-3"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(contract.contractId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  لا توجد عقود
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
              {editingContract ? "تعديل عقد" : "إضافة عقد جديد"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم العقد *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contractNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractNumber: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العقد *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contractName}
                    onChange={(e) =>
                      setFormData({ ...formData, contractName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">اختر المشروع</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع العقد
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractType: e.target
                          .value as ContractFormData["contractType"],
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="FIDIC_RED_BOOK">فيديك الكتاب الأحمر</option>
                    <option value="FIDIC_YELLOW_BOOK">
                      فيديك الكتاب الأصفر
                    </option>
                    <option value="FIDIC_SILVER_BOOK">
                      فيديك الكتاب الفضي
                    </option>
                    <option value="CUSTOM">مخصص</option>
                  </select>
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
                        status: e.target.value as ContractFormData["status"],
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="draft">مسودة</option>
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="terminated">منتهي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    قيمة العقد
                  </label>
                  <input
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractValue: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    value={formData.clientName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المقاول
                  </label>
                  <input
                    type="text"
                    value={formData.contractorName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractorName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                >
                  {editingContract ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
