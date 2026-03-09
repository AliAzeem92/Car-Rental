import { useState, useEffect } from "react";
import { Filter, Calendar } from "lucide-react";
import { useFilter } from "../context/FilterContext";

const FiltersSidebar = ({ categories = [] }) => {
  const { filters, updateFilter } = useFilter();
  const [priceRange, setPriceRange] = useState(filters.priceRange);

  const defaultCategories = ["All Cars", "SUV", "Sedan", "Luxury", "Economy"];

  const availableCategories =
    categories.length > 0 ? ["All Cars", ...categories] : defaultCategories;

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("priceRange", priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange, updateFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5 text-[#192336]" />
        <h3 className="text-xl font-bold text-[#192336]">Filters</h3>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#192336] mb-3">Category</h4>
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-4 h-4 text-[#d9b15c] border-gray-300 focus:ring-[#d9b15c]"
              />
              <span className="text-[#6d6e71]">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#192336] mb-3">Date Filter</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6d6e71] mb-1">
              Pickup Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.pickupDate}
                onChange={(e) => updateFilter("pickupDate", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6d6e71] mb-1">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.returnDate}
                onChange={(e) => updateFilter("returnDate", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#192336] mb-3">Price / Day</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm text-[#6d6e71] mb-1">Min</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
                placeholder="$30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-[#6d6e71] mb-1">Max</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([
                    priceRange[0],
                    parseInt(e.target.value) || 500,
                  ])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm"
                placeholder="$500"
              />
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="relative">
            <input
              type="range"
              min="30"
              max="500"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([parseInt(e.target.value), priceRange[1]])
              }
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{ zIndex: 1 }}
            />
            <input
              type="range"
              min="30"
              max="500"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{ zIndex: 2 }}
            />
            <div className="flex justify-between text-sm text-[#6d6e71] mt-6">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
