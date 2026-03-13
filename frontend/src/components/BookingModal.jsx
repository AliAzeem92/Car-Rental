import { useState, useEffect } from "react";
import { X, Calendar, MapPin, User, Phone, Mail, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/bookingService";
import { useToast } from "../context/ToastContext";

const BookingModal = ({ car, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sameLocation, setSameLocation] = useState(true);
  const [formData, setFormData] = useState({
    pickup_location: "",
    return_location: "",
    pickup_date: "",
    return_date: "",
    customerName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (sameLocation) {
      setFormData((prev) => ({
        ...prev,
        return_location: prev.pickup_location,
      }));
    }
  }, [formData.pickup_location, sameLocation]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateDays = () => {
    if (formData.pickup_date && formData.return_date) {
      const diffTime = Math.abs(
        new Date(formData.return_date) - new Date(formData.pickup_date),
      );
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    return 1;
  };

  const calculateTotal = () => calculateDays() * (car?.dailyPrice || 80);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingService.createBooking({
        vehicleId: car.id,
        userId: user.id,
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        pickup_date: formData.pickup_date,
        return_date: formData.return_date,
        customer_name: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        totalPrice: calculateTotal(),
        depositPaid: car?.deposit || 400,
      });
      showToast("Reservation created successfully!", "success");
      onSuccess();
    } catch (error) {
      showToast(error.message || "Failed to create booking", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#192336]">
            Complete Your Booking
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              {car.vehicleimage?.[0] ? (
                <img
                  src={car.vehicleimage[0].imageUrl}
                  alt={car.brand}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Car className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#192336]">
                {car.brand} {car.model}
              </h3>
              <p className="text-gray-600 text-sm">
                {car.category} • {car.fuelType}
              </p>
              <p className="text-[#d9b15c] font-semibold">
                ${car.dailyPrice}/day
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Pickup Date
              </label>
              <input
                type="date"
                name="pickup_date"
                value={formData.pickup_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Return Date
              </label>
              <input
                type="date"
                name="return_date"
                value={formData.return_date}
                onChange={handleInputChange}
                min={
                  formData.pickup_date || new Date().toISOString().split("T")[0]
                }
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
              />
            </div>
          </div>

          <div className="border-t pt-6 bg-white overflow-hidden">
            <h4 className="font-semibold mb-4 text-[#192336]">Trip Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleInputChange}
                  placeholder="Enter pickup city or location"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Return Location
                </label>
                <input
                  type="text"
                  name="return_location"
                  value={formData.return_location}
                  onChange={handleInputChange}
                  placeholder="Enter return city or location"
                  required
                  disabled={sameLocation}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c] disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sameLocation}
                  onChange={(e) => setSameLocation(e.target.checked)}
                  className="w-4 h-4 text-[#d9b15c] border-gray-300 rounded focus:ring-[#d9b15c]"
                />
                <span>Return to same location</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6 bg-white overflow-hidden">
            <h4 className="font-semibold mb-4 text-[#192336]">
              Contact Details
            </h4>
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d9b15c]"
                />
              </div>
            </div>
          </div>
          {calculateTotal() > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Rate</span>
                  <span>${car.dailyPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>
                    {calculateDays()} day{calculateDays() !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit</span>
                  <span>${car.deposit || 400}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#d9b15c]">
                    ${calculateTotal() + (car.deposit || 400)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#d9b15c] hover:bg-[#c4a052] disabled:opacity-60 text-white font-bold py-3 rounded-lg"
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
