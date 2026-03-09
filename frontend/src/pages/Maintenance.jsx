import { useState, useEffect, useMemo, useCallback } from "react";
import { AlertTriangle, Calendar, Car, X, RotateCcw } from "lucide-react";
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import { vehicleAPI, maintenanceAPI } from "../services/api";

const Maintenance = () => {
  const { showToast } = useToast();
  const [allMaintenance, setAllMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll({ includeDeleted: "true" });
      const vehicles = response.data;

      const items = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      vehicles.forEach((vehicle) => {
        vehicle.maintenance?.forEach((m) => {
          let status = "Completed";

          if (m.isDeleted) {
            status = "Deleted";
          } else if (!m.isCompleted) {
            if (m.type === "OIL_CHANGE") {
              const mileageDiff = m.dueMileage - vehicle.currentMileage;
              if (mileageDiff <= 0) status = "Overdue";
              else if (mileageDiff <= 150) status = "Upcoming";
              else status = "Scheduled";
            } else {
              const dueDate = new Date(m.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              if (today >= dueDate) status = "Overdue";
              else if (dueDate <= sevenDaysLater) status = "Upcoming";
              else status = "Scheduled";
            }
          }

          items.push({
            id: m.id,
            vehicleId: vehicle.id,
            vehicle,
            type: m.type,
            dueDate: m.dueDate,
            dueMileage: m.dueMileage,
            currentMileage: vehicle.currentMileage,
            isCompleted: m.isCompleted,
            isDeleted: m.isDeleted,
            completedAt: m.completedAt,
            deletedAt: m.deletedAt,
            status,
          });
        });
      });

      setAllMaintenance(items);
    } catch (error) {
      showToast("Failed to load maintenance", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMaintenance();
  }, [loadMaintenance]);

  const { pending, upcoming, completed, deleted } = useMemo(() => {
    const filtered = allMaintenance.filter((item) => {
      const typeMatch =
        typeFilter === "All" ||
        (typeFilter === "Oil Change" && item.type === "OIL_CHANGE") ||
        (typeFilter === "Insurance" && item.type === "INSURANCE") ||
        (typeFilter === "Service" && item.type === "SERVICE");
      return typeMatch;
    });

    return {
      pending: filtered.filter((i) => i.status === "Overdue"),
      upcoming: filtered.filter((i) => i.status === "Upcoming"),
      completed: filtered.filter((i) => i.status === "Completed"),
      deleted: filtered.filter((i) => i.status === "Deleted"),
    };
  }, [allMaintenance, typeFilter]);

  const displayItems = useMemo(() => {
    if (statusFilter === "Pending") return pending;
    if (statusFilter === "Upcoming") return upcoming;
    if (statusFilter === "Completed") return completed;
    if (statusFilter === "Deleted") return deleted;
    return [...pending, ...upcoming, ...completed];
  }, [statusFilter, pending, upcoming, completed, deleted]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("currentMileage", Number(editModal.currentMileage) || 0);
      await vehicleAPI.update(editModal.vehicleId, formData);

      await maintenanceAPI.update({
        vehicleId: editModal.vehicleId,
        insuranceId: editModal.insuranceId || null,
        insuranceExpiry: editModal.insuranceExpiry || "",
        oilChangeId: editModal.oilChangeId || null,
        nextOilChange: Number(editModal.nextOilChange) || "",
        serviceId: editModal.serviceId || null,
        nextService: editModal.nextService || "",
      });

      showToast("Maintenance updated successfully", "success");
      setEditModal(null);
      loadMaintenance();
    } catch (error) {
      showToast("Failed to update maintenance", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await maintenanceAPI.softDelete(item.id);
      showToast("Alert removed", "success");
      loadMaintenance();
    } catch (error) {
      showToast("Failed to remove alert", "error");
    }
  };

  const handleRestore = async (item) => {
    try {
      await maintenanceAPI.restore(item.id);
      showToast("Alert restored", "success");
      loadMaintenance();
    } catch (error) {
      showToast("Failed to restore alert", "error");
    }
  };

  const typeConfig = {
    INSURANCE: { icon: "🛡️", label: "Insurance", color: "text-blue-600" },
    OIL_CHANGE: { icon: "🛢️", label: "Oil Change", color: "text-orange-600" },
    SERVICE: { icon: "🔧", label: "Service", color: "text-purple-600" },
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderTable = (items, title, showActions = true) => {
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {title === "Overdue Alerts" && (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            {title} ({items.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  VEHICLE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  TYPE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  DUE DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  MILEAGE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  STATUS
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    ACTION
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => {
                const config = typeConfig[item.type];
                const isDeleted = item.status === "Deleted";
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${item.status === "Overdue" ? "border-l-4 border-l-red-500" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-semibold">
                            {item.vehicle.brand} {item.vehicle.model}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.type === "OIL_CHANGE" ? (
                        <span className="text-gray-500">Mileage-based</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(item.dueDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.type === "OIL_CHANGE" ? (
                        <div>
                          <div>
                            Current: {item.currentMileage?.toLocaleString()} km
                          </div>
                          <div>Due: {item.dueMileage?.toLocaleString()} km</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Overdue"
                            ? "bg-red-100 text-red-700"
                            : item.status === "Upcoming"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    {showActions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!isDeleted && !item.isCompleted && (
                            <button
                              onClick={() => {
                                const insurance = item.vehicle.maintenance.find(
                                  (m) =>
                                    m.type === "INSURANCE" && !m.isCompleted,
                                );
                                const oilChange = item.vehicle.maintenance.find(
                                  (m) =>
                                    m.type === "OIL_CHANGE" && !m.isCompleted,
                                );
                                const service = item.vehicle.maintenance.find(
                                  (m) => m.type === "SERVICE" && !m.isCompleted,
                                );

                                setEditModal({
                                  vehicleId: item.vehicle.id,
                                  currentMileage: item.vehicle.currentMileage,
                                  insuranceId: insurance?.id || null,
                                  insuranceExpiry: insurance
                                    ? new Date(insurance.dueDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : "",
                                  oilChangeId: oilChange?.id || null,
                                  nextOilChange: oilChange?.dueMileage || "",
                                  serviceId: service?.id || null,
                                  nextService: service
                                    ? new Date(service.dueDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : "",
                                });
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Mark Complete
                            </button>
                          )}
                          {isDeleted ? (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  action: "restore",
                                  item,
                                  title: "Restore Alert",
                                  message:
                                    "Are you sure you want to restore this maintenance alert?",
                                })
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  action: "delete",
                                  item,
                                  title: "Remove Alert",
                                  message:
                                    "This will hide the alert from the active list. You can restore it later from the Deleted section.",
                                })
                              }
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={loadMaintenance}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Refresh
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{pending.length} Overdue</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Upcoming</option>
              <option>Completed</option>
              <option>Deleted</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option>All</option>
              <option>Oil Change</option>
              <option>Insurance</option>
              <option>Service</option>
            </select>
          </div>
          <div className="flex-1 flex items-end">
            <button
              onClick={() => {
                setStatusFilter("All");
                setTypeFilter("All");
              }}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {statusFilter === "All" ? (
        <>
          {renderTable(pending, "Overdue Alerts")}
          {renderTable(upcoming, "Upcoming Maintenance")}
          {renderTable(completed, "Completed Maintenance", false)}
        </>
      ) : (
        renderTable(
          displayItems,
          `${statusFilter} Maintenance`,
          statusFilter !== "Completed",
        )
      )}

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Update Maintenance"
      >
        {editModal && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Current Mileage
              </label>
              <input
                type="number"
                value={editModal.currentMileage || ""}
                onChange={(e) =>
                  setEditModal({ ...editModal, currentMileage: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Next Oil Change (km)
              </label>
              <input
                type="number"
                value={editModal.nextOilChange || ""}
                onChange={(e) =>
                  setEditModal({ ...editModal, nextOilChange: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Next Service Date
              </label>
              <input
                type="date"
                value={editModal.nextService || ""}
                onChange={(e) =>
                  setEditModal({ ...editModal, nextService: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Insurance Expiry
              </label>
              <input
                type="date"
                value={editModal.insuranceExpiry || ""}
                onChange={(e) =>
                  setEditModal({
                    ...editModal,
                    insuranceExpiry: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-3 pt-3">
              <Button type="submit" loading={saving} className="flex-1">
                Update
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => {
          if (confirmModal.action === "delete") handleDelete(confirmModal.item);
          else if (confirmModal.action === "restore")
            handleRestore(confirmModal.item);
          setConfirmModal(null);
        }}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmText={confirmModal?.action === "delete" ? "Remove" : "Restore"}
        variant={confirmModal?.action === "delete" ? "danger" : "success"}
      />
    </div>
  );
};

export default Maintenance;
