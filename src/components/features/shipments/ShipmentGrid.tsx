import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronUpDownIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { enqueueSnackbar, type SnackbarKey } from 'notistack';
import React, { useEffect, useRef } from 'react';
import { formatDate, formatRate, getShipmentStatusLabel } from '../helpers/shipments';
import type { SortState } from '../pages/ShipmentsPage';
import type { Shipment, ShipmentSortField } from '../types/Shipment';
import ShipmentStatusBadge from './ShipmentStatusBadge';
import TileActionsMenu from './TileActionsMenu';

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
  setCurrentShipment: (shipment: Shipment | null) => void;
  currentShipment: Shipment | null;
  onClickEdit: (shipmentId: string) => void;
  onClickFlag: (shipmentId: string, isFlagged: boolean, snackbarKey: SnackbarKey) => Promise<void>;
  onClickDelete: (shipmentId: string, snackbarKey: SnackbarKey) => Promise<void>;
}

interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  align?: 'left' | 'right';
  sortKey?: ShipmentSortField;
  className?: string;
  render: (s: Shipment | null) => React.ReactNode;
}

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
  sort,
  setCurrentShipment,
  currentShipment,
  onClickEdit,
  onClickFlag,
  onClickDelete
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

  const COLUMNS: ColumnConfig[] = [
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
      label: 'Pickup',
      sortable: false,
      align: 'left',
      className: 'max-w-[130px] truncate',
      render: (s) => <span className="text-gray-600">{s.pickupAddress.city}</span>
    },
    {
      key: 'deliveryLocation',
      label: 'Delivery',
      sortable: false,
      align: 'left',
      className: 'max-w-[130px] truncate',
      render: (s) => <span className="text-gray-600">{s.deliveryAddress.city}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortKey: 'STATUS',
      className: 'max-w-[150px] whitespace-nowrap',
      align: 'left',
      render: (s) => <ShipmentStatusBadge status={s.status} tooltip={getShipmentStatusLabel(s)} />
    },
    {
      key: 'shipmentDeliveryType',
      label: 'Type',
      sortable: false,
      className: 'max-w-[125px] truncate',
      render: (s) => {
        const type = s.shipmentDeliveryType;

        const styles = {
          STANDARD: 'bg-slate-100 text-slate-700',
          EXPRESS: 'bg-blue-100 text-blue-700',
          SAME_DAY: 'bg-emerald-100 text-emerald-700'
        };

        return type ? (
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              styles[type] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {type.replace('_', ' ')}
          </span>
        ) : (
          '-'
        );
      }
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
          {formatRate(s?.itemValue, s?.paymentMeta?.currency)}
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
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      className: 'relative',
      render: (s) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              if (currentShipment?.id === s?.id) setCurrentShipment(null);
              else setCurrentShipment(s);
            }}
            onContextMenu={(event) => event.preventDefault()}
            className="
            px-2 py-1 rounded-lg
            text-gray-700
            hover:!bg-gray-100
            transition-colors
          "
          >
            <EllipsisHorizontalIcon className="h-5 w-4" />
          </button>
          {currentShipment && currentShipment.id === s?.id && (
            <TileActionsMenu isFlagged={s.isFlagged} handleActionClick={handleActionClick} />
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      setCurrentShipment(null);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  const toggleFlag = (isFlagged: boolean) => {
    if (!currentShipment) return;

    const key = enqueueSnackbar(
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-sm text-white-700">Processing...</span>
      </div>,
      { persist: true }
    );
    onClickFlag(currentShipment?.id, isFlagged, key);
    setCurrentShipment(null);
  };

  const onDeleteShipment = () => {
    if (!currentShipment) return;
    const key = enqueueSnackbar(
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-sm text-white-700">Processing...</span>
      </div>,
      { persist: true }
    );
    onClickDelete(currentShipment?.id, key);
    setCurrentShipment(null);
  };

  const handleActionClick = (action: string) => {
    if (!currentShipment) return;
    setCurrentShipment(null);

    if (action === 'edit') {
      onClickEdit(currentShipment.id);
    } else if (action === 'flag') {
      toggleFlag(!currentShipment.isFlagged);
    } else if (action === 'delete') {
      onDeleteShipment();
    }
  };

  return (
    <div ref={scrollRootRef} className="overflow-auto bg-white shadow rounded max-h-[600px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="!bg-slate-800 sticky top-0 z-10">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider bg-slate-700 text-white
                  ${col.align === 'right' ? 'text-right' : 'text-left'}
                  ${col.sortable ? 'cursor-pointer hover:!bg-slate-800 select-none' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex flex-col">
                      {sort?.direction === 'ASC' && sort?.field === col.sortKey && (
                        <ArrowUpIcon className={`w-3 h-3 -mb-1 text-white-900`} />
                      )}
                      {sort?.direction === 'DESC' && sort?.field === col.sortKey && (
                        <ArrowDownIcon
                          className={`w-3 h-3 ${sort?.field === col.sortKey && sort?.direction === 'DESC' ? 'text-white-900' : 'text-white-300'}`}
                        />
                      )}
                      {sort?.field !== col.sortKey && (
                        <ChevronUpDownIcon className={`w-4 h-4 text-white-600`} />
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
                  className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className ?? ''}`}
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
