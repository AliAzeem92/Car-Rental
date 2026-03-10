import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail } from 'lucide-react';

const BookingPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    returnDate: '',
    customerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const carData = await carService.fetchCarById(carId);
      setCar(carData);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = () => {
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const diffTime = Math.abs(returnDate - pickup);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return 1;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const dailyRate = car?.dailyPrice || car?.pricePerDay || 80;
    return days * dailyRate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        vehicleId: parseInt(carId),
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        totalAmount: calculateTotal(),
        customerName: formData.customerName,
        customerPhone: formData.phone,
        customerEmail: formData.email
      };

      await bookingService.createBooking(bookingData);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#192336] mb-4">Booking Confirmed!</h2>
            <p className="text-[#6d6e71] mb-6">
              Your booking has been successfully submitted. You will receive a confirmation email shortly.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/reservations')}
                className="bg-[#d9b15c] hover:bg-[#c4a052] text-white px-6 py-2 rounded-lg"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/cars')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Browse More Cars
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/cars/${carId}`)}
          className="flex items-center space-x-2 text-[#6d6e71] hover:text-[#192336] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Car Details</span>
        </button>

        <h1 className="text-3xl font-bold text-[#192336] mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#192336] mb-6">Booking Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pickup & Return Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                  />
                </div>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    placeholder="Enter pickup location"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Drop-off Location
                  </label>
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleInputChange}
                    placeholder="Enter drop-off location"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#192336]">Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#192336] mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#192336] mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9b15c]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#d9b15c] hover:bg-[#c4a052] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Car Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#192336] mb-6">Booking Summary</h2>
            
            {car && (
              <div className="space-y-6">
                {/* Car Info */}
                <div className="flex space-x-4">
                  <img
                    src={car.vehicleimage?.[0]?.imageUrl || car.imageUrl || '/src/assert/car.jpg'}
                    alt={`${car.brand || car.make} ${car.model}`}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/src/assert/car.jpg';
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-[#192336]">
                      {car.brand || car.make} {car.model}
                    </h3>
                    <p className="text-[#6d6e71]">{car.category || 'Standard'}</p>
                    <p className="text-lg font-bold text-[#d9b15c]">
                      ${car.dailyPrice || car.pricePerDay || 80}/day
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#6d6e71]">Daily Rate:</span>
                      <span className="font-semibold">${car.dailyPrice || car.pricePerDay || 80}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6d6e71]">Duration:</span>
                      <span className="font-semibold">{calculateDays()} day(s)</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-[#d9b15c]">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Rental Terms */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-[#192336] mb-2">Rental Terms</h4>
                  <ul className="text-sm text-[#6d6e71] space-y-1">
                    <li>• Valid driver's license required</li>
                    <li>• Minimum age: 21 years</li>
                    <li>• Security deposit may apply</li>
                    <li>• Fuel tank should be returned full</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;