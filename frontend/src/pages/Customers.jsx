import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      alert('Failed to load customers');
    }
  };

  const toggleBlacklist = async (id) => {
    try {
      await customerAPI.toggleBlacklist(id);
      loadCustomers();
    } catch (error) {
      alert('Failed to update blacklist status');
    }
  };

  const isLicenseExpiringSoon = (date) => {
    const expiryDate = new Date(date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="text-sm text-gray-600">Customers register on the website</div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rentals</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.id} className={customer.isBlacklisted ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {customer.firstName} {customer.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.licenseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={isLicenseExpiringSoon(customer.licenseExpiryDate) ? 'text-red-600 font-semibold' : ''}>
                    {new Date(customer.licenseExpiryDate).toLocaleDateString()}
                    {isLicenseExpiringSoon(customer.licenseExpiryDate) && ' ⚠️'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{customer._count.reservation}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.isBlacklisted ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">Blacklisted</span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleBlacklist(customer.id)}
                    className={`px-3 py-1 rounded text-xs ${
                      customer.isBlacklisted
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {customer.isBlacklisted ? 'Unblock' : 'Blacklist'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
