import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, MapPin, Car, Clock, CheckCircle, ClockIcon, XCircle, AlertCircle, X } from "lucide-react";
import { reservationAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

const CustomerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReservations();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchReservations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getCustomerReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold";
    switch (status) {
      case "CONFIRMED":
        return `${base} bg-green-100 text-green-800 border border-green-200`;
      case "PENDING":
        return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case "COMPLETED":
        return `${base} bg-blue-100 text-blue-800 border border-blue-200`;
      case "CANCELLED":
        return `${base} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${base} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CONFIRMED": return <CheckCircle className="h-4 w-4" />;
      case "PENDING":   return <ClockIcon className="h-4 w-4" />;
      case "COMPLETED": return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED": return <XCircle className="h-4 w-4" />;
      default:          return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedReservation) return;

    setCancellingId(selectedReservation.id);
    try {
      await reservationAPI.updateStatus(selectedReservation.id, 'CANCELLED');
      
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res.id === selectedReservation.id
            ? { ...res, status: 'CANCELLED' }
            : res
        )
      );
      
      showToast('Reservation cancelled successfully', 'success');
    } catch (error) {
      showToast('Failed to cancel reservation', 'error');
    } finally {
      setCancellingId(null);
      setShowConfirmModal(false);
      setSelectedReservation(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/3 mb-10 mx-auto md:mx-0"></div>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 h-48"
              >
                <div className="flex p-6 gap-6">
                  <div className="w-32 h-20 bg-gray-300 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-7 bg-gray-300 rounded w-3/5"></div>
                    <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#192336] to-[#004aad] text-white py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            My Reservations
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
            Manage your bookings and get ready for your next adventure
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 -mt-10 relative z-10">
        {reservations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="text-8xl mb-8 opacity-80">🚗💨</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#192336] mb-4">
              No Reservations Found
            </h2>
            <p className="text-xl text-[#6d6e71] mb-10 max-w-md mx-auto">
              You haven't booked any vehicles yet. Explore our premium fleet now!
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center gap-3 bg-[#d9b15c] hover:bg-[#c4a052] text-[#192336] font-bold text-lg py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <Car className="h-6 w-6" />
              Browse Available Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 w-28 h-20 md:w-32 md:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        {reservation.vehicle.imageUrl ? (
                          <img
                            src={reservation.vehicle.imageUrl}
                            alt={`${reservation.vehicle.make} ${reservation.vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#192336] mb-1">
                          {reservation.vehicle.make} {reservation.vehicle.model}
                        </h3>
                        <p className="text-[#6d6e71] text-base">
                          Reservation #{reservation.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={getStatusBadge(reservation.status)}>
                        {getStatusIcon(reservation.status)}
                        {reservation.status}
                      </span>
                      {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelClick(reservation)}
                          disabled={cancellingId === reservation.id}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#d9b15c]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6d6e71]">Pickup Date</p>
                        <p className="font-semibold text-[#192336] text-lg">
                          {formatDate(reservation.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-[#d9b15c]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6d6e71]">Return Date</p>
                        <p className="font-semibold text-[#192336] text-lg">
                          {formatDate(reservation.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#d9b15c]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#6d6e71]">Destination</p>
                        <p className="font-semibold text-[#192336] text-lg">
                          {reservation.destination || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
                    <div className="flex items-center gap-3 text-[#6d6e71]">
                      <Clock className="h-5 w-5" />
                      <span className="text-base">
                        Booked on {formatDate(reservation.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-[#192336]">
                        ${reservation.totalPrice}
                      </p>
                      <p className="text-sm text-[#6d6e71]">Total Price</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Reservation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingId ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedReservation(null);
                }}
                disabled={cancellingId !== null}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
};

export default CustomerReservations;