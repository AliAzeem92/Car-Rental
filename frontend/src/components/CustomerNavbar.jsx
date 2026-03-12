import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const activeTab = searchParams.get("tab") || "vehicles";

  const changeTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
              <Car className="h-6 w-6 text-[#d9b15c]" />
            </div>
            <span className="text-xl font-bold text-[#192336]">CAR RENTAL</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => changeTab("vehicles")}
              className={`font-medium transition-colors ${
                activeTab === "vehicles"
                  ? "text-[#004aad] border-b-2 border-[#004aad] pb-1"
                  : "text-[#192336] hover:text-[#004aad]"
              }`}
            >
              Vehicles
            </button>
            {user && (
              <>
                <button
                  onClick={() => changeTab("reservations")}
                  className={`font-medium transition-colors ${
                    activeTab === "reservations"
                      ? "text-[#004aad] border-b-2 border-[#004aad] pb-1"
                      : "text-[#192336] hover:text-[#004aad]"
                  }`}
                >
                  My Reservations
                </button>
                <button
                  onClick={() => changeTab("profile")}
                  className={`font-medium transition-colors ${
                    activeTab === "profile"
                      ? "text-[#004aad] border-b-2 border-[#004aad] pb-1"
                      : "text-[#192336] hover:text-[#004aad]"
                  }`}
                >
                  Profile
                </button>
              </>
            )}
          </div>

          {/* Profile Dropdown or Login */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#004aad] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-[#192336]">
                    {user?.firstName || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => {
                          changeTab("profile");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          changeTab("reservations");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Car className="w-4 h-4" />
                        <span>My Reservations</span>
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#004aad] hover:bg-[#003a8c] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
