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

  if (!show) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          animate ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        style={{ zIndex: 99999 }}
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[99999]">
        <div
          className={`relative bg-white rounded-xl shadow-2xl ${size} w-full mx-4 pointer-events-auto transition-all duration-300 ${
            animate
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default Modal;
