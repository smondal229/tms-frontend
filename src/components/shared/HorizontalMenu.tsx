import { ArrowRightStartOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const horizontalItems = ['Overview', 'Shipments', 'Analytics'];

const HorizontalMenu: React.FC = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();

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
      <div className="flex items-center space-x-2 border border-gray-300 rounded-full px-2 py-1">
        <UserCircleIcon className="w-5 h-5 text-gray-700" />
        <span className="text-gray-700">{user?.username}</span>
        <ArrowRightStartOnRectangleIcon
          className="w-6 h-6 mr-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors"
          onClick={() => onLogoutClick()}
        />
      </div>
    </div>
  );
};

export default HorizontalMenu;
