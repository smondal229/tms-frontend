import React, { useState } from 'react';
import { formatRate } from '../helpers/shipments';
import type { Shipment } from '../types/Shipment';
import TileActionsMenu from './TileActionsMenu';

interface ShipmentTileProps {
  shipment: Shipment;
  onSelect: () => void;
  onClickEdit: (shipmentId: string) => void;
}

const ShipmentTile: React.FC<ShipmentTileProps> = ({ shipment, onSelect, onClickEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleFlag = () => {
    setMenuOpen(false);
  };

  const handleActionClick = (action: string) => {
    setMenuOpen(false);

    if (action === 'edit') {
      onClickEdit(shipment.id);
    } else if (action === 'flag') {
      toggleFlag();
    } else if (action === 'delete') {
      // Implement delete logic here
    }

    setMenuOpen(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow relative cursor-pointer" onClick={onSelect}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{shipment.shipperName}</h3>
        <div onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="px-2 py-1 bg-gray-200 rounded">
            ⋮
          </button>
          {menuOpen && <TileActionsMenu handleActionClick={handleActionClick} />}
        </div>
      </div>
      <p className="text-gray-600">{shipment.carrierName}</p>
      <p className="text-gray-600">
        Rate: {formatRate(shipment.rate, shipment.paymentMeta?.currency)}
      </p>
    </div>
  );
};

export default ShipmentTile;
