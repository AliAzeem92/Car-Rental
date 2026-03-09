import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  X,
  Users,
  Settings,
  Fuel,
} from "lucide-react";
import axios from "axios";

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [view, setView] = useState("vehicles");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, vehiclesRes, reservationsRes] = await Promise.all([
        axios.get("/api/auth/check", { withCredentials: true }),
        axios.get("/api/vehicles?customerView=true", { withCredentials: true }),
        axios.get("/api/reservations", { withCredentials: true }),
      ]);
      setCustomer(profileRes.data.user);
      setVehicles(vehiclesRes.data.filter((v) => v.status === "AVAILABLE"));
      setReservations(
        reservationsRes.data.filter(
          (r) => r.userId === profileRes.data.user.id,
        ),
      );
    } catch (error) {
      console.error(
        "Load data error:",
        error.response?.status,
        error.response?.data,
      );
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    navigate("/login");
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/reservations",
        {
          vehicleId: selectedVehicle.id,
          userId: customer.id,
          ...dates,
          totalPrice: calculateTotal(),
          depositPaid: selectedVehicle.deposit,
        },
        { withCredentials: true },
      );
      setShowBooking(false);
      setSelectedVehicle(null);
      setDates({ startDate: "", endDate: "" });
      loadData();
      alert("Reservation created successfully!");
    } catch (error) {
      alert(error.response?.data?.error || "Booking failed");
    }
  };

  const calculateTotal = () => {
    if (!dates.startDate || !dates.endDate) return 0;
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days * selectedVehicle.dailyPrice;
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await axios.put(
        `/api/reservations/${id}/status`,
        { status: "CANCELLED" },
        { withCredentials: true },
      );
      loadData();
    } catch (error) {
      alert("Failed to cancel reservation");
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    ONGOING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-purple-100 text-purple-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-[#192336]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navbar */}
      <nav className="bg-[#192336] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-[#d9b15c]" />
              <span className="text-xl font-bold">CAR RENTAL</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {customer?.firstName}
              </span>
              <button
                onClick={() => setView("vehicles")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === "vehicles"
                    ? "text-[#d9b15c] bg-[#004aad]/20"
                    : "text-white hover:text-[#d9b15c] hover:bg-[#004aad]/10"
                }`}
              >
                Browse Vehicles
              </button>
              <button
                onClick={() => setView("reservations")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === "reservations"
                    ? "text-[#d9b15c] bg-[#004aad]/20"
                    : "text-white hover:text-[#d9b15c] hover:bg-[#004aad]/10"
                }`}
              >
                My Reservations
              </button>
              <button
                onClick={() => setView("profile")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === "profile"
                    ? "text-[#d9b15c] bg-[#004aad]/20"
                    : "text-white hover:text-[#d9b15c] hover:bg-[#004aad]/10"
                }`}
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "vehicles" ? (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-[#192336] mb-4">
                Available <span className="text-[#004aad]">Vehicles</span>
              </h2>
              <p className="text-xl text-[#6d6e71]">
                Choose From Our{" "}
                <span className="font-semibold text-[#192336]">
                  Premium Fleet
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {vehicle.vehicleimage?.[0] ? (
                        <img
                          src={vehicle.vehicleimage[0].imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="h-16 w-16 text-[#d9b15c]" />
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#192336] mb-1">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-[#6d6e71] text-sm">
                        {vehicle.fuelType} • {vehicle.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-sm text-[#6d6e71]">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{vehicle.seats || 4} Seats</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Settings className="h-4 w-4" />
                        <span>{vehicle.transmission || "Auto"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Fuel className="h-4 w-4" />
                        <span>{vehicle.fuelType}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-[#192336]">
                          ${vehicle.dailyPrice}
                          <span className="text-base font-normal text-[#6d6e71]">
                            /day
                          </span>
                        </div>
                        <div className="text-sm text-[#6d6e71]">
                          ${vehicle.deposit} Deposit
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowBooking(true);
                        }}
                        className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-2 px-6 rounded-lg transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === "reservations" ? (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-[#192336] mb-4">
                My Reservations
              </h2>
              <p className="text-xl text-[#6d6e71]">
                Track and manage your car rental bookings
              </p>
            </div>
            {reservations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🚗</div>
                <h3 className="text-3xl font-bold text-[#192336] mb-4">
                  No Reservations Yet
                </h3>
                <p className="text-xl text-[#6d6e71] mb-8">
                  You have no reservations yet. Start exploring our cars.
                </p>
                <button
                  onClick={() => setView("vehicles")}
                  className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Browse Cars
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="h-6 w-6 text-[#d9b15c]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#192336]">
                              {res.vehicle.brand} {res.vehicle.model}
                            </h3>
                            <p className="text-[#6d6e71] text-sm">
                              Reservation #{res.id}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[res.status]}`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-[#6d6e71]">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="text-sm">Pickup</p>
                            <p className="font-medium text-[#192336]">
                              {new Date(res.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-[#6d6e71]">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="text-sm">Return</p>
                            <p className="font-medium text-[#192336]">
                              {new Date(res.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#192336]">
                            ${res.totalPrice}
                          </p>
                          <p className="text-sm text-[#6d6e71]">Total Amount</p>
                        </div>
                      </div>
                      {(res.status === "PENDING" ||
                        res.status === "CONFIRMED") && (
                        <div className="pt-4 border-t">
                          <button
                            onClick={() => handleCancel(res.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-4xl font-bold text-[#192336] mb-8">
                My Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    Email
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    Phone
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.phone}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    License Number
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.licenseNumber}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    Address
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.address}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6d6e71]">
                    License Expiry
                  </label>
                  <p className="text-lg font-semibold text-[#192336]">
                    {customer?.licenseExpiryDate
                      ? new Date(
                          customer.licenseExpiryDate,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Booking Modal */}
      {showBooking && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#192336]">
                Book Your Car
              </h2>
              <button
                onClick={() => {
                  setShowBooking(false);
                  setSelectedVehicle(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-[#d9b15c]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#192336]">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <p className="text-[#6d6e71] text-sm">
                    {selectedVehicle.category} • {selectedVehicle.fuelType}
                  </p>
                  <p className="text-[#d9b15c] font-semibold">
                    ${selectedVehicle.dailyPrice}/day
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={handleBooking} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dates.startDate}
                    onChange={(e) =>
                      setDates({ ...dates, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dates.endDate}
                    onChange={(e) =>
                      setDates({ ...dates, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              {calculateTotal() > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#192336] mb-2">
                    Price Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Daily Rate</span>
                      <span>${selectedVehicle.dailyPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days</span>
                      <span>
                        {Math.ceil(
                          (new Date(dates.endDate) -
                            new Date(dates.startDate)) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit</span>
                      <span>${selectedVehicle.deposit}</span>
                    </div>
                    <div className="border-t pt-1 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>
                          ${calculateTotal() + selectedVehicle.deposit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedVehicle(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
