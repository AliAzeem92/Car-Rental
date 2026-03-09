import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CarCard from "../components/CarCard";
import Footer from "../components/Footer";
import ReservationModal from "../components/ReservationModal";
import { vehicleAPI } from "../services/api";

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await vehicleAPI.getAll();
      const cars = response.data.map((car) => ({
        id: car.id,
        make: car.brand || car.make,
        model: car.model,
        category: car.category || "Standard",
        seats: car.seats || 4,
        transmission: car.transmission || "Auto",
        fuelType: car.fuelType || "Petrol",
        pricePerDay: car.dailyPrice || car.pricePerDay || 80,
        deposit: car.deposit || 400,
        imageUrl: car.vehicleimage?.[0]?.imageUrl || car.imageUrl,
        rating: 4.8,
      }));

      setAllCars(cars);
      setFeaturedCars(cars.slice(0, 3)); // Top 3 cars for featured section
    } catch (error) {
      console.error("Error fetching cars:", error);
      // Fallback data for demo
      const mockCars = [
        {
          id: 1,
          make: "Tesla",
          model: "Model S",
          category: "Luxury",
          seats: 4,
          transmission: "Auto",
          fuelType: "Electric",
          pricePerDay: 120,
          deposit: 500,
          imageUrl: null,
          rating: 4.8,
        },
        {
          id: 2,
          make: "BMW",
          model: "X5",
          category: "SUV",
          seats: 5,
          transmission: "Auto",
          fuelType: "Petrol",
          pricePerDay: 80,
          deposit: 400,
          imageUrl: null,
          rating: 4.8,
        },
        {
          id: 3,
          make: "Toyota",
          model: "Corolla",
          category: "Economy",
          seats: 5,
          transmission: "Auto",
          fuelType: "Petrol",
          pricePerDay: 40,
          deposit: 500,
          imageUrl: null,
          rating: 4.5,
        },
      ];
      setFeaturedCars(mockCars);
      setAllCars(mockCars);
    } finally {
      setLoading(false);
    }
  };

  const handleBookCar = (car) => {
    setSelectedCar(car);
    setShowReservationModal(true);
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
    setSelectedCar(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Available Vehicles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                      <div className="h-10 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} onBook={handleBookCar} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compact Car List Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allCars.slice(0, 3).map((car) => (
              <div
                key={`compact-${car.id}`}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#192336]">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-[#6d6e71] text-sm mb-2">
                      {car.category} • {car.fuelType}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-[#6d6e71]">
                      <span>{car.seats} Seats</span>
                      <span>{car.transmission}</span>
                      <span>{car.fuelType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#192336]">
                      ${car.pricePerDay}
                      <span className="text-sm font-normal">/day</span>
                    </div>
                    <div className="text-sm text-[#6d6e71]">
                      ${car.deposit} Deposit
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleBookCar(car)}
                  className="w-full bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Reservation Modal */}
      {showReservationModal && selectedCar && (
        <ReservationModal car={selectedCar} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Home;
