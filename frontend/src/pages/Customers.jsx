import { useState, useEffect } from 'react';
import { Search, ChevronRight, Eye, Ban, CheckCircle } from 'lucide-react';
import { customerAPI } from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const Customers = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      showToast('Failed to load customers', 'error');
    }
  };

  const toggleBlacklist = async (id, isBlacklisted) => {
    try {
      await customerAPI.toggleBlacklist(id);
      showToast(`Customer ${isBlacklisted ? 'removed from' : 'added to'} blacklist`, 'success');
      loadCustomers();
    } catch (error) {
      showToast('Failed to update blacklist status', 'error');
    }
  };

  const handlePageChange = (newPage) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 150);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.firstName?.toLowerCase().includes(searchLower) ||
      customer.lastName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Total Rentals</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-100 transition-opacity duration-150 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}>
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              paginatedCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {customer.profileImageUrl ? (
                        <img src={customer.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <>{customer.firstName?.[0]}{customer.lastName?.[0]}</>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        License: {customer.licenseNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.email}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {customer._count.reservation}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewModal(customer)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleBlacklist(customer.id, customer.isBlacklisted)}
                      className={`p-2 rounded-lg transition ${
                        customer.isBlacklisted
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      title={customer.isBlacklisted ? 'Remove from Blacklist' : 'Add to Blacklist'}
                    >
                      {customer.isBlacklisted ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-50 ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Customer Details" size="max-w-2xl">
        {viewModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {viewModal.profileImageUrl ? (
                  <img src={viewModal.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{viewModal.firstName?.[0]}{viewModal.lastName?.[0]}</>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{viewModal.firstName} {viewModal.lastName}</h3>
                <p className="text-sm text-gray-600">{viewModal.role}</p>
                {viewModal.isBlacklisted && (
                  <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                    Blacklisted
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900">{viewModal.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-gray-900">{viewModal.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">License Number</label>
                <p className="text-gray-900">{viewModal.licenseNumber}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">License Expiry</label>
                <p className="text-gray-900">{new Date(viewModal.licenseExpiryDate).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-gray-600">Address</label>
                <p className="text-gray-900">{viewModal.address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Total Rentals</label>
                <p className="text-gray-900">{viewModal._count.reservation}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Member Since</label>
                <p className="text-gray-900">{new Date(viewModal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {(viewModal.idCardUrl || viewModal.licenseUrl) && (
              <div className="pt-4 border-t">
                <label className="text-sm font-semibold text-gray-600 block mb-3">Documents</label>
                <div className="flex gap-4">
                  {viewModal.idCardUrl && (
                    <a href={viewModal.idCardUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View ID Card
                    </a>
                  )}
                  {viewModal.licenseUrl && (
                    <a href={viewModal.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View License
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
