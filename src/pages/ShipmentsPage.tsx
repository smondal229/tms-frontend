import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowPathIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { closeSnackbar, useSnackbar, type SnackbarKey } from 'notistack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FilterPopover from '../components/FilterPopover';
import ShipmentFormModal from '../components/ShipmentFormModal';
import ShipmentGrid from '../components/ShipmentGrid';
import ShipmentTile from '../components/ShipmentTile';
import { DELETE_SHIPMENT, FLAG_SHIPMENT } from '../graphql/mutations';
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

const PAGE_SIZE = 20;
const INITIAL_FILTERS = {
  carrier: [] as string[],
  trackingNumber: '',
  status: [] as string[],
  shipmentDeliveryType: [] as string[],
  shipperName: '',
  rate: { min: null as number | null, max: null as number | null },
  isFlagged: null as boolean | null
};

const ShipmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as 'grid' | 'tile') ?? 'grid';
  const [retrying, setRetrying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isFetchingMore = useRef(false);
  const [sort, setSort] = useState<SortState | null>({ field: 'ID', direction: 'ASC' });
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  // const filters = useMemo(() => ({}), []);
  const baseVariables = useMemo(
    () => ({
      pageSize: PAGE_SIZE,
      filters,
      sort
    }),
    [filters, sort]
  );

  const activeCount = useMemo(() => {
    return Object.values(filters).reduce((count, val) => {
      if (val == null) return count;

      if (Array.isArray(val)) {
        return val.length > 0 ? count + 1 : count;
      }

      if (typeof val === 'object') {
        if ('min' in val || 'max' in val) {
          return val.min !== null || val.max !== null ? count + 1 : count;
        }
        return count;
      }

      return val ? count + 1 : count;
    }, 0);
  }, [filters]);

  const lastShipmentRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery<GetShipmentsResponse>(
    GET_SHIPMENTS,
    {
      variables: baseVariables,
      notifyOnNetworkStatusChange: true
    }
  );
  const isFetchingRef = useRef(false);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [deleteShipment] = useMutation(DELETE_SHIPMENT);
  const [flagShipment] = useMutation(FLAG_SHIPMENT);
  const hasNextPage = useMemo(() => data?.getShipments.pageInfo.hasNextPage ?? false, [data]);
  const endCursor = data?.getShipments.pageInfo.endCursor;
  // const observer = useRef<IntersectionObserver | null>(null);
  // const isFetchingMoreRef = useRef(false);

  const setViewMode = (mode: 'grid' | 'tile') => {
    setSearchParams({ view: mode });
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(t('shipment_loading_failed'), {
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

  useEffect(() => {
    const root = scrollRootRef.current;
    const sentinel = lastShipmentRef.current;
    if (!root || !sentinel) return;

    observerRef.current?.disconnect();

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
        root: null,
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [shipments.length, endCursor, hasNextPage, fetchMore, baseVariables]);

  const onClickFlag = async (
    shipmentId: string,
    newFlagState: boolean,
    snackbarKey: SnackbarKey
  ): Promise<void> => {
    if (!shipmentId) return;
    console.log('onClickFlag', shipmentId, newFlagState);
    try {
      await flagShipment({
        variables: {
          id: Number(shipmentId),
          flagged: Boolean(newFlagState)
        },
        update: (cache) => {
          const shipmentCacheId = cache.identify({
            __typename: 'Shipment',
            id: Number(shipmentId)
          });

          cache.modify({
            id: shipmentCacheId,
            fields: {
              isFlagged() {
                return Boolean(newFlagState);
              }
            }
          });
        }
      });
      closeSnackbar(snackbarKey);
      enqueueSnackbar(t('shipment_flagged_success'), {
        variant: 'success',
        autoHideDuration: 3000
      });
    } catch (err) {
      closeSnackbar(snackbarKey);
      enqueueSnackbar(t('shipment_flag_failed'), {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  const onClickDelete = async (shipmentId: string, snackbarKey: SnackbarKey): Promise<void> => {
    if (!shipmentId) return;

    try {
      await deleteShipment({
        variables: { id: shipmentId },
        update: (cache) => {
          cache.evict({ id: cache.identify({ __typename: 'Shipment', id: shipmentId }) });
          cache.gc();
        }
      });
      closeSnackbar(snackbarKey);
      enqueueSnackbar(t('shipment_deleted_success'), {
        variant: 'success',
        autoHideDuration: 3000
      });
    } catch (err) {
      closeSnackbar(snackbarKey);
      enqueueSnackbar(t('shipment_delete_failed'), {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
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
          <span className="font-medium">{t('add_shipment')}</span>
        </button>

        {/* Right side - View controls */}
        <div className="flex space-x-2 bg-gray-100">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-md border !bg-white-300 border-slate-200 hover:!bg-slate-300 transition"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 text-slate-600 ${retrying ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                border rounded-lg shadow-sm transition
                ${
                  open
                    ? '!bg-slate-800 text-white !border-slate-800'
                    : '!bg-white text-gray-700 !border-gray-300 hover:!bg-gray-50'
                }`}
            >
              <FunnelIcon className="h-4 w-4" />

              <span>{t('filters')}</span>

              {activeCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full
          ${open ? '!bg-white text-slate-800' : '!bg-slate-800 text-white'}`}
                >
                  {activeCount}
                </span>
              )}
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-[420px] bg-white border border-gray-200
                 rounded-xl shadow-lg z-50"
              >
                <FilterPopover
                  open={open}
                  onClose={() => setOpen(false)}
                  appliedFilters={filters}
                  onApply={(newFilters) => {
                    setFilters(newFilters);
                    setOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          <button onClick={() => setViewMode('grid')} className={getButtonClass('grid')}>
            {t('grid_view')}
          </button>
          <button onClick={() => setViewMode('tile')} className={getButtonClass('tile')}>
            {t('tile_view')}
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
      ) : (
        <>
          <div
            ref={scrollRootRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {shipments.map((s, index) => {
              if (index === shipments.length - 1) {
                return (
                  <div ref={lastShipmentRef} key={s.id}>
                    <ShipmentTile
                      shipment={s}
                      onClickEdit={onClickEdit}
                      onSelect={() => onSelectShipment(s)}
                      onClickFlag={onClickFlag}
                      onClickDelete={onClickDelete}
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
                  onClickFlag={onClickFlag}
                  onClickDelete={onClickDelete}
                />
              );
            })}
          </div>
          {(loading || isFetchingMore.current) && (
            <div className="w-full flex justify-center mt-6 transition-all duration-200">
              <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
            </div>
          )}
        </>
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
