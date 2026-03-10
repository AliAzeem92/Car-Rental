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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        <img
          src={getImageUrl()}
          alt={`${car.brand || car.make} ${car.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/src/assert/car.jpg';
          }}
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#192336] mb-2">
          {car.brand || car.make} {car.model}
        </h3>
        
        <div className="flex items-center justify-between mb-4 text-sm text-[#6d6e71]">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{car.seats || 4} Seats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span>{car.transmission || 'Auto'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType || 'Petrol'}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-[#192336]">
              ${car.dailyPrice || car.pricePerDay || 80}
              <span className="text-sm font-normal text-[#6d6e71]">/day</span>
            </div>
          </div>
          
          {showViewDetails && (
            <button
              onClick={handleViewDetails}
              className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-2 px-4 rounded-lg transition-colors"
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