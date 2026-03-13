import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Car,
  Users,
  Plus,
  UserPlus,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { vehicleAPI, reservationAPI } from "../services/api";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalReservations: 0,
    upcomingPickups: 0,
    currentlyRented: 0,
    totalVehicles: 0,
  });
  const [upcomingList, setUpcomingList] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehicles, reservations] = await Promise.all([
        vehicleAPI.getAll(),
        reservationAPI.getAll(),
      ]);

      const now = new Date();
      const upcoming =
        reservations.data
          ?.filter(
            (r) =>
              new Date(r.startDate) > now &&
              ["PENDING", "CONFIRMED"].includes(r.status)
          )
          .slice(0, 4) || [];

      setStats({
        totalReservations: reservations.data?.length || 0,
        upcomingPickups: upcoming.length,
        currentlyRented:
          reservations.data?.filter((r) => r.status === "ONGOING").length || 0,
        totalVehicles: vehicles.data?.length || 0,
      });

      setUpcomingList(upcoming);
      setRecentReservations(reservations.data?.slice(0, 4) || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const statusColors = {
    CONFIRMED: "bg-green-100 text-green-700 border border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    ONGOING: "bg-blue-100 text-blue-700 border border-blue-200",
    COMPLETED: "bg-gray-100 text-gray-700 border border-gray-200",
    CANCELLED: "bg-red-100 text-red-700 border border-red-200",
  };

  const statCards = [
    {
      label: t("dashboard.totalReservations"),
      value: stats.totalReservations.toLocaleString(),
      icon: Calendar,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconBg: "bg-blue-500",
      border: "border-blue-100",
    },
    {
      label: t("dashboard.upcomingPickups"),
      value: stats.upcomingPickups,
      icon: CalendarDays,
      bg: "bg-purple-50 hover:bg-purple-100",
      iconBg: "bg-purple-500",
      border: "border-purple-100",
    },
    {
      label: t("dashboard.currentlyRented"),
      value: stats.currentlyRented,
      icon: Car,
      bg: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-500",
      border: "border-green-100",
    },
    {
      label: t("dashboard.totalVehicles"),
      value: stats.totalVehicles,
      icon: Car,
      bg: "bg-yellow-50 hover:bg-yellow-100",
      iconBg: "bg-yellow-500",
      border: "border-yellow-100",
    },
  ];

  const quickActions = [
    {
      label: t("dashboard.createReservation"),
      icon: Users,
      bg: "bg-yellow-50 hover:bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/admin/bookings"),
    },
    {
      label: t("buttons.addVehicle"),
      icon: Car,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/admin/cars"),
    },
    {
      label: t("dashboard.viewCalendar"),
      icon: Calendar,
      bg: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/admin/planning"),
    },
    {
      label: t("navbar.maintenance"),
      icon: AlertTriangle,
      bg: "bg-red-50 hover:bg-red-100",
      iconColor: "text-red-600",
      onClick: () => navigate("/admin/maintenance"),
    },
    {
      label: t("buttons.addCustomer"),
      icon: UserPlus,
      bg: "bg-indigo-50 hover:bg-indigo-100",
      iconColor: "text-indigo-600",
      onClick: () => navigate("/admin/customers"),
    },
    {
      label: t("dashboard.fleetStatus"),
      icon: CheckCircle,
      bg: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      onClick: undefined,
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {t("dashboard.title")}
        </h1>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          {t("buttons.createNew")}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`${card.bg} rounded-xl p-4 sm:p-6 border ${card.border} stat-card cursor-default`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`${card.iconBg} p-2.5 sm:p-3 rounded-xl flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{card.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-800 leading-tight">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions + Upcoming Pickups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`${action.bg} p-4 sm:p-6 rounded-xl transition-colors text-center card-hover`}
                >
                  <Icon
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${action.iconColor} mx-auto mb-2`}
                  />
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-snug">
                    {action.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
            {t("dashboard.upcomingPickups")}
          </h2>
          <div className="space-y-2">
            {/* Header row — hidden on very small screens */}
            <div className="hidden sm:grid grid-cols-3 gap-3 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-100">
              <div>{t("common.date")}</div>
              <div>{t("common.customer")}</div>
              <div>{t("common.vehicle")}</div>
            </div>

            {upcomingList.length > 0 ? (
              upcomingList.map((res) => (
                <div
                  key={res.id}
                  className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-3 text-sm py-2.5 hover:bg-gray-50 rounded-lg px-2 transition-colors"
                >
                  <div className="text-gray-800 font-medium text-xs sm:text-sm">
                    {formatDate(res.startDate)}
                    <span className="text-gray-500 ml-1 sm:hidden">
                      · {res.user?.firstName}
                    </span>
                  </div>
                  <div className="hidden sm:block text-gray-800 text-xs sm:text-sm">
                    {res.user?.firstName || "N/A"} {res.user?.lastName || ""}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm">
                    {res.vehicle?.brand} {res.vehicle?.model}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-6 text-center">
                {t("sidebar.noReservationsYet")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Reservations ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {t("dashboard.recentReservations")}
          </h2>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {t("buttons.viewAll")}
          </button>
        </div>

        <div className="table-responsive">
          <table className="w-full" style={{ minWidth: "500px" }}>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                  {t("common.customer")}
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                  {t("common.vehicle")}
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                  {t("common.return")}
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">
                  {t("reservations.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentReservations.length > 0 ? (
                recentReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {res.user?.firstName || "N/A"} {res.user?.lastName || ""}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">
                      {res.vehicle?.brand} {res.vehicle?.model}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(res.endDate)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          statusColors[res.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    {t("reservations.noReservations")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
