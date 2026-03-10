import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carService } from '../services/carService';
import { Users, Fuel, Settings, Calendar, MapPin, Star, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const images = car ? getImages() : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-10"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <div className="h-[500px] bg-gray-300 rounded-2xl"></div>
                <div className="flex gap-3 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="h-10 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded-2xl"></div>
                <div className="h-40 bg-gray-300 rounded-2xl"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
            <p className="text-2xl text-red-600 font-semibold mb-6">
              {error || 'Car not found'}
            </p>
            <button
              onClick={() => navigate('/cars')}
              className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-semibold px-10 py-4 rounded-xl text-lg shadow-md hover:shadow-lg transition-all"
            >
              Back to Fleet
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center gap-2 text-[#6d6e71] hover:text-[#192336] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cars
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Image Gallery - Left Column (3/5 on lg) */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src={images[selectedImage]}
                alt={`${car.brand || car.make} ${car.model}`}
                className="w-full h-[500px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.target.src = '/src/assert/car.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-6 relative">
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`
                        flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden 
                        border-2 transition-all duration-300 snap-start
                        ${selectedImage === index 
                          ? 'border-[#d9b15c] shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-[#d9b15c]/60 hover:scale-105'}
                      `}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details & Booking Sidebar - Right Column (2/5 on lg) */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-8">
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#192336] tracking-tight mb-3">
                {car.brand || car.make} {car.model}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#d9b15c]/10 px-4 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-[#192336]">4.8</span>
                </div>
                <span className="text-[#6d6e71]">(124 reviews)</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-[#192336]">
                  ${car.dailyPrice || car.pricePerDay || 80}
                </span>
                <span className="text-xl font-medium text-[#6d6e71]">/day</span>
              </div>
              <p className="text-[#6d6e71] text-sm">Best daily rate • Free cancellation</p>

              <button
                onClick={handleBookCar}
                className="mt-8 w-full bg-[#d9b15c] hover:bg-[#c4a052] text-[#192336] font-bold text-xl py-5 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Book This Car Now
              </button>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-[#192336] mb-6">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Users, label: 'Seats', value: `${car.seats || 4} People` },
                  { icon: Settings, label: 'Transmission', value: car.transmission || 'Automatic' },
                  { icon: Fuel, label: 'Fuel Type', value: car.fuelType || 'Petrol' },
                  { icon: Calendar, label: 'Year', value: car.year || '2023' },
                ].map((spec, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-3 bg-[#d9b15c]/10 rounded-xl">
                      <spec.icon className="w-6 h-6 text-[#d9b15c]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6d6e71]">{spec.label}</p>
                      <p className="font-semibold text-[#192336] text-lg">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-[#192336] mb-6">Features</h3>
                <div className="flex flex-wrap gap-3">
                  {car.features.split(',').map((feature, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-[#d9b15c]/10 text-[#192336] rounded-full text-sm font-medium border border-[#d9b15c]/30"
                    >
                      {feature.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-[#192336] mb-6">About this car</h3>
                <p className="text-[#6d6e71] leading-relaxed text-lg whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarDetailPage;