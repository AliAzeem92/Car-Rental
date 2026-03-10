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
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-md animate-pulse flex flex-col h-full">
      <div className="relative h-56 md:h-64 bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <div className="h-7 bg-gray-300 rounded mb-3 w-5/6"></div>
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="h-8 bg-gray-300 rounded w-24"></div>
          <div className="h-11 bg-gray-300 rounded-xl w-32"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />

      {/* Featured Vehicles Section - Upgraded */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#192336] tracking-tight">
              Featured <span className="text-[#004aad] relative">
                Vehicles
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#d9b15c]/60 rounded-full"></span>
              </span>
            </h2>
            <p className="mt-4 text-xl md:text-2xl text-[#6d6e71] font-medium">
              Discover Our <span className="text-[#192336] font-semibold">Premium Selection</span>
            </p>
          </div>

          {error ? (
            <div className="text-center py-16 bg-white/80 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
              <p className="text-xl text-red-600 mb-6 font-medium">
                Failed to load featured vehicles: {error}
              </p>
              <button
                onClick={fetchFeaturedCars}
                className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-12 md:mb-16">
                {loading
                  ? [...Array(3)].map((_, index) => <LoadingSkeleton key={index} />)
                  : featuredCars.map((car) => (
                      <div className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        <CarCard key={car.id} car={car} />
                      </div>
                    ))
                }
              </div>

              {!loading && featuredCars.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleViewAllCars}
                    className="
                      bg-[#004aad] hover:bg-[#003a8c] 
                      text-white font-bold text-lg md:text-xl 
                      py-4 px-10 md:px-12 rounded-xl 
                      shadow-lg hover:shadow-xl 
                      transition-all duration-300 
                      transform hover:scale-[1.05] active:scale-[0.98]
                    "
                  >
                    View Full Fleet
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