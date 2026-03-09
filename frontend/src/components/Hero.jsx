import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Search,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useFilter } from "../context/FilterContext";
import carImage from "../assert/car.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { updateFilter } = useFilter();
  const [searchData, setSearchData] = useState({
    pickupDate: "",
    returnDate: "",
    location: "",
  });

  const handleSearch = () => {
    updateFilter("pickupDate", searchData.pickupDate);
    updateFilter("returnDate", searchData.returnDate);
    updateFilter("location", searchData.location);
    navigate("/cars");
  };

  const highlights = [
    { icon: Award, text: "Best Prices" },
    { icon: Clock, text: "24/7 Support" },
    { icon: CheckCircle, text: "Easy Booking" },
  ];

  return (
    <div
      className="relative min-h-screen flex items-center"
      style={{
        backgroundImage: `url(${carImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-32 h-32 border border-[#d9b15c] rounded-full"></div>
        <div className="absolute top-40 right-40 w-16 h-16 border border-[#d9b15c] rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 border border-[#d9b15c] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-white space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Premium <span className="text-[#d9b15c]">Car Rental</span>
            </h1>
            <h2 className="text-3xl lg:text-4xl font-semibold">
              Drive Your <span className="text-[#d9b15c]">Journey</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-lg">
              Rent the{" "}
              <span className="font-semibold text-white">Best Cars</span> at
              Affordable Prices
            </p>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2"
              >
                <item.icon className="h-5 w-5 text-[#d9b15c]" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
