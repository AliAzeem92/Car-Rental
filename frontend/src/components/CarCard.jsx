import { Star, Users, Settings, Fuel } from "lucide-react";

const CarCard = ({ car, onBook, showRating = true }) => {
  const {
    id,
    make,
    model,
    category,
    seats,
    transmission,
    fuelType,
    pricePerDay,
    deposit,
    imageUrl,
    rating = 4.8,
  } = car;

  const handleBookNow = () => {
    onBook(car);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Car Image */}
      <div className="relative">
        <img
          src={imageUrl || "/api/placeholder/400/250"}
          alt={`${make} ${model}`}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0yMDAgMTI1bC02MC02MGgxMjBsLTYwIDYweiIgZmlsbD0iI2Q5YjE1YyIvPgo8dGV4dCB4PSIyMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzE5MjMzNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5DYXIgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";
          }}
        />

        {/* Rating Badge */}
        {showRating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}

        {/* Best Choice Badge */}
        {rating >= 4.5 && (
          <div className="absolute top-4 left-4 bg-[#d9b15c] text-white px-3 py-1 rounded-full text-sm font-medium">
            Best Choice
          </div>
        )}
      </div>

      {/* Car Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#192336] mb-1">
            {make} {model}
          </h3>
          <p className="text-[#6d6e71] text-sm">
            {fuelType} • {category}
          </p>
        </div>

        {/* Specifications */}
        <div className="flex items-center justify-between mb-4 text-sm text-[#6d6e71]">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{seats} Seats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span>{fuelType}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-[#192336]">
              ${pricePerDay}
              <span className="text-base font-normal text-[#6d6e71]">/day</span>
            </div>
            <div className="text-sm text-[#6d6e71]">${deposit} Deposit</div>
          </div>
          <button
            onClick={handleBookNow}
            className="bg-[#d9b15c] hover:bg-[#c4a052] text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
