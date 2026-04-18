import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Material {
  materialId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  category?: string;
}

interface PurchaseRequest {
  prId: string;
  prNumber: string;
  projectId?: string;
  projectName?: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "purchased";
  requestedBy?: string;
  notes?: string;
  items: PRItem[];
}

interface PRItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
}

interface MaterialFormData {
  materialName: string;
  materialCode: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  category?: string;
}

interface PRFormData {
  prNumber: string;
  projectId: string;
  requestDate: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected" | "purchased";
  notes?: string;
  items: PRItem[];
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "معتمد",
  rejected: "مرفوض",
  purchased: "تم الشراء",
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

export default function Supplies() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(
    [],
  );
  const [projects, setProjects] = useState<
    { projectId: string; projectName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"materials" | "requests">(
    "materials",
  );
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingPR, setEditingPR] = useState<PurchaseRequest | null>(null);

  const [materialForm, setMaterialForm] = useState<MaterialFormData>({
    materialName: "",
    materialCode: "",
    unit: "piece",
    currentStock: 0,
    minStock: 0,
    unitPrice: 0,
    category: "",
  });

  const [prForm, setPRForm] = useState<PRFormData>({
    prNumber: "",
    projectId: "",
    requestDate: new Date().toISOString().split("T")[0],
    requestedBy: "",
    status: "pending",
    notes: "",
    items: [],
  });

  const fetchData = async () => {
    try {
      const [materialsRes, prRes, projectsRes] = await Promise.all([
        api.get("/api/v1/supplies/materials"),
        api.get("/api/v1/supplies/purchase-requests"),
        api.get("/api/v1/projects"),
      ]);
      setMaterials(materialsRes.data.data || []);
      setPurchaseRequests(prRes.data.data || []);
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

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.put(
          `/api/v1/supplies/materials/${editingMaterial.materialId}`,
          materialForm,
        );
      } else {
        await api.post("/api/v1/supplies/materials", materialForm);
      }
      setShowMaterialModal(false);
      resetMaterialForm();
      fetchData();
    } catch (error) {
      console.error("Error saving material:", error);
    }
  };

  const handlePRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPR) {
        await api.put(
          `/api/v1/supplies/purchase-requests/${editingPR.prId}`,
          prForm,
        );
      } else {
        await api.post("/api/v1/supplies/purchase-requests", prForm);
      }
      setShowPRModal(false);
      resetPRForm();
      fetchData();
    } catch (error) {
      console.error("Error saving purchase request:", error);
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      materialName: material.materialName,
      materialCode: material.materialCode,
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock,
      unitPrice: material.unitPrice,
      category: material.category || "",
    });
    setShowMaterialModal(true);
  };

  const handleEditPR = (pr: PurchaseRequest) => {
    setEditingPR(pr);
    setPRForm({
      prNumber: pr.prNumber,
      projectId: pr.projectId || "",
      requestDate: pr.requestDate.split("T")[0],
      requestedBy: pr.requestedBy || "",
      status: pr.status,
      notes: pr.notes || "",
      items: pr.items || [],
    });
    setShowPRModal(true);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المواد؟")) return;
    try {
      await api.delete(`/api/v1/supplies/materials/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleDeletePR = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف طلب الشراء هذا؟")) return;
    try {
      await api.delete(`/api/v1/supplies/purchase-requests/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting purchase request:", error);
    }
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialForm({
      materialName: "",
      materialCode: "",
      unit: "piece",
      currentStock: 0,
      minStock: 0,
      unitPrice: 0,
      category: "",
    });
  };

  const resetPRForm = () => {
    setEditingPR(null);
    setPRForm({
      prNumber: "",
      projectId: "",
      requestDate: new Date().toISOString().split("T")[0],
      requestedBy: "",
      status: "pending",
      notes: "",
      items: [],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "purchased":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
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
        <h1 className="text-2xl font-bold text-[#e8eef4]">اللوازم والمستودعات</h1>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "materials"
              ? "bg-[#f5a623] text-[#0e1117]"
              : "bg-[#1e2738] text-[#e8eef4] border border-[#2a3448]"
          }`}
        >
          المواد
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "requests"
              ? "bg-[#f5a623] text-[#0e1117]"
              : "bg-[#1e2738] text-[#e8eef4] border border-[#2a3448]"
          }`}
        >
          طلبات الشراء
        </button>
      </div>

      {activeTab === "materials" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                resetMaterialForm();
                setShowMaterialModal(true);
              }}
              className="bg-[#f5a623] text-[#0e1117] px-4 py-2 rounded-lg hover:bg-[#d4921e] font-medium"
            >
              + إضافة مواد
            </button>
          </div>

          <div className="bg-[#161c27] rounded-lg border border-[#2a3448] overflow-hidden">
            <table className="min-w-full divide-y divide-[#2a3448]">
              <thead className="bg-[#1e2738]">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    اسم المواد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الرمز
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الوحدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    المخزون الحالي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الحد الأدنى
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#161c27] divide-y divide-[#2a3448]">
                {materials.map((material) => (
                  <tr key={material.materialId} className="hover:bg-[#1e2738]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#e8eef4]">
                        {material.materialName}
                      </div>
                      {material.category && (
                        <div className="text-sm text-[#8a95aa]">
                          {material.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {material.materialCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          material.currentStock < material.minStock
                            ? "text-red-400 font-medium"
                            : "text-[#e8eef4]"
                        }
                      >
                        {material.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {material.minStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {formatCurrency(material.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditMaterial(material)}
                        className="text-[#f5a623] hover:text-[#d4921e] ml-3"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteMaterial(material.materialId)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-[#8a95aa]"
                    >
                      لا توجد مواد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                resetPRForm();
                setShowPRModal(true);
              }}
              className="bg-[#f5a623] text-[#0e1117] px-4 py-2 rounded-lg hover:bg-[#d4921e] font-medium"
            >
              + طلب شراء
            </button>
          </div>

          <div className="bg-[#161c27] rounded-lg border border-[#2a3448] overflow-hidden">
            <table className="min-w-full divide-y divide-[#2a3448]">
              <thead className="bg-[#1e2738]">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    المشروع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    المطلوب بواسطة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#8a95aa] uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#161c27] divide-y divide-[#2a3448]">
                {purchaseRequests.map((pr) => (
                  <tr key={pr.prId} className="hover:bg-[#1e2738]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#e8eef4]">
                      {pr.prNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {pr.projectName || pr.projectId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {formatDate(pr.requestDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a95aa]">
                      {pr.requestedBy || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          pr.status,
                        )}`}
                      >
                        {statusLabels[pr.status] || pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditPR(pr)}
                        className="text-[#f5a623] hover:text-[#d4921e] ml-3"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeletePR(pr.prId)}
                        className="text-red-400 hover:text-red-300"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {purchaseRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-[#8a95aa]"
                    >
                      لا توجد طلبات شراء
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#161c27] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#2a3448]">
            <h2 className="text-xl font-bold mb-4 text-[#e8eef4]">
              {editingMaterial ? "تعديل مواد" : "إضافة مواد جديده"}
            </h2>
            <form onSubmit={handleMaterialSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    اسم المواد *
                  </label>
                  <input
                    type="text"
                    required
                    value={materialForm.materialName}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        materialName: e.target.value,
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    رمز المواد *
                  </label>
                  <input
                    type="text"
                    required
                    value={materialForm.materialCode}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        materialCode: e.target.value,
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الوحدة
                  </label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, unit: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  >
                    <option value="piece">قطعة</option>
                    <option value="ton">طن</option>
                    <option value="meter">متر</option>
                    <option value="liter">لتر</option>
                    <option value="bag">كيس</option>
                    <option value="box">صندوق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الفئة
                  </label>
                  <input
                    type="text"
                    value={materialForm.category || ""}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    المخزون الحالي
                  </label>
                  <input
                    type="number"
                    value={materialForm.currentStock}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        currentStock: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الحد الأدنى للمخزون
                  </label>
                  <input
                    type="number"
                    value={materialForm.minStock}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        minStock: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    سعر الوحدة
                  </label>
                  <input
                    type="number"
                    value={materialForm.unitPrice}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialModal(false);
                    resetMaterialForm();
                  }}
                  className="px-4 py-2 border border-[#2a3448] text-[#e8eef4] rounded hover:bg-[#1e2738]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5a623] text-[#0e1117] rounded hover:bg-[#d4921e] font-medium"
                >
                  {editingMaterial ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPRModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#161c27] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#2a3448]">
            <h2 className="text-xl font-bold mb-4 text-[#e8eef4]">
              {editingPR ? "تعديل طلب شراء" : "إضافة طلب شراء جديد"}
            </h2>
            <form onSubmit={handlePRSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    رقم الطلب *
                  </label>
                  <input
                    type="text"
                    required
                    value={prForm.prNumber}
                    onChange={(e) =>
                      setPRForm({ ...prForm, prNumber: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    المشروع
                  </label>
                  <select
                    value={prForm.projectId}
                    onChange={(e) =>
                      setPRForm({ ...prForm, projectId: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
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
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    تاريخ الطلب
                  </label>
                  <input
                    type="date"
                    value={prForm.requestDate}
                    onChange={(e) =>
                      setPRForm({ ...prForm, requestDate: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    المطلوب بواسطة
                  </label>
                  <input
                    type="text"
                    value={prForm.requestedBy || ""}
                    onChange={(e) =>
                      setPRForm({ ...prForm, requestedBy: e.target.value })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    الحالة
                  </label>
                  <select
                    value={prForm.status}
                    onChange={(e) =>
                      setPRForm({
                        ...prForm,
                        status: e.target.value as PRFormData["status"],
                      })
                    }
                    className="w-full border border-[#2a3448] rounded px-3 py-2 bg-[#0e1117] text-[#e8eef4] focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="approved">معتمد</option>
                    <option value="rejected">مرفوض</option>
                    <option value="purchased">تم الشراء</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#e8eef4] mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={prForm.notes || ""}
                    onChange={(e) =>
                      setPRForm({ ...prForm, notes: e.target.value })
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
                    setShowPRModal(false);
                    resetPRForm();
                  }}
                  className="px-4 py-2 border border-[#2a3448] text-[#e8eef4] rounded hover:bg-[#1e2738]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5a623] text-[#0e1117] rounded hover:bg-[#d4921e] font-medium"
                >
                  {editingPR ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
