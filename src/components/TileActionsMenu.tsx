import React from 'react';

interface TileActionsMenuProps {
  handleActionClick: (actionName: string) => void;
}

const TileActionsMenu: React.FC<TileActionsMenuProps> = ({ handleActionClick }) => {
  return (
    <div className="absolute right-2 top-8 bg-white shadow rounded w-32 z-10">
      <ul>
        <li
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleActionClick('edit')}
        >
          Edit
        </li>
        <li
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleActionClick('flag')}
        >
          Flag
        </li>
        <li
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleActionClick('delete')}
        >
          Delete
        </li>
      </ul>
    </div>
  );
};

export default TileActionsMenu;
