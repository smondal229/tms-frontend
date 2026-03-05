import { Bars3Icon, ChartBarIcon, DocumentTextIcon, TruckIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const HamburgerMenu: React.FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = useMemo(
    () =>
      user?.role === 'ADMIN'
        ? [
            { label: 'Dashboard', icon: ChartBarIcon, path: null },
            { label: 'Shipments', icon: TruckIcon, path: '/shipments' },
            { label: 'Users', icon: DocumentTextIcon, path: '/users' }
          ]
        : [
            { label: 'Dashboard', icon: ChartBarIcon, path: null },
            { label: 'Shipments', icon: TruckIcon, path: '/shipments' }
          ],
    [user?.role]
  );
  return (
    <div
      className={`bg-gray-800 text-white min-h-screen transition-all duration-300 ${
        open ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {open && <h2 className="text-xl font-bold">TMS</h2>}

        <Bars3Icon className="w-6 h-6 cursor-pointer shrink-0" onClick={() => setOpen(!open)} />
      </div>

      {/* Menu */}
      <ul className="mt-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path && location.pathname === item.path;

          return (
            <li
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center px-4 py-2.5 rounded-md mx-2 transition-colors duration-200
                ${item.path ? 'cursor-pointer' : 'cursor-default opacity-40'}
                ${isActive ? 'bg-gray-600 text-white' : 'hover:bg-gray-700'}
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {open && <span className="ml-3 whitespace-nowrap text-sm">{item.label}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HamburgerMenu;
