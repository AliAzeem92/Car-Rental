import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const CarFilters = ({ onFiltersChange, cars = [] }) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    fuelType: '',
    transmission: '',
    brand: '',
    seats: ''
  });

  const [isOpen, setIsOpen] = useState(false);

  // Extract unique values from cars data
  const getUniqueValues = (key) => {
    const values = cars.map(car => car[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 500],
      fuelType: '',
      transmission: '',
      brand: '',
      seats: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`bg-white rounded-lg shadow-md p-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#192336]">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-[#d9b15c] hover:text-[#c4a052] font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192336] mb-2">
            Price Range (per day)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
              className="w-20 px-2 py-1 border rounded text-sm"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 500])}
              className="w-20 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        {/* Brand */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192336] mb-2">Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
          >
            <option value="">All Brands</option>
            {getUniqueValues('brand').map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192336] mb-2">Fuel Type</label>
          <select
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
          >
            <option value="">All Fuel Types</option>
            {getUniqueValues('fuelType').map(fuel => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192336] mb-2">Transmission</label>
          <select
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
          >
            <option value="">All Transmissions</option>
            {getUniqueValues('transmission').map(trans => (
              <option key={trans} value={trans}>{trans}</option>
            ))}
          </select>
        </div>

        {/* Seats */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#192336] mb-2">Seats</label>
          <select
            value={filters.seats}
            onChange={(e) => handleFilterChange('seats', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
          >
            <option value="">Any Seats</option>
            {getUniqueValues('seats').map(seats => (
              <option key={seats} value={seats}>{seats} Seats</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default CarFilters;