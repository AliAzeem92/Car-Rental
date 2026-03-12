import { useState, useEffect } from "react";
import { X, Users, Fuel, Settings, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";

const CarDetailsModal = ({ car, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getImages = () => {
    if (car?.vehicleimage && car.vehicleimage.length > 0) {
      return car.vehicleimage.map((img) => img.imageUrl);
    }
    return [car?.imageUrl || "/src/assert/car.jpg"];
  };

  const images = getImages();

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-[#192336]">Vehicle Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-lg group mb-4">
                <img
                  src={images[selectedImage]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.target.src = "/src/assert/car.jpg";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-[#d9b15c] scale-105"
                          : "border-gray-200 hover:border-[#d9b15c]/60"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h3 className="text-3xl font-bold text-[#192336] mb-2">
                  {car.brand} {car.model}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#d9b15c]/10 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-[#192336]">4.8</span>
                  </div>
                  <span className="text-gray-600">(124 reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#192336]">${car.dailyPrice}</span>
                  <span className="text-xl text-gray-600">/day</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Best daily rate • Free cancellation</p>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-lg font-bold text-[#192336] mb-4">Key Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: "Seats", value: `${car.seats || 4} People` },
                    { icon: Settings, label: "Transmission", value: car.transmission || "Automatic" },
                    { icon: Fuel, label: "Fuel Type", value: car.fuelType || "Petrol" },
                    { icon: Calendar, label: "Year", value: car.year || "2023" },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 bg-[#d9b15c]/10 rounded-lg">
                        <spec.icon className="w-5 h-5 text-[#d9b15c]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{spec.label}</p>
                        <p className="font-semibold text-[#192336]">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {car.features && (
                <div>
                  <h4 className="text-lg font-bold text-[#192336] mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {car.features.split(",").map((feature, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-[#d9b15c]/10 text-[#192336] rounded-full text-sm font-medium border border-[#d9b15c]/30"
                      >
                        {feature.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {car.description && (
                <div>
                  <h4 className="text-lg font-bold text-[#192336] mb-3">About this car</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{car.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;
