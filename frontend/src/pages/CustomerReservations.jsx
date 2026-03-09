import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, MapPin, Car, Clock } from "lucide-react";
import { reservationAPI } from "../services/api";

const CustomerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      // This would typically fetch customer-specific reservations
      // For demo purposes, we'll use mock data
      const mockReservations = [
        {
          id: 1,
          vehicle: {
            make: "Tesla",
            model: "Model S",
            imageUrl: null,
          },
          pickupDate: "2024-03-15",
          returnDate: "2024-03-18",
          pickupLocation: "Downtown",
          totalPrice: 360,
          status: "CONFIRMED",
          createdAt: "2024-03-10",
        },
        {
          id: 2,
          vehicle: {
            make: "BMW",
            model: "X5",
            imageUrl: null,
          },
          pickupDate: "2024-02-20",
          returnDate: "2024-02-25",
          pickupLocation: "Airport",
          totalPrice: 400,
          status: "COMPLETED",
          createdAt: "2024-02-15",
        },
      ];

      setReservations(mockReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 mb-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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

      {/* Page Header */}
      <div className="bg-[#192336] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">My Reservations</h1>
          <p className="text-xl text-gray-300">
            Track and manage your car rental bookings
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reservations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚗</div>
            <h2 className="text-3xl font-bold text-[#192336] mb-4">
              No Reservations Yet
            </h2>
            <p className="text-xl text-[#6d6e71] mb-8">
              You have no reservations yet. Start exploring our cars.
            </p>
            <Link
              to="/cars"
              className="inline-flex items-center bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              <Car className="h-5 w-5 mr-2" />
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          reservation.vehicle.imageUrl ||
                          "/api/placeholder/80/50"
                        }
                        alt={`${reservation.vehicle.make} ${reservation.vehicle.model}`}
                        className="w-20 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA4MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im00MCAyNWwtMTItMTJoMjRsLTEyIDEyeiIgZmlsbD0iI2Q5YjE1YyIvPgo8L3N2Zz4=";
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-[#192336]">
                          {reservation.vehicle.make} {reservation.vehicle.model}
                        </h3>
                        <p className="text-[#6d6e71] text-sm">
                          Reservation #{reservation.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-[#6d6e71]">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <p className="text-sm">Pickup</p>
                        <p className="font-medium text-[#192336]">
                          {formatDate(reservation.pickupDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-[#6d6e71]">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <p className="text-sm">Return</p>
                        <p className="font-medium text-[#192336]">
                          {formatDate(reservation.returnDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-[#6d6e71]">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <p className="text-sm">Location</p>
                        <p className="font-medium text-[#192336]">
                          {reservation.pickupLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-[#6d6e71]">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        Booked on {formatDate(reservation.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#192336]">
                        ${reservation.totalPrice}
                      </p>
                      <p className="text-sm text-[#6d6e71]">Total Amount</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CustomerReservations;
