import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const horizontalItems = ['Overview', 'Shipments', 'Analytics'];

const HorizontalMenu: React.FC = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();

  const onLogoutClick = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const success = await logout();

    if (!success) {
      enqueueSnackbar('Logout failed', { variant: 'error', autoHideDuration: 3000 });
    }

    setLoggingOut(false);
  };

  return (
    <div className="bg-white shadow px-4 py-2 flex space-x-4 justify-between">
      <div className="flex space-x-4">
        {horizontalItems.map((item) => (
          <button key={item} className="text-gray-700 font-medium hover:text-blue-600">
            {item}
          </button>
        ))}
      </div>
      <button
        disabled={loggingOut}
        className="text-gray-700 font-medium hover:text-blue-600"
        onClick={() => onLogoutClick()}
      >
        Logout
      </button>
    </div>
  );
};

export default HorizontalMenu;
