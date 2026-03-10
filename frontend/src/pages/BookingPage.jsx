import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carService } from '../services/carService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, CheckCircle, Car } from 'lucide-react';

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
    destination: '',
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
        userId: user.id,
        startDate: formData.pickupDate,
        endDate: formData.returnDate,
        destination: formData.destination,
        totalPrice: calculateTotal(),
        depositPaid: car?.deposit || 400
      };

      console.log('Booking payload:', bookingData); // Debug log

      await bookingService.createBooking(bookingData);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-10">
            <div className="h-10 bg-gray-300 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-gray-300 rounded-xl"></div>
                  <div className="h-24 bg-gray-300 rounded-xl"></div>
                </div>
                <div className="h-40 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-300 rounded-2xl"></div>
              </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl shadow-2xl p-10 md:p-12 text-center border border-gray-100 transform transition-all animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#192336] mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-xl text-[#6d6e71] mb-10 max-w-lg mx-auto">
              Thank you for choosing us! Your reservation has been successfully created. Check your email for confirmation details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/reservations')}
                className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                View My Reservations
              </button>
              <button
                onClick={() => navigate('/cars')}
                className="bg-gray-100 hover:bg-gray-200 text-[#192336] font-semibold px-10 py-4 rounded-xl transition-all text-lg"
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(`/cars/${carId}`)}
          className="flex items-center gap-2 text-[#6d6e71] hover:text-[#192336] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Car Details
        </button>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#192336] mb-10 tracking-tight">
          Complete Your Booking
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Form - Left (3/5 on lg) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-[#192336] mb-8">Booking Information</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-[#192336] mb-2">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-[#192336] mb-2">
                      Return Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleInputChange}
                        min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                        required
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#192336] mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="City or location where you'll take the car"
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <h3 className="text-xl font-semibold text-[#192336]">Your Contact Details</h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-[#192336] mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-[#192336] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+92 XXX XXX XXXX"
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-[#192336] mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d9b15c] focus:border-transparent shadow-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#d9b15c] hover:bg-[#c4a052] disabled:opacity-60 text-[#192336] font-bold py-5 px-8 rounded-xl text-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? 'Processing Your Booking...' : 'Confirm & Book Now'}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar - Right (2/5 on lg) - Sticky */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-[#192336] mb-8 pb-4 border-b border-gray-100">
                Booking Summary
              </h2>

              <div className="space-y-8">
                {/* Car Preview */}
                <div className="flex gap-5 items-center">
                  <div className="w-32 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={car.vehicleimage?.[0]?.imageUrl || car.imageUrl || '/src/assert/car.jpg'}
                      alt={`${car.brand || car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/src/assert/car.jpg'; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#192336] mb-1">
                      {car.brand || car.make} {car.model}
                    </h3>
                    <p className="text-[#6d6e71] mb-2">{car.category || 'Standard'}</p>
                    <p className="text-lg font-bold text-[#d9b15c]">
                      ${car.dailyPrice || car.pricePerDay || 80} / day
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-[#6d6e71]">Daily Rate</span>
                    <span className="font-semibold">${car.dailyPrice || car.pricePerDay || 80}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-[#6d6e71]">Rental Duration</span>
                    <span className="font-semibold">{calculateDays()} day{calculateDays() !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between text-2xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-[#d9b15c]">${calculateTotal()}</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-sm text-[#6d6e71] space-y-3">
                  <h4 className="font-semibold text-[#192336]">Important Notes</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Valid driver's license and minimum age 21 required</li>
                    <li>Full-to-full fuel policy – return with same fuel level</li>
                    <li>Security deposit may be held until return</li>
                    <li>Free cancellation up to 24 hours before pickup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;