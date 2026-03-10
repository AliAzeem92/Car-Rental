import { useState, useEffect } from "react";
import { Filter, Calendar, DollarSign } from "lucide-react";
import { useFilter } from "../../context/FilterContext";

const CarFilters = ({ categories = [] }) => {
  const { filters, updateFilter } = useFilter();
  const [priceRange, setPriceRange] = useState(filters.priceRange || [30, 500]);

  const defaultCategories = ["All Cars", "SUV", "Sedan", "Luxury", "Economy", "Hatchback", "Convertible"];
  const availableCategories = categories.length > 0 ? ["All Cars", ...categories] : defaultCategories;

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("priceRange", priceRange);
    }, 400);
    return () => clearTimeout(timer);
  }, [priceRange, updateFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 sticky top-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#d9b15c]/10 rounded-xl">
          <Filter className="h-6 w-6 text-[#192336]" />
        </div>
        <h3 className="text-2xl font-bold text-[#192336]">Refine Your Search</h3>
      </div>

      {/* Category */}
      <div className="mb-10">
        <h4 className="font-semibold text-[#192336] mb-4 text-lg">Category</h4>
        <div className="space-y-3">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={filters.category === cat}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-5 h-5 text-[#d9b15c] border-gray-300 focus:ring-[#d9b15c] cursor-pointer"
              />
              <span className="text-[#6d6e71] group-hover:text-[#192336] transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="mb-10">
        <h4 className="font-semibold text-[#192336] mb-4 text-lg">Rental Period</h4>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6d6e71] mb-2">Pickup</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={filters.pickupDate}
                onChange={(e) => updateFilter("pickupDate", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6d6e71] mb-2">Return</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={filters.returnDate}
                onChange={(e) => updateFilter("returnDate", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-[#192336] mb-4 text-lg">Price per Day</h4>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm text-[#6d6e71] mb-2">Min</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] shadow-sm"
                  placeholder="30"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-[#6d6e71] mb-2">Max</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] shadow-sm"
                  placeholder="500"
                />
              </div>
            </div>
          </div>

          {/* Dual Range Slider */}
          <div className="relative py-4">
            <input
              type="range"
              min="30"
              max="500"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="absolute w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#d9b15c] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
            <input
              type="range"
              min="30"
              max="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="absolute w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#d9b15c] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex justify-between text-sm font-medium text-[#6d6e71] mt-8">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarFilters;