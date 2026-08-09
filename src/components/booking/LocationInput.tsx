import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCircle, FaTimes } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { getPlacePredictions } from '../../services/apiService';
import type { LocationInfo } from '../../types/booking';

// Renamed 'type' to 'inputType' to avoid React HTML attribute conflicts
interface Props {
  inputType: 'pickup' | 'drop';
  placeholder: string;
  value: LocationInfo;
}

const LocationInput: React.FC<Props> = ({ inputType, placeholder, value }) => {
  const { setActiveInput, setPickup, setDrop } = useBooking();
  const [inputValue, setInputValue] = useState(value.address);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(value.address);
  }, [value.address]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputValue.length > 2) {
        const results = await getPlacePredictions(inputValue);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handleSelect = (address: string) => {
    const mockCoords = { lat: 28.6139 + Math.random(), lng: 77.2090 + Math.random() };
    const locInfo = { address, coordinates: mockCoords };
    
    if (inputType === 'pickup') setPickup(locInfo);
    if (inputType === 'drop') setDrop(locInfo);
    
    setSuggestions([]);
    setIsFocused(false);
    setActiveInput(null);
  };

  return (
    <div className="relative flex-1">
      <div className={`flex items-center gap-3 p-3 border rounded-lg ${isFocused ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
        {inputType === 'pickup' ? <FaCircle className="text-green-600 text-xs" /> : <FaMapMarkerAlt className="text-red-500" />}
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => { setIsFocused(true); setActiveInput(inputType); }}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
        />
        {inputValue && (
          <FaTimes 
            className="text-gray-400 hover:text-gray-600 cursor-pointer" 
            onClick={() => { setInputValue(''); handleSelect(''); }} 
          />
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-100 rounded-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onMouseDown={() => handleSelect(s)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-50"
            >
              <FaMapMarkerAlt className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-700">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;