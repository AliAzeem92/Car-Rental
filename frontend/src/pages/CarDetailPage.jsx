import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carService } from '../services/carService';
import { Users, Fuel, Settings, Calendar, MapPin, Star, ArrowLeft } from 'lucide-react';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const carData = await carService.fetchCarById(id);
      setCar(carData);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookCar = () => {
    navigate(`/booking/${id}`);
  };

  const getImages = () => {
    if (car?.vehicleimage && car.vehicleimage.length > 0) {
      return car.vehicleimage.map(img => img.imageUrl);
    }
    return [car?.imageUrl || '/src/assert/car.jpg'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              {error || 'Car not found'}
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="bg-[#d9b15c] hover:bg-[#c4a052] text-white px-6 py-2 rounded-lg"
            >
              Back to Cars
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getImages();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center space-x-2 text-[#6d6e71] hover:text-[#192336] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Cars</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <img
                src={images[selectedImage]}
                alt={`${car.brand || car.make} ${car.model}`}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/src/assert/car.jpg';
                }}
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-[#d9b15c]' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div>
            <h1 className="text-4xl font-bold text-[#192336] mb-2">
              {car.brand || car.make} {car.model}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-[#6d6e71]">4.8 (124 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
              <div className="text-3xl font-bold text-[#192336] mb-2">
                ${car.dailyPrice || car.pricePerDay || 80}
                <span className="text-lg font-normal text-[#6d6e71]">/day</span>
              </div>
              <p className="text-[#6d6e71]">Best price guaranteed</p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
              <h3 className="text-xl font-semibold text-[#192336] mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-[#d9b15c]" />
                  <div>
                    <p className="text-sm text-[#6d6e71]">Seats</p>
                    <p className="font-semibold text-[#192336]">{car.seats || 4} People</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-[#d9b15c]" />
                  <div>
                    <p className="text-sm text-[#6d6e71]">Transmission</p>
                    <p className="font-semibold text-[#192336]">{car.transmission || 'Auto'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Fuel className="w-5 h-5 text-[#d9b15c]" />
                  <div>
                    <p className="text-sm text-[#6d6e71]">Fuel Type</p>
                    <p className="font-semibold text-[#192336]">{car.fuelType || 'Petrol'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#d9b15c]" />
                  <div>
                    <p className="text-sm text-[#6d6e71]">Year</p>
                    <p className="font-semibold text-[#192336]">{car.year || '2023'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {car.features && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-semibold text-[#192336] mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.features.split(',').map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#d9b15c] rounded-full"></div>
                      <span className="text-[#6d6e71]">{feature.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-semibold text-[#192336] mb-4">Description</h3>
                <p className="text-[#6d6e71] leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookCar}
              className="w-full bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg"
            >
              Book This Car
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarDetailPage;