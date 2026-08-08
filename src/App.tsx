import { useState } from 'react';
import Navbar from './Pages/Navbar';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import Services from './Pages/Services';
import Booking from './Pages/Booking';
import Vehicles from './Pages/Vehicles';
import Finding from './Pages/Finding';
import Tracking from './Pages/Tracking';
import RecentBookings from './Pages/RecentBookings';
import Profile from './Pages/Profile';
import ShiftingExperts from './Pages/ShiftingExperts';

type Screen = 'login' | 'signup' | 'services' | 'booking' | 'vehicles' | 'finding' | 'tracking' | 'bookings' | 'profile' | 'shifting-experts';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setScreen('services');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('login');
  };

  const navigateTo = (nextScreen: string) => {
    setScreen(nextScreen as Screen);
  };

  const renderActiveScreen = () => {
    switch (screen) {
      case 'login':
        return <Login onLogin={handleLoginSuccess} onNavigate={navigateTo} />;
      case 'signup':
        return <SignUp onSignUp={handleLoginSuccess} onNavigate={navigateTo} />;
      case 'services':
        return (
          <Services 
            onSelectService={(serviceName) => {
              setSelectedService(serviceName);
              if (serviceName.trim() === 'Sifting Experts') {
                setScreen('shifting-experts');
              } else {
                setScreen('booking');
              }
            }} 
          />
        );
      case 'booking':
        return (
          <Booking 
            serviceName={selectedService}
            onBack={() => setScreen('services')}
            onSubmitBooking={() => {
              setScreen('vehicles');
            }}
          />
        );
      case 'vehicles':
        return (
          <Vehicles 
            onBack={() => setScreen('booking')}
            onConfirm={() => {
              setScreen('finding');
            }}
          />
        );
      case 'finding':
        return <Finding onFound={() => setScreen('tracking')} />;
      case 'tracking':
        return <Tracking serviceName={selectedService} onBack={() => setScreen('services')} />;
      case 'bookings':
        return <RecentBookings onSelectBooking={() => setScreen('tracking')} />;
      case 'profile':
        return <Profile onLogout={handleLogout} />;
      case 'shifting-experts':
        return (
          <ShiftingExperts 
            onBack={() => setScreen('services')} 
            onSubmit={() => {
              // Complete booking and show finding / confirmation simulation screen
              setScreen('finding');
            }} 
          />
        );
      default:
        return <Login onLogin={handleLoginSuccess} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        activeScreen={screen} 
        onNavigate={navigateTo} 
      />

      {/* Render Current Screen */}
      {renderActiveScreen()}
    </div>
  );
}
