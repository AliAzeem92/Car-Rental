import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Car, Users, Plus, UserPlus, CalendarDays, CheckCircle } from 'lucide-react';
import { vehicleAPI, reservationAPI, customerAPI, planningAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalReservations: 0, upcomingPickups: 0, currentlyRented: 0, totalVehicles: 0 });
  const [upcomingList, setUpcomingList] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehicles, reservations] = await Promise.all([
        vehicleAPI.getAll(),
        reservationAPI.getAll()
      ]);

      const now = new Date();
      const upcoming = reservations.data?.filter(r => 
        new Date(r.startDate) > now && ['PENDING', 'CONFIRMED'].includes(r.status)
      ).slice(0, 4) || [];

      setStats({
        totalReservations: reservations.data?.length || 0,
        upcomingPickups: upcoming.length,
        currentlyRented: reservations.data?.filter(r => r.status === 'ONGOING').length || 0,
        totalVehicles: vehicles.data?.length || 0
      });

      setUpcomingList(upcoming);
      setRecentReservations(reservations.data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    ONGOING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={() => navigate('/dashboard/reservations')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition">
          <Plus className="w-5 h-5" /> Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-100 hover:bg-blue-200 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reservations</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalReservations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-100 hover:bg-purple-200 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Pick-ups</p>
              <p className="text-3xl font-bold text-gray-800">{stats.upcomingPickups}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-100 hover:bg-green-200 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Rented</p>
              <p className="text-3xl font-bold text-gray-800">{stats.currentlyRented}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 hover:bg-yellow-200 rounded-xl p-6 border border-yellow-100">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalVehicles}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl text-center shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => navigate('/dashboard/reservations')} className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-xl transition text-center">
              <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Create Reservation</p>
            </button>
            <button onClick={() => navigate('/dashboard/vehicles')} className="bg-blue-100 hover:bg-blue-200 p-6 rounded-xl transition text-center">
              <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Add Vehicle</p>
            </button>
            <button onClick={() => navigate('/dashboard/planning')} className="bg-purple-100 hover:bg-purple-200 p-6 rounded-xl transition text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">View Calendar</p>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 p-6 rounded-xl transition text-center">
              <CalendarDays className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">New Calendar</p>
            </button>
            <button onClick={() => navigate('/dashboard/customers')} className="bg-indigo-100 hover:bg-indigo-200 p-6 rounded-xl transition text-center">
              <UserPlus className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Add Customer</p>
            </button>
            <button className="bg-green-100 hover:bg-green-200 p-6 rounded-xl transition text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Fleet Status</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Pick-ups</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 pb-2 border-b">
              <div>Date</div>
              <div>Customer</div>
              <div>Vehicle</div>
            </div>
            {upcomingList.length > 0 ? upcomingList.map((res) => (
              <div key={res.id} className="grid grid-cols-3 gap-4 text-sm py-2 hover:bg-gray-50 rounded">
                <div className="text-gray-800">{formatDate(res.startDate)} {formatTime(res.startDate)}</div>
                <div className="text-gray-800">{res.user?.firstName || 'N/A'} {res.user?.lastName || ''}</div>
                <div className="text-gray-600">{res.vehicle?.brand} {res.vehicle?.model}</div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm py-4 text-center">No upcoming pick-ups</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Reservations</h2>
          <button onClick={() => navigate('/dashboard/reservations')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-500 pb-2 border-b">
            <div>Customer</div>
            <div>Vehicle</div>
            <div>Return</div>
            <div>Status</div>
          </div>
          {recentReservations.length > 0 ? recentReservations.map((res) => (
            <div key={res.id} className="grid grid-cols-4 gap-4 text-sm py-3 hover:bg-gray-50 rounded items-center">
              <div className="text-gray-800 font-medium">{res.user?.firstName || 'N/A'} {res.user?.lastName || ''}</div>
              <div className="text-gray-600">{res.vehicle?.brand} {res.vehicle?.model}</div>
              <div className="text-gray-600">{formatDate(res.endDate)}</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[res.status] || 'bg-gray-100 text-gray-700'}`}>
                  {res.status}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-sm py-4 text-center">No reservations yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
