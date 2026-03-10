import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/Car/CarCard';
import CarFilters from '../components/Filters/CarFilters';
import { carService } from '../services/carService';
import { Search } from 'lucide-react';

const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const carsData = await carService.fetchCars();
      setCars(carsData);
      setFilteredCars(carsData);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters) => {
    let filtered = [...cars];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(car =>
        `${car.brand || car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(car => {
        const price = car.dailyPrice || car.pricePerDay || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply other filters
    if (filters.brand) {
      filtered = filtered.filter(car => (car.brand || car.make) === filters.brand);
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filters.fuelType);
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }

    if (filters.seats) {
      filtered = filtered.filter(car => car.seats === parseInt(filters.seats));
    }

    setFilteredCars(filtered);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    let filtered = [...cars];
    if (term) {
      filtered = filtered.filter(car =>
        `${car.brand || car.make} ${car.model}`.toLowerCase().includes(term.toLowerCase())
      );
    }
    setFilteredCars(filtered);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#192336] mb-4">Our Fleet</h1>
          <p className="text-xl text-[#6d6e71]">
            Choose from our wide selection of premium vehicles
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <CarFilters onFiltersChange={handleFiltersChange} cars={cars} />
          </div>

          {/* Cars Grid */}
          <div className="lg:w-3/4">
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Failed to load vehicles: {error}</p>
                <button
                  onClick={fetchCars}
                  className="bg-[#d9b15c] hover:bg-[#c4a052] text-white px-6 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-[#6d6e71]">
                    {loading ? 'Loading...' : `${filteredCars.length} vehicles found`}
                  </p>
                </div>

                {/* Cars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading
                    ? [...Array(6)].map((_, index) => <LoadingSkeleton key={index} />)
                    : filteredCars.map((car) => <CarCard key={car.id} car={car} />)
                  }
                </div>

                {/* No Results */}
                {!loading && filteredCars.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#6d6e71] text-lg">No vehicles match your criteria.</p>
                    <p className="text-[#6d6e71] mt-2">Try adjusting your filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarsPage;