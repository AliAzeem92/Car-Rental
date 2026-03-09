import {
  Car,
  MapPin,
  Shield,
  Phone,
  Clock,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const features = [
    {
      icon: MapPin,
      title: "Unlimited KM",
      description: "No Extra Charge",
      bgColor: "bg-[#d9b15c]",
    },
    {
      icon: Shield,
      title: "Full Insurance",
      description: "Included",
      bgColor: "bg-green-500",
    },
    {
      icon: Phone,
      title: "24/7 Roadside",
      description: "Assistance",
      bgColor: "bg-blue-500",
    },
    {
      icon: Clock,
      title: "Free",
      description: "Up to Hours",
      bgColor: "bg-purple-500",
    },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Our Cars", path: "/cars" },
    { name: "Reservations", path: "/reservations" },
    { name: "About", path: "/about" },
  ];

  const services = [
    "Car Rental",
    "Long Term Rental",
    "Airport Transfer",
    "Corporate Rental",
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-600" },
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-700" },
  ];

  return (
    <footer className="bg-white">
      {/* Feature Highlights Section */}
      <div className="py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 
                    divide-y md:divide-y-0 md:divide-x 
                    divide-gray-200"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 group transition-all duration-300 hover:bg-gray-50"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#d9b15c] border border-[#5e594d] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-white " />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#192336]">
                    {feature.title}
                  </h3>
                  <p className="text-[#6d6e71] text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-[#192336] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-8 w-8 text-[#d9b15c]" />
                <span className="text-xl font-bold">CAR RENTAL</span>
              </div>
              <p className="text-gray-300 mb-4 text-sm">
                Your trusted partner for premium car rental services. We provide
                exceptional vehicles and outstanding customer service for all
                your transportation needs.
              </p>
              <div className="flex items-center space-x-2 text-gray-300 mb-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@carrental.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+1 800 123 4567</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-[#d9b15c] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index} className="text-gray-300 text-sm">
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4 mb-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`text-gray-300 ${social.color} transition-colors`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <div className="text-gray-300 text-sm">
                <p className="mb-1">123 Business Street</p>
                <p className="mb-1">City, State 12345</p>
                <p>Open 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0f1419] text-gray-400 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 Car Rental. All rights reserved.</p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
