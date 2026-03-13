import { useState, useEffect } from "react";
import {
  Search,
  Grid,
  X,
  Calendar,
  Plus,
  Eye,
  Edit,
  Download,
} from "lucide-react";
import {
  reservationAPI,
  vehicleAPI,
  customerAPI,
  checkInOutAPI,
} from "../services/api";
import StatusDropdown from "../components/StatusDropdown";
import Modal from "../components/Modal";
import CheckInModal from "../components/CheckInModal";
import { RESERVATION_STATUS } from "../utils/constants";
import { useToast } from "../context/ToastContext";

const Reservations = () => {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [checkInModal, setCheckInModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    vehicleId: "",
    customerId: "",
    startDate: "",
    endDate: "",
    totalPrice: "",
    depositPaid: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, vehData, custData] = await Promise.all([
        reservationAPI.getAll(),
        vehicleAPI.getAll(),
        customerAPI.getAll(),
      ]);
      setReservations(resData.data || []);
      setVehicles(vehData.data || []);
      setCustomers(custData.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reservationAPI.create({ ...formData, userId: formData.customerId });
      setShowModal(false);
      setFormData({
        vehicleId: "",
        customerId: "",
        startDate: "",
        endDate: "",
        totalPrice: "",
        depositPaid: "",
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create reservation");
    }
  };

  const handleStatusChange = async (id, status, type) => {
    const loadingKey = `${id}-${type}`;
    setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      if (type === "payment") {
        await reservationAPI.updatePaymentStatus(id, status);
      } else {
        await reservationAPI.updateStatus(id, status);

        // If status is COMPLETED, show check-in modal
        if (status === "COMPLETED") {
          const reservation = reservations.find((r) => r.id === id);
          if (reservation && !reservation.checkin) {
            setCheckInModal(reservation);
          }
        }
      }
      loadData();
      showToast("Status updated successfully", "success");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update status";
      showToast(message, "error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleCheckIn = async (formData) => {
    try {
      await checkInOutAPI.createCheckIn(checkInModal.id, formData);
      showToast("Vehicle checked in successfully", "success");
      loadData();
    } catch (error) {
      showToast(error.response?.data?.error || "Check-in failed", "error");
      throw error;
    }
  };

  const handleDownloadInvoice = async (reservationId) => {
    try {
      const response = await fetch(
        `/api/invoices/reservations/${reservationId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to generate invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${reservationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Invoice downloaded successfully", "success");
    } catch (error) {
      showToast("Failed to download invoice", "error");
    }
  };

  const statusColors = RESERVATION_STATUS;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const calculateDays = (start, end) =>
    Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

  const handlePageChange = (newPage) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 150);
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      searchTerm === "" ||
      res.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Statuses" ||
      res.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reservations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Create Reservation
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Ongoing</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option>All Vehicles</option>
        </select>
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option>This Month</option>
        </select>
        <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Grid className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Calendar className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Reference #
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Vehicle
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Pick-Up
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Return
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Days
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Payment
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 transition-opacity duration-150 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <tr>
                <td colSpan="10" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500" />
                    <p className="text-gray-500 text-sm">Loading reservations...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedReservations.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No reservations found
                </td>
              </tr>
            ) : (
              paginatedReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <span className="text-blue-600 text-xs ">
                      {reservation.contractNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 text-xs">
                    {reservation.user?.firstName} {reservation.user?.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-800 text-xs">
                    {reservation.vehicle?.brand} {reservation.vehicle?.model}
                  </td>
                  <td className="px-6 py-4 text-gray-800 text-xs">
                    {formatDate(reservation.startDate)}
                  </td>
                  <td className="px-6 py-4 text-gray-800 text-xs">
                    {formatDate(reservation.endDate)}
                  </td>
                  <td className="px-6 py-4 text-gray-800 text-xs text-center">
                    {calculateDays(reservation.startDate, reservation.endDate)}
                  </td>
                  <td className="px-6 py-4 text-blue-600 text-xs font-semibold">
                    €{reservation.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      value={reservation.paymentStatus || "UNPAID"}
                      onChange={handleStatusChange}
                      reservationId={reservation.id}
                      type="payment"
                      loading={loadingStates[`${reservation.id}-payment`]}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      value={reservation.status}
                      onChange={handleStatusChange}
                      reservationId={reservation.id}
                      width="w-[113px]"
                      loading={loadingStates[`${reservation.id}-status`]}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewModal(reservation)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditModal(reservation)}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {(reservation.status === "CONFIRMED" ||
                        reservation.status === "COMPLETED") && (
                        <button
                          onClick={() => handleDownloadInvoice(reservation.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredReservations.length)} of{" "}
          {filteredReservations.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-50 ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : ""
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
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Reservation"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.vehicleId}
              onChange={(e) =>
                setFormData({ ...formData, vehicleId: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} - ${v.dailyPrice}/day
                </option>
              ))}
            </select>
            <select
              value={formData.customerId}
              onChange={(e) =>
                setFormData({ ...formData, customerId: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Total Price"
              value={formData.totalPrice}
              onChange={(e) =>
                setFormData({ ...formData, totalPrice: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Deposit Paid"
              value={formData.depositPaid}
              onChange={(e) =>
                setFormData({ ...formData, depositPaid: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Create Reservation
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Reservation Details"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Contract Number
                </label>
                <p className="text-gray-900">{viewModal.contractNumber}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Status
                </label>
                <p className="text-gray-900">{viewModal.status}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Customer
                </label>
                <p className="text-gray-900">
                  {viewModal.user?.firstName} {viewModal.user?.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Vehicle
                </label>
                <p className="text-gray-900">
                  {viewModal.vehicle?.brand} {viewModal.vehicle?.model}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Pick-Up Date
                </label>
                <p className="text-gray-900">
                  {formatDate(viewModal.startDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Return Date
                </label>
                <p className="text-gray-900">{formatDate(viewModal.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Pickup Location
                </label>
                <p className="text-gray-900">
                  {viewModal.pickupLocation || viewModal.destination || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Return Location
                </label>
                <p className="text-gray-900">
                  {viewModal.returnLocation || viewModal.destination || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Original Rental Price
                </label>
                <p className="text-gray-900 font-semibold">
                  €{viewModal.totalPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Deposit Paid
                </label>
                <p className="text-gray-900">
                  €{viewModal.depositPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Extra Charges
                </label>
                <p className="text-gray-900 font-semibold">
                  €{viewModal.checkin?.extraCharges?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-600">
                  Final Total Price
                </label>
                <p className="text-blue-600 text-xl font-bold">
                  €
                  {(
                    viewModal.totalPrice +
                    (viewModal.checkin?.extraCharges || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Check-In Details Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Check-In Details
              </h3>
              {viewModal.checkin ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Mileage In
                    </label>
                    <p className="text-gray-900">
                      {viewModal.checkin.mileageIn?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Extra Charges
                    </label>
                    <p className="text-gray-900">
                      €{viewModal.checkin.extraCharges?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-600">
                      Damage Report
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {viewModal.checkin.damageReport || "No damage reported"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Vehicle has not been checked in yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Reservation"
      >
        {editModal && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await reservationAPI.updateStatus(
                  editModal.id,
                  editModal.status,
                );
                setEditModal(null);
                loadData();
              } catch (error) {
                alert("Failed to update");
              }
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={new Date(editModal.startDate)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    setEditModal({ ...editModal, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={new Date(editModal.endDate).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEditModal({ ...editModal, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Total Price
                </label>
                <input
                  type="number"
                  value={editModal.totalPrice}
                  onChange={(e) =>
                    setEditModal({ ...editModal, totalPrice: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Deposit Paid
                </label>
                <input
                  type="number"
                  value={editModal.depositPaid}
                  onChange={(e) =>
                    setEditModal({ ...editModal, depositPaid: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      <CheckInModal
        isOpen={!!checkInModal}
        onClose={() => setCheckInModal(null)}
        reservation={checkInModal}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};

export default Reservations;
