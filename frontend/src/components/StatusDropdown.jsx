import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { RESERVATION_STATUS, VEHICLE_STATUS, PAYMENT_STATUS } from '../utils/constants';

const StatusDropdown = ({
  value,
  onChange,
  reservationId,
  type = "status",
  width,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const config = type === "payment" ? PAYMENT_STATUS : type === "vehicle" ? VEHICLE_STATUS : RESERVATION_STATUS;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if dropdown should open upward to avoid clipping
  const handleOpen = () => {
    if (loading) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const optionCount = Object.keys(config).length;
      const estimatedMenuHeight = optionCount * 34 + 8;
      setDropUp(spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (status) => {
    onChange(reservationId, status, type);
    setIsOpen(false);
  };

  const menuOptions = Object.entries(config);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        disabled={loading}
        className={`${config[value]?.color || "bg-gray-500"} justify-between text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${width || "min-w-[100px]"} hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap`}
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <span className="truncate">{config[value]?.label || value}</span>
            <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {/* Dropdown menu */}
      <div
        className={`absolute z-[9999] rounded-lg shadow-xl overflow-hidden transition-all duration-150 origin-top
          ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}
          left-0
          ${isOpen && !loading ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
        `}
        style={{ minWidth: "120px" }}
      >
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
          {menuOptions.map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap flex items-center gap-2
                ${value === key ? "bg-gray-100" : ""}
              `}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
              <span className="text-gray-800">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusDropdown;
