import { useState } from "react";
import { X, Calendar, MapPin, User, Phone, Mail } from "lucide-react";

const ReservationModal = ({ car, onClose }) => {
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total days and price
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
      const totalPrice = days * car.pricePerDay;

      const reservationData = {
        vehicleId: car.id,
        ...formData,
        totalPrice,
        days,
      };

      // Here you would call your API
      console.log("Reservation data:", reservationData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Reservation submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Reservation error:", error);
      alert("Failed to submit reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * car.pricePerDay : 0;
  };

  const totalPrice = calculateTotal();
  const days =
    formData.pickupDate && formData.returnDate
      ? Math.ceil(
          (new Date(formData.returnDate) - new Date(formData.pickupDate)) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-[#192336]">Book Your Car</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Car Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <img
              src={car.imageUrl || "/api/placeholder/100/60"}
              alt={`${car.make} ${car.model}`}
              className="w-20 h-12 object-cover rounded-lg"
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im01MCAzMGwtMTUtMTVoMzBsLTE1IDE1eiIgZmlsbD0iI2Q5YjE1YyIvPgo8L3N2Zz4=";
              }}
            />
            <div>
              <h3 className="font-bold text-[#192336]">
                {car.make} {car.model}
              </h3>
              <p className="text-[#6d6e71] text-sm">
                {car.category} • {car.fuelType}
              </p>
              <p className="text-[#d9b15c] font-semibold">
                ${car.pricePerDay}/day
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rental Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Pickup Date
              </label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pickupDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Return Date
              </label>
              <input
                type="date"
                required
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    returnDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-[#192336] mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Pickup Location
            </label>
            <select
              required
              value={formData.pickupLocation}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  pickupLocation: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
            >
              <option value="">Select Location</option>
              <option value="downtown">Downtown</option>
              <option value="airport">Airport</option>
              <option value="mall">Shopping Mall</option>
            </select>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#192336] mb-2">
                License Number
              </label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    licenseNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
                placeholder="Enter your license number"
              />
            </div>
          </div>

          {/* Price Summary */}
          {totalPrice > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-[#192336] mb-2">
                Price Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rental ({days} days)</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit</span>
                  <span>${car.deposit}</span>
                </div>
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice + car.deposit}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d9b15c] hover:bg-[#c4a052] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "Processing..." : "Confirm Reservation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
