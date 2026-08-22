import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';

const App: React.FC = () => {
  return (
    <Router>
      <AdminLayout />
    </Router>
  );
};

export default App;