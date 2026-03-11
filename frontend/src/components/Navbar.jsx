import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Car, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthenticated = !!user;
  const userRole = user?.role;

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { name: "Home", path: "/" },
      { name: "Our Cars", path: "/cars" },
    ];

    if (isAuthenticated && userRole === "CUSTOMER") {
      baseItems.push({ name: "Reservations", path: "/reservations" });
      baseItems.push({ name: "Profile", path: "/profile" });
    }

    baseItems.push({ name: "About", path: "/about" });
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-[#192336]/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-[#004aad]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-[#d9b15c]/10 rounded-lg group-hover:bg-[#d9b15c]/20 transition-colors">
              <Car className="h-8 w-8 text-[#d9b15c]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">CAR RENTAL</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    relative px-3 py-2 text-base font-medium transition-all duration-300
                    ${location.pathname === item.path
                      ? "text-[#d9b15c] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d9b15c] after:rounded-full"
                      : "text-gray-300 hover:text-white hover:scale-105"}
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-[#d9b15c] hover:bg-[#c4a052] text-[#192336] font-semibold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#004aad]/20 transition-colors"
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide down with blur */}
      {isOpen && (
        <div className="md:hidden bg-[#192336]/95 backdrop-blur-lg border-t border-[#004aad]/30 animate-fadeIn">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-5 py-3 rounded-xl text-lg font-medium transition-all
                  ${location.pathname === item.path
                    ? "bg-[#004aad]/30 text-[#d9b15c]"
                    : "text-gray-300 hover:bg-[#004aad]/20 hover:text-white"}
                `}
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold mt-4 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-[#d9b15c] hover:bg-[#c4a052] text-[#192336] py-3 rounded-xl font-semibold mt-4 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;