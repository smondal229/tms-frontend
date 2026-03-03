import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const horizontalItems = ['Overview', 'Shipments', 'Analytics'];

const HorizontalMenu: React.FC = () => {
  const { logout } = useAuth();

  const onLogoutClick = async () => {
    const success = await logout();

    if (!success) {
      enqueueSnackbar('Logout failed', { variant: 'error', autoHideDuration: 3000 });
    }
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
        className="text-gray-700 font-medium hover:text-blue-600"
        onClick={() => onLogoutClick()}
      >
        Logout
      </button>
    </div>
  );
};

export default HorizontalMenu;
