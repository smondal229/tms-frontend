import { InformationCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import type { ShipmentStatus } from '../types/Shipment';

interface Props {
  status?: ShipmentStatus;
  tooltip?: string;
}

const statusConfig: Record<string, { badge: string; dot: string }> = {
  CREATED: { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  PICKED_UP: { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  IN_TRANSIT: { badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  DELIVERED: { badge: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  CANCELLED: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  FAILED: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' }
};

function formatStatusLabel(status?: ShipmentStatus) {
  if (!status) return 'Unknown';
  return status
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ShipmentStatusBadge: React.FC<Props> = ({ status, tooltip }) => {
  const config =
    status && statusConfig[status]
      ? statusConfig[status]
      : { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

  return (
    <span
      className={`inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 text-sm font-medium rounded-full ${config.badge}`}
    >
      {/* dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />

      {/* label */}
      {formatStatusLabel(status)}

      {/* info icon + tooltip */}
      {tooltip && (
        <span className="relative group inline-flex items-center">
          <InformationCircleIcon className="w-4 h-4 opacity-50 cursor-pointer hover:opacity-100 transition-opacity" />
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                           text-xs font-normal text-white bg-gray-900 rounded-lg whitespace-nowrap
                           shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10
                           pointer-events-none"
          >
            {tooltip}
            {/* arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </span>
        </span>
      )}
    </span>
  );
};

export default ShipmentStatusBadge;
