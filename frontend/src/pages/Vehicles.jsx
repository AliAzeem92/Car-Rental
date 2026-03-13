import { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import { vehicleAPI, maintenanceAPI } from "../services/api";
import StatusDropdown from "../components/StatusDropdown";
import Dropdown from "../components/Dropdown";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";
import { compressImage } from "../utils/imageCompression";

const transmissionOptions = [
  { value: "Manual", label: "Manual", color: "bg-gray-500" },
  { value: "Automatic", label: "Automatic", color: "bg-blue-500" },
  { value: "CVT", label: "CVT", color: "bg-purple-500" },
];

const fuelTypeOptions = [
  { value: "Petrol", label: "Petrol", color: "bg-orange-500" },
  { value: "Diesel", label: "Diesel", color: "bg-yellow-600" },
  { value: "Hybrid", label: "Hybrid", color: "bg-teal-500" },
  { value: "Electric", label: "Electric", color: "bg-green-500" },
  { value: "LPG", label: "LPG", color: "bg-indigo-500" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Available", color: "bg-green-500" },
  { value: "RESERVED", label: "Reserved", color: "bg-yellow-500" },
  { value: "RENTED", label: "Rented", color: "bg-blue-500" },
  { value: "MAINTENANCE", label: "Maintenance", color: "bg-red-500" },
];

const availabilityOptions = [
  { value: true, label: "Available", color: "bg-green-500" },
  { value: false, label: "Un-Available", color: "bg-gray-500" },
];

const Vehicles = () => {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [filter, setFilter] = useState({ status: "", category: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "2026",
    licensePlate: "",
    category: "",
    color: "",
    seats: "",
    transmission: "Manual",
    fuelType: "Petrol",
    status: "AVAILABLE",
    description: "",
    features: "",
    dailyPrice: "",
    deposit: "",
    mileage: "",
    insuranceExpiry: "",
    nextOilChange: "",
    nextService: "",
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    loadVehicles();
  }, [filter]);

  const loadVehicles = async () => {
    try {
      const { data } = await vehicleAPI.getAll(filter);
      setVehicles(data);
    } catch (error) {
      showToast("Failed to load vehicles", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length > 4) {
      showToast("Maximum 4 images allowed", "warning");
      return;
    }
    setLoading(true);
    try {
      const formDataObj = new FormData();
      const vehicleFields = [
        "brand",
        "model",
        "year",
        "licensePlate",
        "category",
        "color",
        "seats",
        "transmission",
        "fuelType",
        "status",
        "description",
        "features",
        "dailyPrice",
        "deposit",
        "mileage",
      ];
      vehicleFields.forEach((key) => {
        if (formData[key]) formDataObj.append(key, formData[key]);
      });

      for (const img of images) {
        const compressed = await compressImage(img);
        formDataObj.append("images", compressed);
      }

      const { data: vehicle } = await vehicleAPI.create(formDataObj);

      // Create maintenance records separately
      if (
        formData.insuranceExpiry ||
        formData.nextOilChange ||
        formData.nextService
      ) {
        await maintenanceAPI.update({
          vehicleId: vehicle.id,
          insuranceExpiry: formData.insuranceExpiry || "",
          nextOilChange: formData.nextOilChange || "",
          nextService: formData.nextService || "",
        });
      }

      showToast("Vehicle created successfully!", "success");
      setShowModal(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      showToast(
        error.response?.data?.error || "Failed to create vehicle",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (images.length + existingImages.length > 4) {
      showToast("Maximum 4 images allowed", "warning");
      return;
    }
    setLoading(true);
    try {
      // Vehicle payload - only vehicle data
      const formDataObj = new FormData();
      formDataObj.append("brand", editModal.brand);
      formDataObj.append("model", editModal.model);
      formDataObj.append("licensePlate", editModal.licensePlate);
      formDataObj.append("category", editModal.category);
      formDataObj.append("dailyPrice", editModal.dailyPrice);
      formDataObj.append("deposit", editModal.deposit);
      formDataObj.append(
        "currentMileage",
        editModal.currentMileage || editModal.mileage,
      );
      formDataObj.append("isAvailable", editModal.isAvailable);
      if (editModal.year) formDataObj.append("year", editModal.year);
      if (editModal.color) formDataObj.append("color", editModal.color);
      if (editModal.seats) formDataObj.append("seats", editModal.seats);
      if (editModal.transmission)
        formDataObj.append("transmission", editModal.transmission);
      if (editModal.fuelType)
        formDataObj.append("fuelType", editModal.fuelType);
      if (editModal.description)
        formDataObj.append("description", editModal.description);
      if (editModal.features)
        formDataObj.append("features", editModal.features);
      formDataObj.append(
        "existingImageIds",
        JSON.stringify(existingImages.map((img) => img.id)),
      );

      for (const img of images) {
        const compressed = await compressImage(img);
        formDataObj.append("images", compressed);
      }

      // Update vehicle
      await vehicleAPI.update(editModal.id, formDataObj);

      // Maintenance payload - separate API call
      const maintenancePayload = {
        vehicleId: editModal.id,
        insuranceId: editModal.insuranceId || null,
        insuranceExpiry: editModal.insuranceExpiry || "",
        oilChangeId: editModal.oilChangeId || null,
        nextOilChange: editModal.nextOilChange || "",
        serviceId: editModal.serviceId || null,
        nextService: editModal.nextService || "",
      };

      // Update maintenance
      await maintenanceAPI.update(maintenancePayload);

      showToast("Vehicle updated successfully!", "success");
      setEditModal(null);
      resetForm();

      setTimeout(() => {
        loadVehicles();
        if (window.refreshMaintenanceAlerts) {
          window.refreshMaintenanceAlerts();
        }
      }, 500);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update vehicle",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    showToast(
      "Vehicle status is managed automatically by the system",
      "warning",
    );
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: "2026",
      licensePlate: "",
      category: "",
      color: "",
      seats: "",
      transmission: "Manual",
      fuelType: "Petrol",
      status: "AVAILABLE",
      description: "",
      features: "",
      dailyPrice: "",
      deposit: "",
      mileage: "",
      insuranceExpiry: "",
      nextOilChange: "",
      nextService: "",
    });
    setImages([]);
    setExistingImages([]);
  };

  const handleEditClick = (vehicle) => {
    setEditModal({
      ...vehicle,
      currentMileage: vehicle.currentMileage || vehicle.mileage,
      isAvailable: vehicle.isAvailable ?? true,
    });
    setExistingImages(vehicle.vehicleimage || []);
    setImages([]);

    if (vehicle.maintenance && vehicle.maintenance.length > 0) {
      const insurance = vehicle.maintenance.find(
        (m) => m.type === "INSURANCE" && !m.isCompleted,
      );
      const oilChange = vehicle.maintenance.find(
        (m) => m.type === "OIL_CHANGE" && !m.isCompleted,
      );
      const service = vehicle.maintenance.find(
        (m) => m.type === "SERVICE" && !m.isCompleted,
      );

      setEditModal((prev) => ({
        ...prev,
        insuranceId: insurance?.id || null,
        insuranceExpiry: insurance
          ? new Date(insurance.dueDate).toISOString().split("T")[0]
          : "",
        oilChangeId: oilChange?.id || null,
        nextOilChange: oilChange?.dueMileage || "",
        serviceId: service?.id || null,
        nextService: service
          ? new Date(service.dueDate).toISOString().split("T")[0]
          : "",
      }));
    }
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handlePageChange = (newPage) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 150);
  };

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const paginatedVehicles = vehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-5 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vehicles</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 table-responsive">
        <table className="w-full" style={{ minWidth: '700px' }}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Photo
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Vehicle
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Plate
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Category
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Daily Price
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Mileage
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 transition-opacity duration-150 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {paginatedVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-sm">
                  No vehicles available
                </td>
              </tr>
            ) : (
              paginatedVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className={`hover:bg-gray-50 transition-colors ${!vehicle.isAvailable ? "opacity-50 bg-gray-50" : ""}`}
                >
                <td className="px-4 py-3.5">
                  <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {vehicle.vehicleimage?.[0] ? (
                      <img
                        src={vehicle.vehicleimage[0].imageUrl}
                        alt={vehicle.model}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🚗
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="text-xs text-gray-500">
                    #{vehicle.id}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                    {vehicle.licensePlate}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-800 whitespace-nowrap">
                  {vehicle.category}
                </td>
                <td className="px-4 py-3.5 text-xs font-semibold text-blue-600 whitespace-nowrap">
                  €{vehicle.dailyPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-800 whitespace-nowrap">
                  {vehicle.currentMileage || vehicle.mileage} km
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                      !vehicle.isAvailable
                        ? "bg-gray-100 text-gray-700"
                        : vehicle.status === "AVAILABLE"
                          ? "bg-green-100 text-green-700"
                          : vehicle.status === "RESERVED"
                            ? "bg-yellow-100 text-yellow-700"
                            : vehicle.status === "RENTED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    {!vehicle.isAvailable ? "UNAVAILABLE" : vehicle.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(vehicle)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
        <span className="text-center sm:text-left">
          Showing {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, vehicles.length)} of{" "}
          {vehicles.length}
        </span>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                currentPage === i + 1 ? "bg-blue-500 text-white border-blue-500" : "hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add New Vehicle"
        size="max-w-4xl"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-1"
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    placeholder="Toyota"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    placeholder="Camry"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder="2026"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    placeholder="ABC-1234"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({ ...formData, licensePlate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="SUV"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Black"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Transmission
                  </label>
                  <Dropdown
                    value={formData.transmission}
                    onChange={(value) =>
                      setFormData({ ...formData, transmission: value })
                    }
                    options={transmissionOptions}
                    showColor={true}
                    width="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <Dropdown
                    value={formData.fuelType}
                    onChange={(value) =>
                      setFormData({ ...formData, fuelType: value })
                    }
                    options={fuelTypeOptions}
                    showColor={true}
                    width="w-full"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Vehicle description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                />
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="GPS, Bluetooth, Backup Camera"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Pricing & Mileage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Daily Price (€) *
                  </label>
                  <input
                    type="number"
                    placeholder="120.00"
                    value={formData.dailyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyPrice: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Deposit (€)
                  </label>
                  <input
                    type="number"
                    placeholder="500.00"
                    value={formData.deposit}
                    onChange={(e) =>
                      setFormData({ ...formData, deposit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    placeholder="20000"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Maintenance & Alerts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insuranceExpiry: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Next Oil Change (km)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={formData.nextOilChange}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextOilChange: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextService}
                    onChange={(e) =>
                      setFormData({ ...formData, nextService: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Photos ({images.length}/4)
              </h3>
              <div className="flex gap-3 flex-wrap">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 mt-2">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImages([...images, file]);
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button type="submit" loading={loading} className="flex-1">
              Create Vehicle
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editModal}
        onClose={() => {
          setEditModal(null);
          resetForm();
        }}
        title="Edit Vehicle"
        size="max-w-5xl"
      >
        {editModal && (
          <form
            onSubmit={handleUpdate}
            className="space-y-1"
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={editModal.brand}
                      onChange={(e) =>
                        setEditModal({ ...editModal, brand: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={editModal.model}
                      onChange={(e) =>
                        setEditModal({ ...editModal, model: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={editModal.year || ""}
                      onChange={(e) =>
                        setEditModal({ ...editModal, year: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      License Plate *
                    </label>
                    <input
                      type="text"
                      value={editModal.licensePlate}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          licensePlate: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editModal.category}
                      onChange={(e) =>
                        setEditModal({ ...editModal, category: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={editModal.color || ""}
                      onChange={(e) =>
                        setEditModal({ ...editModal, color: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Seats
                    </label>
                    <input
                      type="number"
                      value={editModal.seats || ""}
                      onChange={(e) =>
                        setEditModal({ ...editModal, seats: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transmission
                    </label>
                    <Dropdown
                      value={editModal.transmission || "Manual"}
                      onChange={(value) =>
                        setEditModal({ ...editModal, transmission: value })
                      }
                      options={transmissionOptions}
                      showColor={true}
                      width="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <Dropdown
                      value={editModal.fuelType || "Petrol"}
                      onChange={(value) =>
                        setEditModal({ ...editModal, fuelType: value })
                      }
                      options={fuelTypeOptions}
                      showColor={true}
                      width="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Dropdown
                      value={editModal.status}
                      onChange={(value) =>
                        setEditModal({ ...editModal, status: value })
                      }
                      options={statusOptions}
                      showColor={true}
                      width="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <Dropdown
                      value={editModal.isAvailable}
                      onChange={(value) =>
                        setEditModal({ ...editModal, isAvailable: value })
                      }
                      options={availabilityOptions}
                      showColor={true}
                      width="w-full"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editModal.description || ""}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="5"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editModal.features || ""}
                    onChange={(e) =>
                      setEditModal({ ...editModal, features: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Pricing & Mileage
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Daily Price (€) *
                    </label>
                    <input
                      type="number"
                      value={editModal.dailyPrice}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          dailyPrice: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Deposit (€)
                    </label>
                    <input
                      type="number"
                      value={editModal.deposit}
                      onChange={(e) =>
                        setEditModal({ ...editModal, deposit: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Current Mileage (km)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter current mileage"
                      value={
                        editModal.currentMileage || editModal.mileage || ""
                      }
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          currentMileage: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Maintenance & Alerts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Next Oil Change (km)
                    </label>
                    <input
                      type="number"
                      placeholder="25000"
                      value={editModal.nextOilChange || ""}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          nextOilChange: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Next Service Date
                    </label>
                    <input
                      type="date"
                      value={editModal.nextService || ""}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          nextService: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Insurance Expiry Date
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Photos ({existingImages.length + images.length}/4)
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300"
                    >
                      <img
                        src={img.imageUrl}
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {images.map((img, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {existingImages.length + images.length < 4 && (
                    <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500 mt-2">
                        Add Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setImages([...images, file]);
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button type="submit" loading={loading} className="flex-1">
                Update Vehicle
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditModal(null);
                  resetForm();
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Vehicles;
