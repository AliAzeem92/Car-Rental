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
    { icon: MapPin, title: "Unlimited KM", description: "No Extra Charge", bgColor: "bg-[#d9b15c]" },
    { icon: Shield, title: "Full Insurance", description: "Included", bgColor: "bg-green-600" },
    { icon: Phone, title: "24/7 Roadside", description: "Assistance", bgColor: "bg-blue-600" },
    { icon: Clock, title: "Fast Pickup", description: "Anywhere", bgColor: "bg-purple-600" },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Our Cars", path: "/cars" },
    { name: "Reservations", path: "/reservations" },
    { name: "About", path: "/about" },
  ];

  const services = ["Car Rental", "Long Term Rental", "Airport Transfer", "Corporate Rental"];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-500" },
    { icon: Twitter, href: "#", color: "hover:text-sky-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-500" },
    { icon: Linkedin, href: "#", color: "hover:text-blue-600" },
  ];

  return (
    <footer className="bg-white">
      {/* Features Bar */}
      <div className="border-t border-gray-200 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-[#192336] text-lg">{feature.title}</h3>
                <p className="text-[#6d6e71] text-sm mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-[#192336] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Car className="h-10 w-10 text-[#d9b15c]" />
                <span className="text-2xl font-bold">CAR RENTAL</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Premium vehicles, exceptional service — your journey starts here.
              </p>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  info@carrental.com
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" />
                  +1 800 123 4567
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {quickLinks.map((link, i) => (
                  <li key={i}>
                    <Link to={link.path} className="text-gray-300 hover:text-[#d9b15c] transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6">Our Services</h3>
              <ul className="space-y-4">
                {services.map((service, i) => (
                  <li key={i} className="text-gray-300">{service}</li>
                ))}
              </ul>
            </div>

            {/* Social & Address */}
            <div>
              <h3 className="text-xl font-bold mb-6">Follow Us</h3>
              <div className="flex space-x-5 mb-8">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className={`text-gray-300 transition-colors text-2xl ${social.color}`}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
              <div className="text-gray-300 text-sm space-y-2">
                <p>123 Premium Drive</p>
                <p>Faisalabad, Punjab</p>
                <p className="mt-4">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0f1419] text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left md:flex md:justify-between md:items-center text-sm">
          <p>© {new Date().getFullYear()} Car Rental. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;