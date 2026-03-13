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
  ChevronDown,
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
  const [showFilters, setShowFilters] = useState(false);
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
        }
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
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5 page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Reservations
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> Create Reservation
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3">
        {/* Search + filter toggle row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Mobile: toggle extra filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm transition-colors flex-shrink-0"
          >
            <Grid className="w-4 h-4 text-gray-600" />
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Desktop filter selects inline */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>All Vehicles</option>
            </select>
            <select className="px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* Mobile expanded filters */}
        {showFilters && (
          <div className="sm:hidden grid grid-cols-1 gap-2 animate-slideDown">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>All Vehicles</option>
            </select>
            <select className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>This Month</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 table-responsive min-h-[350px] pb-12">
        <table className="w-full" style={{ minWidth: "860px" }}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Reference #",
                "Customer",
                "Vehicle",
                "Pick-Up",
                "Return",
                "Days",
                "Total",
                "Payment",
                "Status",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
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
                    <p className="text-gray-500 text-sm">
                      Loading reservations...
                    </p>
                  </div>
                </td>
              </tr>
            ) : paginatedReservations.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-12 text-center text-gray-500 text-sm"
                >
                  No reservations found
                </td>
              </tr>
            ) : (
              paginatedReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <span className="text-blue-600 text-xs font-mono">
                      {reservation.contractNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 text-xs whitespace-nowrap">
                    {reservation.user?.firstName} {reservation.user?.lastName}
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 text-xs whitespace-nowrap">
                    {reservation.vehicle?.brand} {reservation.vehicle?.model}
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 text-xs whitespace-nowrap">
                    {formatDate(reservation.startDate)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 text-xs whitespace-nowrap">
                    {formatDate(reservation.endDate)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-800 text-xs text-center">
                    {calculateDays(reservation.startDate, reservation.endDate)}
                  </td>
                  <td className="px-4 py-3.5 text-blue-600 text-xs font-semibold whitespace-nowrap">
                    €{reservation.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusDropdown
                      value={reservation.paymentStatus || "UNPAID"}
                      onChange={handleStatusChange}
                      reservationId={reservation.id}
                      type="payment"
                      loading={loadingStates[`${reservation.id}-payment`]}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusDropdown
                      value={reservation.status}
                      onChange={handleStatusChange}
                      reservationId={reservation.id}
                      width="w-[113px]"
                      loading={loadingStates[`${reservation.id}-status`]}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewModal(reservation)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditModal(reservation)}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {(reservation.status === "CONFIRMED" ||
                        reservation.status === "COMPLETED") && (
                        <button
                          onClick={() => handleDownloadInvoice(reservation.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
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

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
        <span className="text-center sm:text-left">
          Showing {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, filteredReservations.length)} of{" "}
          {filteredReservations.length}
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
                currentPage === i + 1
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-gray-50"
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

      {/* ── Create Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Reservation"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={formData.vehicleId}
              onChange={(e) =>
                setFormData({ ...formData, vehicleId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Total Price"
              value={formData.totalPrice}
              onChange={(e) =>
                setFormData({ ...formData, totalPrice: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Deposit Paid"
              value={formData.depositPaid}
              onChange={(e) =>
                setFormData({ ...formData, depositPaid: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-colors text-sm"
            >
              Create Reservation
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Reservation Details"
        size="max-w-xl"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contract Number
                </label>
                <p className="text-gray-900 font-mono text-sm mt-0.5">
                  {viewModal.contractNumber}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="mt-0.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusColors[viewModal.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {viewModal.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Customer
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.user?.firstName} {viewModal.user?.lastName}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Vehicle
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.vehicle?.brand} {viewModal.vehicle?.model}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pick-Up Date
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {formatDate(viewModal.startDate)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Return Date
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {formatDate(viewModal.endDate)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pickup Location
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.pickupLocation || viewModal.destination || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Return Location
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.returnLocation || viewModal.destination || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Rental Price
                </label>
                <p className="text-gray-900 font-semibold text-sm mt-0.5">
                  €{viewModal.totalPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Deposit Paid
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  €{viewModal.depositPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Extra Charges
                </label>
                <p className="text-gray-900 font-semibold text-sm mt-0.5">
                  €{viewModal.checkin?.extraCharges?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="sm:col-span-2 bg-blue-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Final Total Price
                </label>
                <p className="text-blue-600 text-2xl font-bold mt-1">
                  €
                  {(
                    viewModal.totalPrice + (viewModal.checkin?.extraCharges || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Check-In Details */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Check-In Details
              </h3>
              {viewModal.checkin ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Mileage In
                    </label>
                    <p className="text-gray-900 text-sm mt-0.5">
                      {viewModal.checkin.mileageIn?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Extra Charges
                    </label>
                    <p className="text-gray-900 text-sm mt-0.5">
                      €{viewModal.checkin.extraCharges?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Damage Report
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-xl text-sm mt-1">
                      {viewModal.checkin.damageReport || "No damage reported"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  Vehicle has not been checked in yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
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
                await reservationAPI.updateStatus(editModal.id, editModal.status);
                setEditModal(null);
                loadData();
              } catch (error) {
                alert("Failed to update");
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={new Date(editModal.startDate).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEditModal({ ...editModal, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-colors text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-colors text-sm"
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
