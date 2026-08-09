import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaPhoneAlt, FaIdBadge } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-600 p-8 text-center">
            <FaUserCircle className="text-6xl text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">{user?.fullName || 'Guest User'}</h1>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Account Information</h2>
            
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-4 rounded-full">
                <FaIdBadge className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="text-lg text-gray-900 font-medium">{user?.id || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-4 rounded-full">
                <FaPhoneAlt className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg text-gray-900 font-medium">{user?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t mt-8">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 px-4 rounded-md font-medium transition-colors"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;