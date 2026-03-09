import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FiltersSidebar from "../components/FiltersSidebar";
import CarGrid from "../components/CarGrid";
import Footer from "../components/Footer";
import { useFilter } from "../context/FilterContext";
import { vehicleAPI } from "../services/api";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filters } = useFilter();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, filters]);

  const fetchCars = async () => {
    try {
      const response = await vehicleAPI.getAll();
      const carsData = response.data.map((car) => ({
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

      setCars(carsData);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(carsData.map((car) => car.category)),
      ];
      setCategories(uniqueCategories);
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
        {
          id: 4,
          make: "Mercedes",
          model: "C-Class",
          category: "Luxury",
          seats: 4,
          transmission: "Auto",
          fuelType: "Petrol",
          pricePerDay: 100,
          deposit: 450,
          imageUrl: null,
          rating: 4.7,
        },
        {
          id: 5,
          make: "Honda",
          model: "Civic",
          category: "Sedan",
          seats: 5,
          transmission: "Auto",
          fuelType: "Petrol",
          pricePerDay: 50,
          deposit: 300,
          imageUrl: null,
          rating: 4.6,
        },
        {
          id: 6,
          make: "Audi",
          model: "Q7",
          category: "SUV",
          seats: 7,
          transmission: "Auto",
          fuelType: "Petrol",
          pricePerDay: 90,
          deposit: 500,
          imageUrl: null,
          rating: 4.8,
        },
      ];
      setCars(mockCars);
      setCategories(["Luxury", "SUV", "Economy", "Sedan"]);
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = [...cars];

    // Filter by category
    if (filters.category && filters.category !== "All Cars") {
      filtered = filtered.filter((car) => car.category === filters.category);
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(
        (car) =>
          car.pricePerDay >= filters.priceRange[0] &&
          car.pricePerDay <= filters.priceRange[1],
      );
    }

    // Filter by availability (if dates are selected)
    if (filters.pickupDate && filters.returnDate) {
      // Here you would call an API to check availability
      // For now, we'll just show all cars
      console.log(
        "Filtering by dates:",
        filters.pickupDate,
        filters.returnDate,
      );
    }

    setFilteredCars(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-[#192336] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Cars</h1>
          <p className="text-xl text-gray-300">
            Find the perfect vehicle for your journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <FiltersSidebar categories={categories} />
          </div>

          {/* Cars Grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#192336]">
                Available Vehicles ({filteredCars.length})
              </h2>
              {filters.category !== "All Cars" && (
                <span className="bg-[#d9b15c] text-white px-3 py-1 rounded-full text-sm">
                  {filters.category}
                </span>
              )}
            </div>

            <CarGrid cars={filteredCars} loading={loading} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cars;
