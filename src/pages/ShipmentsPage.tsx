import { useQuery } from '@apollo/client/react';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ShipmentFormModal from '../components/ShipmentFormModal';
import ShipmentGrid from '../components/ShipmentGrid';
import ShipmentTile from '../components/ShipmentTile';
import { GET_SHIPMENTS } from '../graphql/queries';
import type {
  GetShipmentsResponse,
  Shipment,
  ShipmentSortField,
  SortDirection
} from '../types/Shipment';

export interface SortState {
  field: ShipmentSortField;
  direction: SortDirection;
}

const ShipmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as 'grid' | 'tile') ?? 'grid';
  const [retrying, setRetrying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sort, setSort] = useState<SortState | null>({ field: 'ID', direction: 'ASC' });
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const filters = useMemo(() => ({}), []);
  const baseVariables = useMemo(
    () => ({
      pageSize: 20,
      filters,
      sort
    }),
    [filters, sort]
  );
  const lastShipmentRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery<GetShipmentsResponse>(
    GET_SHIPMENTS,
    {
      variables: baseVariables,
      notifyOnNetworkStatusChange: true
    }
  );

  // const [updateShipment, { loading: updating }] = useMutation(UPDATE_SHIPMENT);

  // const observer = useRef<IntersectionObserver | null>(null);
  // const isFetchingMoreRef = useRef(false);

  const setViewMode = (mode: 'grid' | 'tile') => {
    setSearchParams({ view: mode });
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar('Failed to load shipments. Please try again.', {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      setRetrying(true);
      await refetch();
    } finally {
      setRetrying(false);
    }
  };

  const onSelectShipment = (shipment: Shipment) => {
    navigate(`/shipments/${shipment.id}`);
  };

  const handleModalSuccess = async () => {
    // Refetch shipments after successful creation
    await refetch();
  };

  const getButtonClass = (mode: 'grid' | 'tile') =>
    `px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200 ${
      viewMode === mode
        ? '!bg-slate-700 text-white !border-slate-700'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    }`;

  const shipments = data?.getShipments.shipments ?? [];

  const onClickEdit = (shipmentId: string) => {
    setShipmentId(shipmentId);
    setIsModalOpen(true);
  };

  const onCloseModal = () => {
    setShipmentId(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {/* Left side - Add button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 !bg-slate-700 text-white rounded-lg hover:!bg-slate-800 transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-medium">Add Shipment</span>
        </button>

        {/* Right side - View controls */}
        <div className="flex space-x-2 bg-gray-100">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 transition"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 text-slate-600 ${retrying ? 'animate-spin' : ''}`} />
          </button>

          <button onClick={() => setViewMode('grid')} className={getButtonClass('grid')}>
            Grid View
          </button>
          <button onClick={() => setViewMode('tile')} className={getButtonClass('tile')}>
            Tile View
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div ref={lastShipmentRef}>
          <ShipmentGrid
            shipments={shipments}
            onSelect={onSelectShipment}
            loading={loading}
            error={error}
            baseVariables={baseVariables}
            fetchMore={fetchMore}
            endCursor={data?.getShipments.pageInfo.endCursor}
            hasNextPage={data?.getShipments.pageInfo.hasNextPage ?? false}
            onSort={setSort}
            sort={sort}
          />
        </div>
      ) : loading ? (
        <div className="flex justify-center mt-6">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shipments.map((s, index) => {
            if (index === shipments.length - 1) {
              return (
                <div ref={lastShipmentRef} key={s.id}>
                  <ShipmentTile
                    shipment={s}
                    onClickEdit={onClickEdit}
                    onSelect={() => onSelectShipment(s)}
                  />
                </div>
              );
            }
            return (
              <ShipmentTile
                key={s.id}
                shipment={s}
                onSelect={() => onSelectShipment(s)}
                onClickEdit={onClickEdit}
              />
            );
          })}
        </div>
      )}

      {/* Shipment Form Modal */}
      <ShipmentFormModal
        isOpen={isModalOpen}
        onClose={() => onCloseModal()}
        onSuccess={handleModalSuccess}
        mode={shipmentId ? 'edit' : 'create'}
        shipmentId={shipmentId}
      />
    </div>
  );
};

export default ShipmentsPage;
