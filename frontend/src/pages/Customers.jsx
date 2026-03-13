import { useState, useEffect } from 'react';
import { Search, Eye, Ban, CheckCircle } from 'lucide-react';
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
      showToast(
        `Customer ${isBlacklisted ? 'removed from' : 'added to'} blacklist`,
        'success'
      );
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

  const filteredCustomers = customers.filter((customer) => {
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
    <div className="space-y-5 page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Customers
        </h1>
        <span className="text-sm text-gray-500">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* ── Table (desktop) / Cards (mobile) ── */}

      {/* Desktop table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 table-responsive hidden sm:block">
        <table className="w-full" style={{ minWidth: '600px' }}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Phone
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Rentals
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-100 transition-opacity duration-150 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500 text-sm"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs overflow-hidden flex-shrink-0">
                        {customer.profileImageUrl ? (
                          <img
                            src={customer.profileImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {customer.firstName?.[0]}
                            {customer.lastName?.[0]}
                          </>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {customer.licenseNumber}
                        </div>
                      </div>
                      {customer.isBlacklisted && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium flex-shrink-0">
                          Blacklisted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-700 max-w-[160px] truncate">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                      {customer._count.reservation}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewModal(customer)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          toggleBlacklist(customer.id, customer.isBlacklisted)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          customer.isBlacklisted
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        title={
                          customer.isBlacklisted
                            ? 'Remove from Blacklist'
                            : 'Add to Blacklist'
                        }
                      >
                        {customer.isBlacklisted ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div
        className={`sm:hidden space-y-3 transition-opacity duration-150 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {paginatedCustomers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500 text-sm">
            No customers found
          </div>
        ) : (
          paginatedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                  {customer.profileImageUrl ? (
                    <img
                      src={customer.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {customer.firstName?.[0]}
                      {customer.lastName?.[0]}
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    {customer.isBlacklisted && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium flex-shrink-0">
                        Blacklisted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {customer.email}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px]">
                    {customer._count.reservation}
                  </span>
                  Rentals
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewModal(customer)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      toggleBlacklist(customer.id, customer.isBlacklisted)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      customer.isBlacklisted
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {customer.isBlacklisted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
        <span className="text-center sm:text-left">
          Showing {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
          {filteredCustomers.length}
        </span>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Next
          </button>
        </div>
      </div>

      {/* ── Customer Details Modal ── */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Customer Details"
        size="max-w-2xl"
      >
        {viewModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                {viewModal.profileImageUrl ? (
                  <img
                    src={viewModal.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {viewModal.firstName?.[0]}
                    {viewModal.lastName?.[0]}
                  </>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {viewModal.firstName} {viewModal.lastName}
                </h3>
                <p className="text-sm text-gray-500">{viewModal.role}</p>
                {viewModal.isBlacklisted && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                    Blacklisted
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </label>
                <p className="text-gray-900 text-sm mt-0.5 truncate">
                  {viewModal.email}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone
                </label>
                <p className="text-gray-900 text-sm mt-0.5">{viewModal.phone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  License Number
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.licenseNumber}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  License Expiry
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {new Date(viewModal.licenseExpiryDate).toLocaleDateString()}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Address
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal.address || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total Rentals
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {viewModal._count.reservation}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Member Since
                </label>
                <p className="text-gray-900 text-sm mt-0.5">
                  {new Date(viewModal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {(viewModal.idCardUrl || viewModal.licenseUrl) && (
              <div className="pt-4 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
                  Documents
                </label>
                <div className="flex flex-wrap gap-3">
                  {viewModal.idCardUrl && (
                    <a
                      href={viewModal.idCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      View ID Card
                    </a>
                  )}
                  {viewModal.licenseUrl && (
                    <a
                      href={viewModal.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
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
