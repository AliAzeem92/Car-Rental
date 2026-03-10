import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CarCard from "../components/Car/CarCard";
import Footer from "../components/Footer";
import { carService } from "../services/carService";

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      setLoading(true);
      const cars = await carService.fetchCars();
      // Show only first 3 cars as featured
      setFeaturedCars(cars.slice(0, 3));
    } catch (error) {
      console.error("Error fetching cars:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllCars = () => {
    navigate('/cars');
  };

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
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
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* Featured Vehicles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#192336] mb-4">
              Featured <span className="text-[#004aad]">Vehicles</span>
            </h2>
            <p className="text-xl text-[#6d6e71]">
              Choose From Our{" "}
              <span className="font-semibold text-[#192336]">
                Premium Fleet
              </span>
            </p>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load vehicles: {error}</p>
              <button
                onClick={fetchFeaturedCars}
                className="bg-[#d9b15c] hover:bg-[#c4a052] text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {loading
                  ? [...Array(3)].map((_, index) => <LoadingSkeleton key={index} />)
                  : featuredCars.map((car) => <CarCard key={car.id} car={car} />)
                }
              </div>

              {!loading && featuredCars.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleViewAllCars}
                    className="bg-[#004aad] hover:bg-[#003a8c] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                  >
                    View All Cars
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
