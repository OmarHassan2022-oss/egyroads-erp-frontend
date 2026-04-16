import { useEffect, useState } from "react";
import api from "../../api/axios";

interface Equipment {
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  status: "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE" | "OUT_OF_SERVICE";
  purchaseDate?: string;
  purchaseCost?: number;
  location?: string;
  notes?: string;
  maintenanceDate?: string;
  maintenanceNotes?: string;
}

interface EquipmentFormData {
  equipmentName: string;
  equipmentCode: string;
  status: "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE" | "OUT_OF_SERVICE";
  purchaseDate: string;
  purchaseCost: number;
  location?: string;
  notes?: string;
  maintenanceDate?: string;
  maintenanceNotes?: string;
}

const statusLabels: Record<string, string> = {
  AVAILABLE: "متاح",
  IN_USE: "قيد الاستخدام",
  UNDER_MAINTENANCE: "تحت الصيانة",
  OUT_OF_SERVICE: "خارج الخدمة",
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function Equipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const [maintenanceEquipment, setMaintenanceEquipment] =
    useState<Equipment | null>(null);
  const [formData, setFormData] = useState<EquipmentFormData>({
    equipmentName: "",
    equipmentCode: "",
    status: "AVAILABLE",
    purchaseDate: "",
    purchaseCost: 0,
    location: "",
    notes: "",
    maintenanceDate: "",
    maintenanceNotes: "",
  });

  const fetchEquipment = async () => {
    try {
      const response = await api.get("/api/v1/equipment");
      setEquipment(response.data.data || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await api.put(
          `/api/v1/equipment/${editingEquipment.equipmentId}`,
          formData,
        );
      } else {
        await api.post("/api/v1/equipment", formData);
      }
      setShowModal(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceEquipment) return;
    try {
      await api.put(`/api/v1/equipment/${maintenanceEquipment.equipmentId}`, {
        status: "UNDER_MAINTENANCE",
        maintenanceDate: formData.maintenanceDate,
        maintenanceNotes: formData.maintenanceNotes,
      });
      setShowMaintenanceModal(false);
      resetMaintenanceForm();
      fetchEquipment();
    } catch (error) {
      console.error("Error saving maintenance:", error);
    }
  };

  const handleEdit = (equip: Equipment) => {
    setEditingEquipment(equip);
    setFormData({
      equipmentName: equip.equipmentName,
      equipmentCode: equip.equipmentCode,
      status: equip.status,
      purchaseDate: equip.purchaseDate ? equip.purchaseDate.split("T")[0] : "",
      purchaseCost: equip.purchaseCost || 0,
      location: equip.location || "",
      notes: equip.notes || "",
      maintenanceDate: equip.maintenanceDate
        ? equip.maintenanceDate.split("T")[0]
        : "",
      maintenanceNotes: equip.maintenanceNotes || "",
    });
    setShowModal(true);
  };

  const openMaintenanceModal = (equip: Equipment) => {
    setMaintenanceEquipment(equip);
    setFormData({
      ...formData,
      maintenanceDate: new Date().toISOString().split("T")[0],
      maintenanceNotes: "",
    });
    setShowMaintenanceModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعده؟")) return;
    try {
      await api.delete(`/api/v1/equipment/${id}`);
      fetchEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
    }
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setFormData({
      equipmentName: "",
      equipmentCode: "",
      status: "AVAILABLE",
      purchaseDate: "",
      purchaseCost: 0,
      location: "",
      notes: "",
      maintenanceDate: "",
      maintenanceNotes: "",
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceEquipment(null);
    setFormData({
      ...formData,
      maintenanceDate: "",
      maintenanceNotes: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "IN_USE":
        return "bg-blue-100 text-blue-800";
      case "UNDER_MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_OF_SERVICE":
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
        <h1 className="text-2xl font-bold">المعدات والأ机械设备</h1>
        <button
          onClick={openCreateModal}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          + إضافة معده
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                اسم المعده
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الرمز
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                التكلفة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                تاريخ الشراء
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الموقع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((equip) => (
              <tr key={equip.equipmentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {equip.equipmentName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equip.equipmentCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      equip.status,
                    )}`}
                  >
                    {statusLabels[equip.status] || equip.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equip.purchaseCost
                    ? formatCurrency(equip.purchaseCost)
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(equip.purchaseDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {equip.location || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(equip)}
                    className="text-blue-600 hover:text-blue-900 ml-3"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => openMaintenanceModal(equip)}
                    className="text-yellow-600 hover:text-yellow-900 ml-3"
                  >
                    صيانة
                  </button>
                  <button
                    onClick={() => handleDelete(equip.equipmentId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {equipment.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  لا توجد معدات
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
              {editingEquipment ? "تعديل معده" : "إضافة معده جديده"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المعده *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.equipmentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رمز المعده *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.equipmentCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentCode: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                        status: e.target.value as EquipmentFormData["status"],
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="AVAILABLE">متاح</option>
                    <option value="IN_USE">قيد الاستخدام</option>
                    <option value="UNDER_MAINTENANCE">تحت الصيانة</option>
                    <option value="OUT_OF_SERVICE">خارج الخدمة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الشراء
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تكلفة الشراء
                  </label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseCost: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الموقع
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  {editingEquipment ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">تسجيل صيانة</h2>
            <form onSubmit={handleMaintenanceSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المعده
                  </label>
                  <input
                    type="text"
                    disabled
                    value={maintenanceEquipment?.equipmentName || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الصيانة
                  </label>
                  <input
                    type="date"
                    value={formData.maintenanceDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceDate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات الصيانة
                  </label>
                  <textarea
                    value={formData.maintenanceNotes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceNotes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    resetMaintenanceForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
