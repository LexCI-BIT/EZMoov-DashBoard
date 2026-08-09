import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaGavel, FaTruckMoving, FaLocationArrow, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getServices } from '../services/serviceService';
import type { Service } from '../types/service';

// Updated icon sizes to be responsive
const iconMap: { [key: string]: React.ReactNode } = {
  FaBoxOpen: <FaBox className="text-green-600 text-2xl sm:text-3xl lg:text-4xl" />,
  FaGavel: <FaGavel className="text-green-600 text-2xl sm:text-3xl lg:text-4xl" />,
  FaTruckMoving: <FaTruckMoving className="text-green-600 text-2xl sm:text-3xl lg:text-4xl" />,
  FaLocationArrow: <FaLocationArrow className="text-green-600 text-2xl sm:text-3xl lg:text-4xl" />,
};

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error) {
        toast.error('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          {/* Responsive heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">Our Services</h1>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">Choose the perfect ride for your needs.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-green-600 text-3xl sm:text-4xl" />
          </div>
        ) : (
          /* Adjusted grid to show 2 columns on extra small screens, scaling up to 4 */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                /* Reduced padding on smaller devices */
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 lg:p-6 flex flex-col text-center hover:shadow-lg hover:border-green-200 transition-all duration-300"
              >
                <div className="mb-3 sm:mb-4 flex justify-center">
                  {iconMap[service.iconName] || <FaBox className="text-green-600 text-2xl sm:text-3xl lg:text-4xl" />}
                </div>
                
                {/* Responsive text sizes */}
                <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-900 mb-1">{service.title}</h3>
                
                {/* Smaller tag on mobile */}
                <span className="inline-block bg-green-50 text-green-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 rounded-full mb-3 sm:mb-4">
                  {service.tag}
                </span>
                
                {/* Smaller button on mobile */}
                <Link 
                  to={service.path} 
                  className="w-full bg-green-600 text-white hover:bg-green-500 py-2 sm:py-2.5 lg:py-3 rounded-md text-xs sm:text-sm font-medium transition-colors mt-auto"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;