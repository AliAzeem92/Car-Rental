import Navbar from '../components/Navbar';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;