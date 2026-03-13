import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children, size = "max-w-2xl" }) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
      document.body.style.overflow = "hidden";
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShow(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          animate ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        style={{ zIndex: 99998 }}
        onClick={onClose}
      />

      {/* Modal container — centers on md+, bottom-sheet on mobile */}
      <div
        className="fixed inset-0 flex items-end sm:items-center justify-center pointer-events-none"
        style={{ zIndex: 99999 }}
      >
        <div
          className={`
            relative bg-white w-full pointer-events-auto
            transition-all duration-300
            /* Mobile: slide up from bottom, full-width, rounded top corners */
            rounded-t-2xl sm:rounded-xl
            max-h-[92vh] sm:max-h-[90vh]
            flex flex-col
            /* Desktop: use size prop + horizontal margin */
            sm:${size} sm:mx-4
            ${
              animate
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8 sm:translate-y-4 sm:scale-95"
            }
          `}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex-shrink-0">
            {/* Mobile drag indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full sm:hidden" />

            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 pr-4 leading-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default Modal;
