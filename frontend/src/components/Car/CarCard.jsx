import { useNavigate } from 'react-router-dom';
import { Car, Users, Fuel, Settings } from 'lucide-react';

const CarCard = ({ car, showViewDetails = true }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/cars/${car.id}`);
  };

  const getImageUrl = () => {
    if (car.vehicleimage && car.vehicleimage.length > 0) {
      return car.vehicleimage[0].imageUrl;
    }
    return car.imageUrl || '/src/assert/car.jpg';
  };

  return (
    <div 
      className={`
        group bg-white rounded-2xl overflow-hidden 
        border border-gray-200/60 shadow-md hover:shadow-2xl 
        transition-all duration-300 hover:-translate-y-1
        h-full flex flex-col
      `}
    >
      {/* Image section */}
      <div className="relative h-56 md:h-60 overflow-hidden bg-gradient-to-b from-gray-900/10 to-transparent">
        <img
          src={getImageUrl()}
          alt={`${car.brand || car.make} ${car.model}`}
          className={`
            w-full h-full object-cover object-center 
            transition-transform duration-500 
            group-hover:scale-110
          `}
          onError={(e) => {
            e.target.src = '/src/assert/car.jpg';
          }}
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
          {car.brand || car.make} {car.model}
        </h3>

        {/* Specs - modern pill style */}
        <div className="flex flex-wrap gap-2 mb-5 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
            <Users className="w-4 h-4" />
            <span>{car.seats || 4} Seats</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
            <Settings className="w-4 h-4" />
            <span>{car.transmission || 'Auto'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType || 'Petrol'}</span>
          </div>
        </div>

        {/* Price + Button */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-3xl md:text-3xl font-extrabold text-gray-900">
              ${car.dailyPrice || car.pricePerDay || 80}
            </span>
            <span className="text-base font-medium text-gray-500 ml-1">/day</span>
          </div>

          {showViewDetails && (
            <button
              onClick={handleViewDetails}
              className={`
                bg-amber-600 hover:bg-amber-700 
                text-white font-semibold 
                px-6 py-3 rounded-xl 
                transition-all duration-300 
                shadow-md hover:shadow-lg 
                transform hover:scale-[1.03] active:scale-[0.98]
              `}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;