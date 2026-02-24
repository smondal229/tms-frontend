import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef } from 'react';
import { formatDate, formatRate, getShipmentStatusLabel } from '../helpers/shipments';
import type { SortState } from '../pages/ShipmentsPage';
import type { Shipment, ShipmentSortField } from '../types/Shipment';
import ShipmentStatusBadge from './ShipmentStatusBadge';

interface ShipmentGridProps {
  shipments: Shipment[];
  onSelect: (shipment: Shipment) => void;
  fetchMore: (options: { variables: any }) => Promise<any>;
  hasNextPage: boolean;
  onSort: (sort: SortState | null) => void;
  sort: SortState | null;
  loading?: boolean;
  error?: Error | null;
  endCursor?: string | null;
  baseVariables: {
    pageSize: number;
    filters?: any;
    sort?: any;
  };
}

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  align?: 'left' | 'right';
  sortKey?: ShipmentSortField;
  render: (s: Shipment) => React.ReactNode;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'id',
    sortKey: 'ID',
    label: 'ID',
    sortable: true,
    align: 'left',
    render: (s) => <span className="text-sm font-medium text-gray-400">#{s.id}</span>
  },
  {
    key: 'shipperName',
    sortKey: 'SHIPPER',
    label: 'Shipper',
    sortable: true,
    align: 'left',
    render: (s) => <span className="font-medium text-gray-900">{s.shipperName}</span>
  },
  {
    key: 'carrierName',
    label: 'Carrier',
    sortKey: 'CARRIER',
    sortable: true,
    align: 'left',
    render: (s) => <span className="text-gray-600">{s.carrierName}</span>
  },
  {
    key: 'trackingNumber',
    label: 'Tracking',
    sortable: false,
    align: 'left',
    render: (s) => <span className="font-mono text-sm text-gray-700">{s.trackingNumber}</span>
  },
  {
    key: 'pickupLocation',
    label: 'Pickup Location',
    sortable: false,
    align: 'left',
    render: (s) => <span className="text-gray-600">{s.pickupAddress.city}</span>
  },
  {
    key: 'deliveryLocation',
    label: 'Delivery Location',
    sortable: false,
    align: 'left',
    render: (s) => <span className="text-gray-600">{s.deliveryAddress.city}</span>
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    sortKey: 'STATUS',
    align: 'left',
    render: (s) => (
      <ShipmentStatusBadge
        status={s.status}
        tooltip={getShipmentStatusLabel(s)}
      />
    )
  },
  {
    key: 'rate',
    label: 'Rate',
    sortable: true,
    sortKey: 'RATE',
    align: 'right',
    render: (s) => (
      <span className="tabular-nums font-medium text-gray-900">
        {formatRate(s.rate, s.paymentMeta?.currency)}
      </span>
    )
  },
  {
    key: 'itemValue',
    label: 'Item Value',
    sortable: true,
    sortKey: 'ITEM_VALUE',
    align: 'right',
    render: (s) => (
      <span className="tabular-nums font-medium text-gray-900">
        {formatRate(s.itemValue, s.paymentMeta?.currency)}
      </span>
    )
  },
  {
    key: 'updatedAt',
    label: 'Last Updated',
    sortable: true,
    sortKey: 'UPDATED_AT',
    align: 'right',
    render: (s) => (
      <span className="text-sm text-gray-400 whitespace-nowrap">{formatDate(s.updatedAt)}</span>
    )
  }
];

const ShipmentGrid: React.FC<ShipmentGridProps> = ({
  shipments,
  onSelect,
  loading,
  error,
  hasNextPage,
  fetchMore,
  baseVariables,
  endCursor,
  onSort,
  sort
}) => {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const lastShipmentRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  const handleSort = (col: ColumnConfig) => {
    if (!col.sortable || !col.sortKey) return;
    onSort(
      sort?.field === col.sortKey
        ? { field: sort.field, direction: sort.direction === 'ASC' ? 'DESC' : 'ASC' }
        : { field: col.sortKey, direction: 'ASC' }
    );
  };

  useEffect(() => {
    const root = scrollRootRef.current;
    const sentinel = lastShipmentRef.current;

    if (!root || !sentinel) return;

    observerRef.current?.disconnect();

    // 🚨 Do NOT observe if content doesn't overflow
    if (root.scrollHeight <= root.clientHeight) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingRef.current && endCursor) {
          isFetchingRef.current = true;

          try {
            await fetchMore({
              variables: {
                ...baseVariables,
                after: endCursor
              }
            });
          } finally {
            isFetchingRef.current = false;
          }
        }
      },
      {
        root,
        threshold: 1
      }
    );

    observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [shipments.length, endCursor, hasNextPage, fetchMore, baseVariables]);

  return (
    <div ref={scrollRootRef} className="overflow-auto bg-white shadow rounded max-h-[600px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50
                  ${col.align === 'right' ? 'text-right' : 'text-left'}
                  ${col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col">
                      {sort?.direction === 'ASC' && sort?.field === col.sortKey && (
                        <ArrowUpIcon className={`w-3 h-3 -mb-1 text-gray-900`} />
                      )}
                      {sort?.direction === 'DESC' && sort?.field === col.sortKey && (
                        <ArrowDownIcon
                          className={`w-3 h-3 ${sort?.field === col.sortKey && sort?.direction === 'DESC' ? 'text-gray-900' : 'text-gray-300'}`}
                        />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect(s)}
            >
              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.render(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={lastShipmentRef} className="h-8" />
    </div>
  );
};

export default ShipmentGrid;
