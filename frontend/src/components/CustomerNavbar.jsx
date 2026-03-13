import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Car, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const CustomerNavbar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const activeTab = searchParams.get("tab") || "vehicles";

  const changeTab = (tab) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { key: "vehicles", label: t("navbar.vehicles") },
    ...(user
      ? [
          { key: "reservations", label: t("navbar.myReservations") },
          { key: "profile", label: t("navbar.profile") },
        ]
      : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
              <Car className="h-5 w-5 sm:h-6 sm:w-6 text-[#d9b15c]" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#192336] truncate">
              {t("navbar.carRental")}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => changeTab(link.key)}
                className={`font-medium transition-colors text-sm lg:text-base whitespace-nowrap ${
                  activeTab === link.key
                    ? "text-[#004aad] border-b-2 border-[#004aad] pb-1"
                    : "text-[#192336] hover:text-[#004aad]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#004aad] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[#192336] text-sm max-w-[100px] truncate">
                      {user?.firstName || t("navbar.user")}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-slideDown">
                        <button
                          onClick={() => {
                            changeTab("profile");
                            setShowDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left text-sm"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{t("navbar.profile")}</span>
                        </button>
                        <button
                          onClick={() => {
                            changeTab("reservations");
                            setShowDropdown(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left text-sm"
                        >
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>{t("navbar.myReservations")}</span>
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left text-red-600 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t("navbar.logout")}</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-[#004aad] hover:bg-[#003a8c] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                >
                  {t("navbar.login")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile: right controls */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#192336]" />
              ) : (
                <Menu className="w-6 h-6 text-[#192336]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl animate-slide-in flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#d9b15c]/10 rounded-lg">
                  <Car className="h-5 w-5 text-[#d9b15c]" />
                </div>
                <span className="font-bold text-[#192336]">
                  {t("navbar.carRental")}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* User info (if logged in) */}
            {user && (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#004aad] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#192336] truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={() => changeTab(link.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
                    activeTab === link.key
                      ? "bg-[#004aad]/10 text-[#004aad]"
                      : "text-[#192336] hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-gray-100">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {t("navbar.logout")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#004aad] hover:bg-[#003a8c] text-white px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  {t("navbar.login")}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default CustomerNavbar;
