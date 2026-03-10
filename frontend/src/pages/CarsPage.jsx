import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/Car/CarCard';
import CarFilters from '../components/Filters/CarFilters';
import { carService } from '../services/carService';
import { Search, SlidersHorizontal } from 'lucide-react';

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

    if (searchTerm) {
      filtered = filtered.filter(car =>
        `${car.brand || car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(car => {
        const price = car.dailyPrice || car.pricePerDay || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    if (filters.brand) filtered = filtered.filter(car => (car.brand || car.make) === filters.brand);
    if (filters.fuelType) filtered = filtered.filter(car => car.fuelType === filters.fuelType);
    if (filters.transmission) filtered = filtered.filter(car => car.transmission === filters.transmission);
    if (filters.seats) filtered = filtered.filter(car => car.seats === parseInt(filters.seats));

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
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 animate-pulse h-full flex flex-col">
      <div className="h-56 bg-gray-200" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-7 bg-gray-300 rounded mb-3 w-4/5" />
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-gray-300 rounded-full w-16" />
          <div className="h-6 bg-gray-300 rounded-full w-20" />
        </div>
        <div className="mt-auto flex justify-between items-center">
          <div className="h-8 bg-gray-300 rounded w-24" />
          <div className="h-10 bg-gray-300 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#192336] tracking-tight">
            Our <span className="text-[#004aad]">Fleet</span>
          </h1>
          <p className="mt-3 text-lg md:text-xl text-[#6d6e71]">
            Discover premium vehicles for every journey
          </p>
        </div>

        {/* Search + Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d9b15c] shadow-sm transition-all text-lg"
            />
          </div>
          <button className="md:hidden flex items-center justify-center gap-2 bg-[#004aad] text-white px-6 py-3 rounded-xl font-medium shadow-md">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Filters - Sticky on large screens */}
          <div className="lg:w-80 lg:sticky lg:top-24 lg:self-start">
            <CarFilters onFiltersChange={handleFiltersChange} cars={cars} />
          </div>

          {/* Results */}
          <div className="flex-1">
            {error ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                <p className="text-xl text-red-600 font-medium mb-6">Failed to load fleet: {error}</p>
                <button
                  onClick={fetchCars}
                  className="bg-[#d9b15c] hover:bg-[#c4a052] text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 flex justify-between items-center">
                  <p className="text-lg text-[#6d6e71] font-medium">
                    {loading ? 'Loading vehicles...' : `${filteredCars.length} vehicles available`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {loading
                    ? [...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)
                    : filteredCars.map((car) => (
                        <div key={car.id} className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                          <CarCard car={car} />
                        </div>
                      ))
                  }
                </div>

                {!loading && filteredCars.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-2xl text-[#192336] font-semibold mb-4">No vehicles found</p>
                    <p className="text-[#6d6e71] text-lg">Try adjusting your search or filters</p>
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