import { useQuery } from '@apollo/client/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_ALL_FILTER_OPTIONS } from '../graphql/queries';
import type { GetAllFilterOptionsResponse } from '../types/Shipment';
import RangeSlider from './common/RangeSlider';

type ShipmentFilterState = {
  carrier: string[];
  trackingNumber: string;
  status: string[];
  shipmentDeliveryType: string[];
  shipperName: string;
  rate: { min: number | null; max: number | null };
  isFlagged: boolean | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  appliedFilters: ShipmentFilterState;
  onApply: (filters: ShipmentFilterState) => void;
}

const ClearButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <span
      onClick={onClick}
      className="px-2 py-1 mt-1
        uppercase
        text-xs font-medium
        text-slate-500
        border border-slate-200
        rounded-md
        hover:bg-slate-50
        hover:text-slate-700
        transition-all duration-150 cursor-pointer"
    >
      {t('clear')}
    </span>
  );
};

const FilterPopover = ({ open, onClose, appliedFilters, onApply }: Props) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(appliedFilters);
  const [retrying, setRetrying] = useState(false);
  const { data, loading, error, refetch } =
    useQuery<GetAllFilterOptionsResponse>(GET_ALL_FILTER_OPTIONS);
  const { carriers, statuses, shipmentDeliveryTypes } = data?.getAllFilterOptions ?? {
    carriers: [],
    statuses: [],
    shipmentDeliveryTypes: []
  };

  const initialState: ShipmentFilterState = useMemo(
    () => ({
      carrier: [],
      trackingNumber: '',
      status: [],
      shipmentDeliveryType: [],
      shipperName: '',
      rate: { min: null, max: null },
      isFlagged: null
    }),
    []
  );

  const actionsDisabled = useMemo(() => loading || !!error, [loading, error]);

  useEffect(() => {
    if (open) {
      setDraft(appliedFilters);
    }
  }, [open, appliedFilters]);

  const handleClearAll = () => {
    setDraft(initialState);
    onApply(initialState);
    onClose();
  };

  const handleRefresh = async () => {
    try {
      setRetrying(true);
      await refetch();
    } finally {
      setRetrying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="flex flex-col max-h-[420px]">
      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="flex justify-between items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 gap-2">
          <strong className="font-bold">{t('error')}!</strong> {t('filter_fetch_error')}
          <a
            onClick={handleRefresh}
            className="p-2 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 transition cursor-pointer"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 text-slate-600 ${retrying ? 'animate-spin' : ''}`} />
          </a>
        </div>
      )}

      {data && (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div className="h-8 flex flex-wrap justify-between items-center">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isFlagged === true}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    isFlagged: e.target.checked ? true : null
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800"
              />
              {t('flagged_shipment')}
            </label>

            {draft.isFlagged !== null && (
              <ClearButton
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    isFlagged: null
                  }))
                }
              />
            )}
          </div>

          <div className="border-t border-slate-200" />
          {/* SEARCH SECTION */}
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {t('search')}
            </p>

            {/* Shipper Name */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">{t('shipper_name')}</label>
                {draft.shipperName && (
                  <ClearButton onClick={() => setDraft({ ...draft, shipperName: '' })} />
                )}
              </div>
              <input
                value={draft.shipperName}
                placeholder={t('shipper_name')}
                onChange={(e) => setDraft({ ...draft, shipperName: e.target.value })}
                className="w-full h-10 mt-2 px-3 rounded-lg
                   border border-slate-200
                   text-sm
                   focus:outline-none
                   focus:ring-2 focus:ring-slate-800/10
                   focus:border-slate-400"
              />
            </div>

            {/* Tracking Number */}
            <div>
              <div className="h-8 flex flex-wrap gap-1 justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t('tracking_number')}</label>
                {draft.trackingNumber && (
                  <ClearButton onClick={() => setDraft({ ...draft, trackingNumber: '' })} />
                )}
              </div>
              <input
                value={draft.trackingNumber}
                placeholder="Tracking number"
                onChange={(e) => setDraft({ ...draft, trackingNumber: e.target.value })}
                className="w-full h-10 mt-2 px-3 rounded-lg
                   border border-slate-200
                   text-sm
                   focus:outline-none
                   focus:ring-2 focus:ring-slate-800/10
                   focus:border-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* STATUS SECTION */}
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {t('shipment_details')}
            </p>

            <div className="border-t border-slate-200" />

            {/* Carrier */}
            <div>
              <div className="h-8 flex flex-wrap gap-1 justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t('carrier')}</label>
                {draft.carrier.length > 0 && (
                  <ClearButton onClick={() => setDraft({ ...draft, carrier: [] })} />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {carriers.map((carrier) => {
                  const selected = draft.carrier.includes(carrier.value);
                  return (
                    <button
                      key={carrier.value}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({
                          ...prev,
                          carrier: selected
                            ? prev.carrier.filter((c) => c !== carrier.value)
                            : [...prev.carrier, carrier.value]
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition
                ${
                  selected
                    ? '!bg-slate-900 text-white !border-slate-900'
                    : '!bg-white text-slate-600 !border-slate-200 hover:!bg-slate-50'
                }`}
                    >
                      {carrier.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200" />

            {/* Status */}
            <div>
              <div className="h-8 flex flex-wrap gap-1 justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t('status')}</label>
                {draft.status.length > 0 && (
                  <ClearButton onClick={() => setDraft({ ...draft, status: [] })} />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const selected = draft.status.includes(status.value);
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({
                          ...prev,
                          status: selected
                            ? prev.status.filter((s) => s !== status.value)
                            : [...prev.status, status.value]
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition
                ${
                  selected
                    ? '!bg-slate-900 text-white !border-slate-900'
                    : '!bg-white text-slate-600 !border-slate-200 hover:!bg-slate-50'
                }`}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200" />

            {/* Delivery Type */}
            <div>
              <div className="h-8 flex flex-wrap justify-between gap-1 items-center">
                <label className="text-sm font-medium text-slate-700">{t('delivery_type')}</label>
                {draft.shipmentDeliveryType.length > 0 && (
                  <ClearButton onClick={() => setDraft({ ...draft, shipmentDeliveryType: [] })} />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {shipmentDeliveryTypes.map((type) => {
                  const selected = draft.shipmentDeliveryType.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({
                          ...prev,
                          shipmentDeliveryType: selected
                            ? prev.shipmentDeliveryType.filter((t) => t !== type.value)
                            : [...prev.shipmentDeliveryType, type.value]
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition
                ${
                  selected
                    ? '!bg-slate-900 text-white !border-slate-900'
                    : '!bg-white text-slate-600 !border-slate-200 hover:!bg-slate-50'
                }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* RATE SECTION */}
          <div>
            <div className="h-8 flex flex-wrap gap-1 items-center">
              <p className="flex-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {t('rate')}
              </p>
              {(draft.rate.min !== null || draft.rate.max !== null) && (
                <ClearButton
                  onClick={() => setDraft({ ...draft, rate: { min: null, max: null } })}
                />
              )}
            </div>

            <div className="mt-4">
              <RangeSlider
                min={0}
                max={100000}
                value={draft.rate}
                onChange={(val) => setDraft({ ...draft, rate: val })}
                formatValue={(v) => `$${v}`}
              />
            </div>
          </div>
        </div>
      )}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-xl">
        <button
          type="button"
          onClick={handleClearAll}
          disabled={actionsDisabled}
          className={`text-sm font-medium text-slate-500 transition ${actionsDisabled ? 'cursor-not-allowed' : 'cursor-pointer-auto hover:text-slate-700'}`}
        >
          {t('clear_all')}
        </button>

        <button
          type="button"
          onClick={() => onApply(draft)}
          disabled={actionsDisabled}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:!bg-slate-800 transition ${actionsDisabled ? '!bg-slate-500' : '!bg-slate-900'}`}
        >
          {t('apply_filters')}
        </button>
      </div>
    </div>
  );
};

export default FilterPopover;
