import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Car, Users, Award, Shield } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Car, number: "500+", label: "Premium Vehicles" },
    { icon: Users, number: "10K+", label: "Happy Customers" },
    { icon: Award, number: "15+", label: "Years Experience" },
    { icon: Shield, number: "100%", label: "Insured Fleet" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#192336] via-[#004aad] to-[#192336] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            About <span className="text-[#d9b15c]">Car Rental</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for premium car rental services. We provide
            exceptional vehicles and outstanding customer service for all your
            transportation needs.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d9b15c] rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#192336] mb-2">
                  {stat.number}
                </div>
                <div className="text-[#6d6e71]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#192336] mb-6">
                About Our Car Rental Service
              </h2>
              <div className="space-y-6 text-[#6d6e71]">
                <p className="text-lg">
                  Founded with a passion for providing exceptional
                  transportation solutions, our car rental service has been
                  serving customers for over 15 years. We pride ourselves on
                  maintaining a premium fleet of vehicles and delivering
                  outstanding customer service.
                </p>
                <p className="text-lg">
                  Our mission is to make car rental simple, affordable, and
                  reliable. Whether you need a vehicle for business travel,
                  vacation, or special occasions, we have the perfect car for
                  your needs.
                </p>
                <p className="text-lg">
                  We are committed to providing our customers with clean,
                  well-maintained vehicles, competitive pricing, and 24/7
                  customer support to ensure your journey is smooth and
                  enjoyable.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="About Us"
                className="w-full h-auto rounded-2xl shadow-2xl"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0zMDAgMjAwbC0xMDAtMTAwaDIwMGwtMTAwIDEwMHoiIGZpbGw9IiNkOWIxNWMiLz4KPHRleHQgeD0iMzAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMxOTIzMzYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+QWJvdXQgVXM8L3RleHQ+Cjwvc3ZnPg==";
                }}
              />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#d9b15c] rounded-full opacity-20"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#004aad] rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#192336] mb-4">
              Our Values
            </h2>
            <p className="text-xl text-[#6d6e71]">
              What drives us to provide exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#d9b15c] rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#192336] mb-4">
                Quality
              </h3>
              <p className="text-[#6d6e71]">
                We maintain our fleet to the highest standards, ensuring every
                vehicle is clean, safe, and reliable for your journey.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#004aad] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#192336] mb-4">
                Customer Focus
              </h3>
              <p className="text-[#6d6e71]">
                Our customers are at the heart of everything we do. We strive to
                exceed expectations with personalized service and support.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#192336] mb-4">Trust</h3>
              <p className="text-[#6d6e71]">
                We build lasting relationships through transparency,
                reliability, and consistent delivery of our promises.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Fleet Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#192336] mb-6">
            Premium Fleet
          </h2>
          <p className="text-xl text-[#6d6e71] mb-12 max-w-3xl mx-auto">
            From economy cars to luxury vehicles, our diverse fleet ensures we
            have the perfect vehicle for every occasion and budget. All our cars
            are regularly serviced and thoroughly cleaned between rentals.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {["Economy", "Sedan", "SUV", "Luxury"].map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-[#d9b15c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#192336] mb-2">
                  {category}
                </h3>
                <p className="text-[#6d6e71] text-sm">
                  Perfect for various needs and budgets
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
