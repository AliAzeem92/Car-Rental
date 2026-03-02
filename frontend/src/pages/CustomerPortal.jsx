import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [view, setView] = useState('vehicles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, vehiclesRes, reservationsRes] = await Promise.all([
        axios.get('/api/auth/check', { withCredentials: true }),
        axios.get('/api/vehicles', { withCredentials: true }),
        axios.get('/api/reservations', { withCredentials: true })
      ]);
      setCustomer(profileRes.data.user);
      setVehicles(vehiclesRes.data.filter(v => v.status === 'AVAILABLE'));
      setReservations(reservationsRes.data.filter(r => r.userId === profileRes.data.user.id));
    } catch (error) {
      console.error('Load data error:', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    navigate('/login');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/reservations', {
        vehicleId: selectedVehicle.id,
        userId: customer.id,
        ...dates,
        totalPrice: calculateTotal(),
        depositPaid: selectedVehicle.deposit
      }, { withCredentials: true });
      setShowBooking(false);
      setSelectedVehicle(null);
      setDates({ startDate: '', endDate: '' });
      loadData();
      alert('Reservation created successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Booking failed');
    }
  };

  const calculateTotal = () => {
    if (!dates.startDate || !dates.endDate) return 0;
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days * selectedVehicle.dailyPrice;
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await axios.put(`/api/reservations/${id}/status`, { status: 'CANCELLED' }, { withCredentials: true });
      loadData();
    } catch (error) {
      alert('Failed to cancel reservation');
    }
  };

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    ONGOING: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚗 Car Rental</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {customer?.firstName}</span>
            <button
              onClick={() => setView('vehicles')}
              className={`px-4 py-2 rounded ${view === 'vehicles' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Browse Vehicles
            </button>
            <button
              onClick={() => setView('reservations')}
              className={`px-4 py-2 rounded ${view === 'reservations' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              My Reservations
            </button>
            <button
              onClick={() => setView('profile')}
              className={`px-4 py-2 rounded ${view === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Profile
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {view === 'vehicles' ? (
          <>
            <h2 className="text-3xl font-bold mb-6">Available Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {vehicle.vehicleimage?.[0] ? (
                      <img src={vehicle.vehicleimage[0].imageUrl} alt={vehicle.model} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">🚗</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-gray-600">{vehicle.category}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">${vehicle.dailyPrice}/day</span>
                      <button
                        onClick={() => { setSelectedVehicle(vehicle); setShowBooking(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === 'reservations' ? (
          <>
            <h2 className="text-3xl font-bold mb-6">My Reservations</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reservations.map(res => (
                    <tr key={res.id}>
                      <td className="px-6 py-4">{res.vehicle.brand} {res.vehicle.model}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">${res.totalPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[res.status]}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCancel(res.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6">My Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Name</label>
                  <p className="text-gray-900">{customer?.firstName} {customer?.lastName}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Email</label>
                  <p className="text-gray-900">{customer?.email}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">Phone</label>
                  <p className="text-gray-900">{customer?.phone}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">License Number</label>
                  <p className="text-gray-900">{customer?.licenseNumber}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2 font-semibold">Address</label>
                  <p className="text-gray-900">{customer?.address}</p>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">License Expiry</label>
                  <p className="text-gray-900">
                    {customer?.licenseExpiryDate ? new Date(customer.licenseExpiryDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Book {selectedVehicle.brand} {selectedVehicle.model}</h2>
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dates.startDate}
                  onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dates.endDate}
                  onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Daily Rate: ${selectedVehicle.dailyPrice}</p>
                <p className="text-sm text-gray-600">Deposit: ${selectedVehicle.deposit}</p>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => { setShowBooking(false); setSelectedVehicle(null); }}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
