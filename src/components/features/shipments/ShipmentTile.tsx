import { ArrowRightIcon, BanknotesIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { enqueueSnackbar, type SnackbarKey } from 'notistack';
import React, { useState } from 'react';
import { formatRate } from '../helpers/shipments';
import type { Shipment } from '../types/Shipment';
import TileActionsMenu from './TileActionsMenu';

interface ShipmentTileProps {
  shipment: Shipment;
  onSelect: () => void;
  onClickEdit: (shipmentId: string) => void;
  onClickFlag: (shipmentId: string, isFlagged: boolean, key: SnackbarKey) => Promise<void>;
  onClickDelete: (shipmentId: string, key: SnackbarKey) => Promise<void>;
}

const ShipmentTile: React.FC<ShipmentTileProps> = ({
  shipment,
  onSelect,
  onClickEdit,
  onClickFlag,
  onClickDelete
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleFlag = (isFlagged: boolean) => {
    const key = enqueueSnackbar(
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-sm text-white-700">Processing...</span>
      </div>,
      { persist: true }
    );
    onClickFlag(shipment.id, isFlagged, key);
    setMenuOpen(false);
  };

  const onDeleteShipment = () => {
    const key = enqueueSnackbar(
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-sm text-white-700">Processing...</span>
      </div>,
      { persist: true }
    );
    onClickDelete(shipment.id, key);
    setMenuOpen(false);
  };

  const handleActionClick = (action: string) => {
    setMenuOpen(false);

    if (action === 'edit') {
      onClickEdit(shipment.id);
    } else if (action === 'flag') {
      toggleFlag(!shipment.isFlagged);
    } else if (action === 'delete') {
      onDeleteShipment();
    }
  };

  return (
    <div
      className={`
      relative rounded-xl p-4 bg-white
      transition-all duration-200
      shadow-sm hover:shadow-md
      ${shipment.isFlagged ? 'before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-red-500 before:rounded-r' : ''}
      cursor-pointer
      hover:shadow-md hover:-translate-y-0.5 transition
    `}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {/* Red Dot Indicator */}
          {shipment.isFlagged && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}

          <h3 className="font-semibold text-gray-900 text-lg">{shipment.shipperName}</h3>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
            px-2 py-1 rounded-lg
            text-gray-500
            hover:bg-gray-100
            transition-colors
          "
          >
            ⋮
          </button>

          {menuOpen && (
            <TileActionsMenu isFlagged={shipment.isFlagged} handleActionClick={handleActionClick} />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TruckIcon className="text-gray-400 h-5 w-5" />
        <p className="text-sm text-gray-500 mt-1">{shipment.carrierName}</p>
      </div>

      <div className="flex items-center gap-2">
        <BanknotesIcon className="text-gray-400 h-5 w-5" />
        <p className="text-sm text-gray-600 mt-1">
          {formatRate(shipment.rate, shipment.paymentMeta?.currency)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <MapPinIcon className="h-5 w-5 text-gray-400" />
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-gray-500">
            {shipment.pickupAddress.city || 'NA'}
          </p>
          <ArrowRightIcon className="text-gray-400 h-3 w-3" />
          <p className="text-sm text-gray-500 font-semibold">
            {shipment.deliveryAddress.city || 'NA'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTile;
