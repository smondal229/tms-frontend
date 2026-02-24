import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HamburgerMenu from './components/HamburgerMenu';
import HorizontalMenu from './components/HorizontalMenu';
import ShipmentDetail from './components/ShipmentDetail';
import ShipmentsPage from './pages/ShipmentsPage';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <div className="flex h-screen">
          <HamburgerMenu />
          <div className="flex-1 flex flex-col">
            <HorizontalMenu />
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <Routes>
                <Route path="/shipments" element={<ShipmentsPage />} />
                <Route path="/shipments/:shipmentId" element={<ShipmentDetail />} />
                <Route path="/" element={<Navigate to="/shipments" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </>
  );
};

export default App;
