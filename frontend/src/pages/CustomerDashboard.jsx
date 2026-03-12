import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, Users, Fuel, Settings, Phone, MessageCircle, Mail, ChevronRight, User, MapPin, CreditCard, Calendar, Camera, Lock, Save, CheckCircle, ClockIcon, XCircle, AlertCircle, X } from "lucide-react";
import axios from "axios";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { useToast } from "../context/ToastContext";
import { reservationAPI } from "../services/api";
import FiltersSidebar from "../components/FiltersSidebar";
import CarDetailsModal from "../components/CarDetailsModal";
import BookingModal from "../components/BookingModal";
import CustomerNavbar from "../components/CustomerNavbar";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { filters } = useFilter();
  
  const activeTab = searchParams.get("tab") || "vehicles";
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiryDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cancellingId, setCancellingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "vehicles" });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadData();
    if (activeTab === 'profile') {
      loadProfile();
    }
  }, [activeTab]);

  const changeTab = (tab) => {
    setSearchParams({ tab });
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/auth/check');
      const userData = data.user;
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        licenseNumber: userData.licenseNumber || '',
        licenseExpiryDate: userData.licenseExpiryDate ? new Date(userData.licenseExpiryDate).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put(`/customers/${user.id}`, {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await reservationAPI.updateStatus(id, 'CANCELLED');
      setReservations(prev => prev.map(res => res.id === id ? { ...res, status: 'CANCELLED' } : res));
      showToast('Reservation cancelled successfully', 'success');
    } catch (error) {
      showToast('Failed to cancel reservation', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  useEffect(() => {
    applyFilters();
  }, [filters, vehicles]);

  const loadData = async () => {
    try {
      const [vehiclesRes, reservationsRes, contactRes] = await Promise.all([
        axios.get("/api/vehicles?customerView=true", { withCredentials: true }),
        axios.get("/api/reservations", { withCredentials: true }),
        axios.get("/api/public/admin-contact"),
      ]);
      setVehicles(vehiclesRes.data.filter((v) => v.status === "AVAILABLE"));
      setReservations(
        reservationsRes.data.filter((r) => r.userId === user?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      setContactInfo(contactRes.data);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    if (filters.category && filters.category !== "All Cars") {
      filtered = filtered.filter((v) => v.category === filters.category);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (v) => v.dailyPrice >= filters.priceRange[0] && v.dailyPrice <= filters.priceRange[1]
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setShowDetailsModal(true);
  };

  const handleReserve = (car) => {
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const recentReservation = reservations[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-[#192336]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-semibold text-[#004aad]">Search</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Select Car</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Checkout</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === "vehicles" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px] gap-6">
            {/* LEFT SIDEBAR - Filters */}
            <div className="hidden lg:block sticky top-24 self-start">
              <FiltersSidebar categories={[...new Set(vehicles.map((v) => v.category))]} />
            </div>

            {/* CENTER - Car Listings */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#192336] mb-1">Available Vehicles</h2>
                <p className="text-gray-600">{filteredVehicles.length} cars found</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVehicles.map((car) => (
                  <div key={car.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      {car.vehicleimage?.[0] ? (
                        <img src={car.vehicleimage[0].imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Car className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-[#192336] mb-2">{car.brand} {car.model}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1"><Fuel className="w-4 h-4" /><span>{car.fuelType}</span></div>
                        <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{car.seats || 4}</span></div>
                        <div className="flex items-center gap-1"><Settings className="w-4 h-4" /><span>{car.transmission || "Auto"}</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div><span className="text-2xl font-bold text-[#192336]">${car.dailyPrice}</span><span className="text-gray-600">/day</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => handleViewDetails(car)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">View Details</button>
                          <button onClick={() => handleReserve(car)} className="px-4 py-2 bg-[#004aad] text-white rounded-lg hover:bg-[#003a8c] transition-colors text-sm font-medium">Reserve</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl">
                  <p className="text-xl text-gray-600">No vehicles match your filters</p>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR - Reservations + Help */}
            <div className="hidden xl:block sticky top-24 self-start space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-[#192336] mb-4">Your Reservations</h3>
                {recentReservation ? (
                  <div onClick={() => changeTab("reservations")} className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <div className="flex gap-3 mb-3">
                      <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Car className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#192336] truncate">{recentReservation.vehicle.brand} {recentReservation.vehicle.model}</h4>
                        <p className="text-sm text-gray-600">{new Date(recentReservation.startDate).toLocaleDateString()} - {new Date(recentReservation.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(recentReservation.status)}`}>{recentReservation.status}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No reservations yet</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-[#192336] mb-4">Need Help?</h3>
                <div className="space-y-3">
                  {contactInfo?.phoneNumber && (
                    <a href={`https://wa.me/${contactInfo.phoneNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-green-100 rounded-lg"><Phone className="w-5 h-5 text-green-600" /></div>
                      <div><p className="font-medium text-[#192336]">Call Support</p><p className="text-sm text-gray-600">{contactInfo.phoneNumber}</p></div>
                    </a>
                  )}
                  <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full">
                    <div className="p-2 bg-blue-100 rounded-lg"><MessageCircle className="w-5 h-5 text-blue-600" /></div>
                    <div className="text-left"><p className="font-medium text-[#192336]">Live Chat</p><p className="text-sm text-gray-600">Chat with us</p></div>
                  </button>
                  {contactInfo?.email && (
                    <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-purple-100 rounded-lg"><Mail className="w-5 h-5 text-purple-600" /></div>
                      <div><p className="font-medium text-[#192336]">Email Support</p><p className="text-sm text-gray-600">{contactInfo.email}</p></div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#192336] mb-8">My Reservations</h2>
            {reservations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="text-6xl mb-6">🚗</div>
                <h3 className="text-2xl font-bold text-[#192336] mb-4">No Reservations Yet</h3>
                <p className="text-gray-600 mb-8">You have no reservations yet. Start exploring our cars.</p>
                <button onClick={() => changeTab("vehicles")} className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-3 px-8 rounded-lg transition-colors">Browse Cars</button>
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.map((res) => (
                  <div key={res.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><Car className="h-6 w-6 text-[#d9b15c]" /></div>
                        <div><h3 className="text-xl font-bold text-[#192336]">{res.vehicle.brand} {res.vehicle.model}</h3><p className="text-gray-600 text-sm">Reservation #{res.id}</p></div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className={getStatusBadge(res.status)}>{getStatusIcon(res.status)}{res.status}</span>
                        {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                          <button onClick={() => handleCancel(res.id)} disabled={cancellingId === res.id} className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                            {cancellingId === res.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4" /><div><p className="text-sm">Pickup</p><p className="font-medium text-[#192336]">{formatDate(res.startDate)}</p></div></div>
                      <div className="flex items-center gap-2 text-gray-600"><Calendar className="h-4 w-4" /><div><p className="text-sm">Return</p><p className="font-medium text-[#192336]">{formatDate(res.endDate)}</p></div></div>
                      <div className="text-right"><p className="text-2xl font-bold text-[#192336]">${res.totalPrice}</p><p className="text-sm text-gray-600">Total Amount</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#192336] mb-8">My Profile</h2>
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.text}</div>
            )}
            <div className="bg-white rounded-xl shadow-md p-8">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><User className="w-4 h-4 inline mr-2" />First Name</label><input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><User className="w-4 h-4 inline mr-2" />Last Name</label><input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent" required /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2"><Mail className="w-4 h-4 inline mr-2" />Email (Read-only)</label><input type="email" value={profileData.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2"><Phone className="w-4 h-4 inline mr-2" />Phone (Read-only)</label><input type="tel" value={profileData.phone} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2"><MapPin className="w-4 h-4 inline mr-2" />Address (Read-only)</label><input type="text" value={profileData.address} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><CreditCard className="w-4 h-4 inline mr-2" />License Number (Read-only)</label><input type="text" value={profileData.licenseNumber} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-2" />License Expiry (Read-only)</label><input type="date" value={profileData.licenseExpiryDate} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" /></div>
                </div>
                <button type="submit" disabled={saving} className="mt-6 w-full bg-[#d9b15c] hover:bg-[#c4a052] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</>) : (<><Save className="w-5 h-5" />Save Changes</>) }
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedCar && (
        <CarDetailsModal car={selectedCar} onClose={() => setShowDetailsModal(false)} />
      )}

      {showBookingModal && selectedCar && (
        <BookingModal
          car={selectedCar}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
