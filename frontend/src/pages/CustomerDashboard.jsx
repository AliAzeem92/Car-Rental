import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Car,
  Users,
  Fuel,
  Settings,
  Phone,
  MessageCircle,
  Mail,
  ChevronRight,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Lock,
  Save,
  CheckCircle,
  ClockIcon,
  XCircle,
  AlertCircle,
  X,
  Clock,
  Camera,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { useToast } from "../context/ToastContext";
import { reservationAPI } from "../services/api";
import FiltersSidebar from "../components/FiltersSidebar";
import CarDetailsModal from "../components/CarDetailsModal";
import BookingModal from "../components/BookingModal";
import CustomerNavbar from "../components/CustomerNavbar";
import { compressImage } from "../utils/imageCompression";
import { useTranslation } from "react-i18next";

/* ─── Shared Spinner ──────────────────────────────────────────── */
const Spinner = ({ size = "h-10 w-10" }) => (
  <div className="flex justify-center items-center py-20">
    <div
      className={`animate-spin rounded-full ${size} border-4 border-gray-200 border-t-[#004aad]`}
    />
  </div>
);

/* ─── Confirmation Modal ─────────────────────────────────────── */
const ConfirmCancelModal = ({ reservation, onConfirm, onClose, isLoading }) => {
  const { t } = useTranslation();
  return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{t('modals.cancelReservation')}</h3>
      </div>
      <p className="text-gray-600 mb-2">
        {t('modals.cancelConfirmation')}
      </p>
      {reservation && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium">{t('modals.car')}:</span>{" "}
            {reservation.vehicle?.brand} {reservation.vehicle?.model}
          </p>
          <p>
            <span className="font-medium">{t('reservations.reservationNumber')}:</span> {reservation.id}
          </p>
        </div>
      )}
      <p className="text-sm text-red-600 mb-6">{t('modals.cannotUndo')}</p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('reservations.cancelling') : t('buttons.yesCancel')}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {t('buttons.noKeepIt')}
        </button>
      </div>
    </div>
  </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { filters } = useFilter();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const activeTab = searchParams.get("tab") || "vehicles";
  const prevTabRef = useRef(activeTab);
  const [tabKey, setTabKey] = useState(0); // forces re-mount for animation

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);

  // Per-section loading
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Car modals
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Reservation cancel
  const [cancellingId, setCancellingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    licenseExpiryDate: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  /* ── Route protection exactly as requested  ───────── */
  useEffect(() => {
    if (!authLoading && !user) {
      if (activeTab === "reservations" || activeTab === "profile") {
        navigate("/login", { replace: true });
      }
    }
  }, [activeTab, user, authLoading, navigate]);

  /* ── Default to vehicles tab ───────────────────────── */
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "vehicles" });
    }
  }, []);

  /* ── Trigger animation on tab change ──────────────── */
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      setTabKey((k) => k + 1);
    }
  }, [activeTab]);

  /* ── Initial data load ─────────────────────────────── */
  useEffect(() => {
    loadVehiclesAndContact();
    loadReservations();
  }, []);

  /* ── Load profile when profile tab is opened ──────── */
  useEffect(() => {
    if (activeTab === "profile") {
      loadProfile();
    }
  }, [activeTab]);

  /* ── Apply filters when vehicles/filters change ────── */
  useEffect(() => {
    applyFilters();
  }, [filters, vehicles]);

  const changeTab = (tab) => {
    setSearchParams({ tab });
  };

  /* ─── Data loaders ───────────────────────────────────── */
  const loadVehiclesAndContact = async () => {
    setLoadingVehicles(true);
    try {
      const [vehiclesRes, contactRes] = await Promise.all([
        api.get("/vehicles?customerView=true"),
        api.get("/public/admin-contact"),
      ]);
      setVehicles(vehiclesRes.data.filter((v) => v.status === "AVAILABLE"));
      setContactInfo(contactRes.data);
    } catch (error) {
      console.error("Load vehicles error:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadReservations = async () => {
    if (!user) {
      setLoadingReservations(false);
      return;
    }
    setLoadingReservations(true);
    try {
      const response = await reservationAPI.getCustomerReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error("Load reservations error:", error);
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get("/auth/check");
      const u = data.user;
      setProfileData({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.address || "",
        licenseNumber: u.licenseNumber || "",
        licenseExpiryDate: u.licenseExpiryDate
          ? new Date(u.licenseExpiryDate).toISOString().split("T")[0]
          : "",
      });
      setImagePreview(u.profileImageUrl || null);
    } catch (error) {
      console.error("Load profile error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  /* ─── Profile handlers (reuse /auth/profile like Settings) ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavingProfile(true);
    try {
      if (profileImage) {
        const compressed = await compressImage(profileImage);
        const formData = new FormData();
        formData.append("image", compressed);
        await api.post(`/customers/${user.id}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await api.put("/auth/profile", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        licenseNumber: profileData.licenseNumber,
        licenseExpiryDate: profileData.licenseExpiryDate,
      });

      showToast(t('profile.profileUpdated'), "success");
      if (profileImage) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      showToast(
        error.response?.data?.error || t('messages.failedToUpdate'),
        "error",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast(t('profile.passwordsDoNotMatch'), "error");
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showToast(t('profile.fillAllFields'), "error");
      return;
    }
    setSavingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showToast(t('profile.passwordChanged'), "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast(
        error.response?.data?.error || t('messages.failedToChangePassword'),
        "error",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  /* ─── Cancel reservation handlers ───────────────────── */
  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedReservation) return;
    setCancellingId(selectedReservation.id);
    try {
      await reservationAPI.updateStatus(selectedReservation.id, "CANCELLED");
      setReservations((prev) =>
        prev.map((r) =>
          r.id === selectedReservation.id ? { ...r, status: "CANCELLED" } : r,
        ),
      );
      showToast(t('messages.reservationCancelled'), "success");
    } catch (error) {
      showToast(t('messages.failedToCancel'), "error");
    } finally {
      setCancellingId(null);
      setShowConfirmModal(false);
      setSelectedReservation(null);
    }
  };

  /* ─── Utilities ──────────────────────────────────────── */
  const applyFilters = () => {
    let filtered = [...vehicles];
    if (filters.category && filters.category !== "All Cars") {
      filtered = filtered.filter((v) => v.category === filters.category);
    }
    if (filters.priceRange) {
      filtered = filtered.filter(
        (v) =>
          v.dailyPrice >= filters.priceRange[0] &&
          v.dailyPrice <= filters.priceRange[1],
      );
    }
    setFilteredVehicles(filtered);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold";
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
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  /* ─── Input style helpers ────────────────────────────── */
  const inputCls =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent transition";
  const inputReadOnly =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed";
  const labelCls = "block text-sm font-medium text-gray-700 mb-2";

  const recentReservation = reservations[0];

  /* ─── Full-page loader (only on first load of vehicles) ─ */
  if (loadingVehicles && activeTab === "vehicles") {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#004aad] mx-auto mb-4" />
            <p className="text-[#192336] font-semibold text-lg">
              {t('dashboard.loadingDashboard')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      {/* ── Step Indicator ────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-semibold text-[#004aad]">{t('steps.search')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{t('steps.selectCar')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{t('steps.checkout')}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{t('steps.confirmation')}</span>
          </div>
        </div>
      </div>

      {/* ── Main Content with tab animation ──────────── */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div key={tabKey} className="animate-tab-enter">
          {/* ════════════════════════════════════════════
              VEHICLES TAB
          ════════════════════════════════════════════ */}
          {activeTab === "vehicles" && (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px] gap-6">
              {/* Filters sidebar */}
              <div className="hidden lg:block sticky top-24 self-start">
                <FiltersSidebar
                  categories={[...new Set(vehicles.map((v) => v.category))]}
                />
              </div>

              {/* Car listings */}
              <div className="h-[calc(100vh-180px)] overflow-y-auto pr-4 pb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#192336] mb-1">
                    {t('dashboard.availableVehicles')}
                  </h2>
                  <p className="text-gray-600">
                    {filteredVehicles.length} {t('dashboard.carsFound')}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredVehicles.map((car) => (
                    <div
                      key={car.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48">
                        {car.vehicleimage?.[0] ? (
                          <img
                            src={car.vehicleimage[0].imageUrl}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Car className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-[#192336] mb-2">
                          {car.brand} {car.model}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Fuel className="w-4 h-4" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{car.seats || 4}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="w-4 h-4" />
                            <span>{car.transmission || "Auto"}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#192336]">
                              ${car.dailyPrice}
                            </span>
                            <span className="text-gray-600">{t('vehicles.perDay')}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCar(car);
                                setShowDetailsModal(true);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              {t('buttons.viewDetails')}
                            </button>
                            <button
                              onClick={() => {
                                if (!user) {
                                  setShowLoginModal(true);
                                } else {
                                  setSelectedCar(car);
                                  setShowBookingModal(true);
                                }
                              }}
                              className="px-4 py-2 bg-[#004aad] text-white rounded-lg hover:bg-[#003a8c] transition-colors text-sm font-medium"
                            >
                              {t('buttons.reserve')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredVehicles.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-xl">
                    <p className="text-xl text-gray-600">
                      {t('dashboard.noVehiclesMatch')}
                    </p>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="hidden xl:block sticky top-24 self-start space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-[#192336] mb-4">
                    {t('sidebar.yourReservations')}
                  </h3>
                  {loadingReservations ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-7 w-7 border-4 border-gray-200 border-t-[#004aad]" />
                    </div>
                  ) : recentReservation ? (
                    <div
                      onClick={() => changeTab("reservations")}
                      className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#192336] truncate">
                            {recentReservation.vehicle.brand}{" "}
                            {recentReservation.vehicle.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              recentReservation.startDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              recentReservation.endDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {t('reservations.status')}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            recentReservation.status,
                          )}`}
                        >
                          {recentReservation.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">{t('sidebar.noReservationsYet')}</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-[#192336] mb-4">
                    {t('modals.needHelp')}
                  </h3>
                  <div className="space-y-3">
                    {contactInfo?.phoneNumber && (
                      <a
                        href={`https://wa.me/${contactInfo.phoneNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#192336]">
                            {t('modals.callSupport')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contactInfo.phoneNumber}
                          </p>
                        </div>
                      </a>
                    )}
                    <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[#192336]">{t('modals.liveChat')}</p>
                        <p className="text-sm text-gray-600">{t('modals.chatWithUs')}</p>
                      </div>
                    </button>
                    {contactInfo?.email && (
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#192336]">
                            {t('modals.emailSupport')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contactInfo.email}
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              RESERVATIONS TAB
          ════════════════════════════════════════════ */}
          {activeTab === "reservations" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#192336] mb-8">
                {t('reservations.title')}
              </h2>

              {loadingReservations ? (
                <Spinner />
              ) : reservations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-md">
                  <div className="text-6xl mb-6">🚗</div>
                  <h3 className="text-2xl font-bold text-[#192336] mb-4">
                    {t('reservations.noReservations')}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {t('reservations.noReservationsText')}
                  </p>
                  <button
                    onClick={() => changeTab("vehicles")}
                    className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    {t('buttons.browseCars')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="p-6 md:p-8">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-28 h-20 md:w-32 md:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                              {res.vehicle?.imageUrl ? (
                                <img
                                  src={res.vehicle.imageUrl}
                                  alt={`${res.vehicle.brand} ${res.vehicle.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Car className="h-10 w-10 text-[#d9b15c]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-[#192336]">
                                {res.vehicle?.brand} {res.vehicle?.model}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {t('reservations.reservationNumber')}{res.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-start sm:items-end gap-3">
                            <span className={getStatusBadge(res.status)}>
                              {getStatusIcon(res.status)}
                              {res.status}
                            </span>
                            {(res.status === "PENDING" ||
                              res.status === "CONFIRMED") && (
                              <button
                                onClick={() => handleCancelClick(res)}
                                disabled={cancellingId === res.id}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X className="h-4 w-4" />
                                {cancellingId === res.id
                                  ? t('reservations.cancelling')
                                  : t('reservations.cancelReservation')}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Detail grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#d9b15c]/10 rounded-lg flex-shrink-0">
                              <Calendar className="h-5 w-5 text-[#d9b15c]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                {t('reservations.pickupDate')}
                              </p>
                              <p className="font-semibold text-[#192336]">
                                {formatDate(res.startDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#d9b15c]/10 rounded-lg flex-shrink-0">
                              <Calendar className="h-5 w-5 text-[#d9b15c]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                {t('reservations.returnDate')}
                              </p>
                              <p className="font-semibold text-[#192336]">
                                {formatDate(res.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-[#d9b15c]/10 rounded-lg flex-shrink-0">
                              <MapPin className="h-5 w-5 text-[#d9b15c]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                {t('reservations.destination')}
                              </p>
                              <p className="font-semibold text-[#192336]">
                                {res.destination || t('reservations.notSpecified')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-gray-100 gap-3">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{t('reservations.bookedOn')} {formatDate(res.createdAt)}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-extrabold text-[#192336]">
                              ${res.totalPrice}
                            </p>
                            <p className="text-xs text-gray-500">{t('reservations.totalPrice')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              PROFILE TAB — Two-column layout
          ════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-[#192336] mb-8">
                {t('profile.title')}
              </h2>

              {loadingProfile ? (
                <Spinner />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ── LEFT: Customer Information ─────────────── */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
                    <h3 className="text-xl font-bold text-[#192336] mb-6">
                      {t('profile.customerInformation')}
                    </h3>

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-7">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#004aad] to-[#d9b15c] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            `${profileData.firstName?.[0] || "U"}${profileData.lastName?.[0] || "S"}`
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-[#004aad] hover:bg-[#003a8c] text-white p-1.5 rounded-full cursor-pointer transition">
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <p className="font-semibold text-[#192336] text-lg">
                          {profileData.firstName} {profileData.lastName}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {profileData.email}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>
                            <User className="w-4 h-4 inline mr-1.5" />
                            {t('profile.firstName')}
                          </label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                firstName: e.target.value,
                              })
                            }
                            className={inputCls}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            <User className="w-4 h-4 inline mr-1.5" />
                            {t('profile.lastName')}
                          </label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                lastName: e.target.value,
                              })
                            }
                            className={inputCls}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>
                          <Mail className="w-4 h-4 inline mr-1.5" />
                          {t('profile.email')}
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className={inputReadOnly}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          <Phone className="w-4 h-4 inline mr-1.5" />
                          {t('profile.phone')}
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder={t('profile.phonePlaceholder')}
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          <MapPin className="w-4 h-4 inline mr-1.5" />
                          {t('profile.address')}
                        </label>
                        <textarea
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: e.target.value,
                            })
                          }
                          placeholder={t('profile.addressPlaceholder')}
                          rows={3}
                          className={inputCls}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>
                            <CreditCard className="w-4 h-4 inline mr-1.5" />
                            {t('profile.licenseNumber')}
                          </label>
                          <input
                            type="text"
                            value={profileData.licenseNumber}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                licenseNumber: e.target.value,
                              })
                            }
                            placeholder={t('profile.licensePlaceholder')}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            <Calendar className="w-4 h-4 inline mr-1.5" />
                            {t('profile.licenseExpiry')}
                          </label>
                          <input
                            type="date"
                            value={profileData.licenseExpiryDate}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                licenseExpiryDate: e.target.value,
                              })
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full bg-[#d9b15c] hover:bg-[#c4a052] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('profile.saving')}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t('buttons.saveChanges')}
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* ── RIGHT: Change Password ──────────────────── */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
                    <h3 className="text-xl font-bold text-[#192336] mb-6">
                      {t('profile.changePassword')}
                    </h3>

                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                      <div>
                        <label className={labelCls}>
                          <Lock className="w-4 h-4 inline mr-1.5" />
                          {t('profile.currentPassword')}
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className={inputCls}
                          placeholder={t('profile.passwordPlaceholder')}
                          required
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          <Lock className="w-4 h-4 inline mr-1.5" />
                          {t('profile.newPassword')}
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className={inputCls}
                          placeholder={t('profile.passwordPlaceholder')}
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          <Lock className="w-4 h-4 inline mr-1.5" />
                          {t('profile.confirmPassword')}
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className={inputCls}
                          placeholder={t('profile.passwordPlaceholder')}
                          required
                          minLength={6}
                        />
                      </div>

                      {/* Password strength hint */}
                      <p className="text-xs text-gray-500">
                        {t('profile.passwordHint')}
                      </p>

                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full bg-[#192336] hover:bg-[#0f1a28] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                      >
                        {savingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('profile.changing')}
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            {t('buttons.changePassword')}
                          </>
                        )}
                      </button>
                    </form>

                    {/* Info box */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        {t('profile.securityTips')}
                      </p>
                      <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                        <li>{t('profile.securityTip1')}</li>
                        <li>{t('profile.securityTip2')}</li>
                        <li>{t('profile.securityTip3')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      {showDetailsModal && selectedCar && (
        <CarDetailsModal
          car={selectedCar}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showBookingModal && selectedCar && (
        <BookingModal
          car={selectedCar}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            loadReservations();
          }}
        />
      )}

      {showConfirmModal && (
        <ConfirmCancelModal
          reservation={selectedReservation}
          onConfirm={handleCancelConfirm}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedReservation(null);
          }}
          isLoading={cancellingId !== null}
        />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-100 rounded-full">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('modals.loginRequired')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('modals.loginToContinue')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 bg-[#004aad] hover:bg-[#003a8c] text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {t('navbar.login')}
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('buttons.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
