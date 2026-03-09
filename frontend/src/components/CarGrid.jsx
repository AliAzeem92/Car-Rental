import { useState } from 'react';
import CarCard from './CarCard';
import ReservationModal from './ReservationModal';

const CarGrid = ({ cars, loading = false }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const handleBookCar = (car) => {
    setSelectedCar(car);
    setShowReservationModal(true);
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
    setSelectedCar(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
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
        ))}
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚗</div>
        <h3 className="text-2xl font-bold text-[#192336] mb-2">No Cars Available</h3>
        <p className="text-[#6d6e71]">
          Try adjusting your filters or check back later for more options.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onBook={handleBookCar}
          />
        ))}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && selectedCar && (
        <ReservationModal
          car={selectedCar}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default CarGrid;