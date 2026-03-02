import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ value, onChange, options, showColor = true, width = 'w-auto' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${showColor ? currentOption.color : 'bg-gray-100 text-gray-800 border border-gray-300'} justify-between ${showColor ? 'text-white' : ''} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${width} hover:opacity-90 transition`}
      >
        {currentOption.label}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      <div className={`absolute top-full left-0 mt-1 ${showColor ? currentOption.color : 'bg-white border border-gray-200'} rounded-lg shadow-lg py-1 z-50 ${width} overflow-hidden transition-all duration-200 origin-top ${
        isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
      }`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`w-full text-left px-4 py-2 text-sm ${showColor ? 'text-white hover:bg-black/10' : 'text-gray-800 hover:bg-gray-100'} transition whitespace-nowrap ${
              value === option.value ? 'bg-black/20 font-medium' : ''
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
