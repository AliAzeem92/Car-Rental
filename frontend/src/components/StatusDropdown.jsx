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
  const dropdownRef = useRef(null);

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

  const handleSelect = (status) => {
    onChange(reservationId, status, type);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`${config[value]?.color || "bg-gray-500"} justify-between text-white px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${width} hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            {config[value]?.label || value}
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      <div
        className={`absolute top-full left-0 mt-1 ${config[value]?.color || "bg-gray-500"} rounded-lg shadow-lg py-1 z-50 ${width} overflow-hidden transition-all duration-200 origin-top ${
          isOpen && !loading
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        {Object.entries(config).map(([key, item]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`w-full text-left px-4 py-2 text-xs text-white hover:bg-black/10 transition whitespace-nowrap ${
              value === key ? "bg-black/20 font-medium" : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusDropdown;
