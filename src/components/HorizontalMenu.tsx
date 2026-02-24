import React from 'react';

const horizontalItems = ['Overview', 'Shipments', 'Analytics'];

const HorizontalMenu: React.FC = () => {
  return (
    <div className="bg-white shadow px-4 py-2 flex space-x-4">
      {horizontalItems.map((item) => (
        <button key={item} className="text-gray-700 font-medium hover:text-blue-600">
          {item}
        </button>
      ))}
    </div>
  );
};

export default HorizontalMenu;
