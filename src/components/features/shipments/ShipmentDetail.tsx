import { useLazyQuery, useQuery } from '@apollo/client/react';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  CubeIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_USER_BY_IDS } from '../../../graphql/auth/queries';
import type { GetUserByIdsResponse } from '../../../graphql/auth/types';
import { GET_SHIPMENT_BY_ID } from '../../../graphql/shipments/queries';
import {
  formatDate,
  formatRate,
  formatTrackingStatus,
  getShipmentStatusLabel
} from '../../../helpers/shipments';
import type { Address, GetShipmentByIdResponse } from '../../../types/Shipment';
import type { ShipmentTrackingWithUser } from '../../../types/ShipmentTracking';
import type { User } from '../../../types/User';
import CopyButton from '../../ui/CopyButton';
import ShipmentStatusBadge from '../shipments/ShipmentStatusBadge';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children
}) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold text-sm uppercase tracking-wider">
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: React.ReactNode; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs uppercase font-medium mb-1 inline-flex items-center">
      {label}
    </p>
    <p className="text-gray-800 font-medium text-sm">{value ?? '—'}</p>
  </div>
);

const trackingStatusConfig: Record<string, { color: string; dot: string }> = {
  CREATED: { color: 'text-gray-500', dot: 'bg-gray-400' },
  PICKED_UP: { color: 'text-blue-600', dot: 'bg-blue-500' },
  IN_TRANSIT: { color: 'text-yellow-600', dot: 'bg-yellow-500' },
  OUT_FOR_DELIVERY: { color: 'text-purple-600', dot: 'bg-purple-500' },
  DELIVERED: { color: 'text-green-600', dot: 'bg-green-500' },
  CANCELLED: { color: 'text-red-600', dot: 'bg-red-500' }
};

const ShipmentDetail: React.FC = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[] | null>(null);

  const { data, loading, error } = useQuery<GetShipmentByIdResponse>(GET_SHIPMENT_BY_ID, {
    variables: { id: shipmentId },
    skip: !shipmentId
  });

  const [getByUserIds] = useLazyQuery<GetUserByIdsResponse, { userIds: string[] }>(GET_USER_BY_IDS);

  const shipment = data?.getShipmentById;

  useEffect(() => {
    if (shipment) {
      // @ts-ignore
      const userIds: string[] =
        shipment.tracking?.filter((t) => !!t.userId).map((t) => t.userId) ?? [];
      if (userIds.length > 0) {
        getByUserIds({ variables: { userIds } }).then((res) => {
          setUsers(res.data?.getByUserIds ?? []);
        });
      }
    }
  }, [shipment, getByUserIds]);

  const sortedTracking: ShipmentTrackingWithUser[] = useMemo(() => {
    const idUserMap: Record<string, User> = (users ?? []).reduce(
      (acc: Record<string, User>, user: User) => {
        if (!user.id) return acc;
        acc[user.id] = user;
        return acc;
      },
      {}
    );

    return [...(shipment?.tracking ?? [])]
      .map((s) => ({
        ...s,
        createdByName: s.userId ? idUserMap[s.userId]?.username : undefined
      }))
      .sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime());
  }, [shipment?.tracking, users]);

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.postalCode}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="bg-white p-6 rounded shadow text-center text-gray-400">
        Shipment not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{shipment.shipperName}</h2>
            <Field
              label={
                <span className="inline-flex items-center gap-1">
                  Tracking Number <CopyButton value={shipment.trackingNumber} />
                </span>
              }
              value={<span className="font-mono">{shipment.trackingNumber}</span>}
            />
          </div>
          <ShipmentStatusBadge
            status={shipment.status}
            tooltip={getShipmentStatusLabel(shipment)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipment Info */}
        <Section title="Shipment Info" icon={<TruckIcon className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Carrier" value={shipment.carrierName} />
            <Field label="Delivery Type" value={shipment.shipmentDeliveryType} />
            <Field label="Pickup Location" value={formatAddress(shipment.pickupAddress)} />
            <Field label="Delivery Location" value={formatAddress(shipment.deliveryAddress)} />
            <Field label="Current Location" value={shipment.currentLocation} />
            <Field label="Created At" value={formatDate(shipment.createdAt)} />
            <Field label="Last Updated" value={formatDate(shipment.updatedAt)} />
          </div>
        </Section>

        {/* Financials */}
        <Section title="Financials" icon={<CreditCardIcon className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field
              label="Rate"
              value={
                <span className="tabular-nums">
                  {formatRate(shipment.rate, shipment.paymentMeta?.currency)}
                </span>
              }
            />
            <Field
              label="Item Value"
              value={
                <span className="tabular-nums">
                  {formatRate(shipment.itemValue, shipment.paymentMeta?.currency)}
                </span>
              }
            />
          </div>

          {shipment.paymentMeta && (
            <>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-gray-400 text-xs uppercase font-medium mb-3">Payment</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Provider" value={shipment.paymentMeta.provider} />
                  <Field label="Method" value={shipment.paymentMeta.paymentMethod} />
                  <Field label="Status" value={shipment.paymentMeta.status} />
                  <Field
                    label={
                      <span className="inline-flex items-center gap-1">
                        Transaction ID <CopyButton value={shipment.paymentMeta.transactionId} />
                      </span>
                    }
                    value={
                      <span className="font-mono text-xs truncate block">
                        {shipment.paymentMeta.transactionId}
                      </span>
                    }
                  />
                </div>
              </div>
            </>
          )}
        </Section>

        {/* Dimensions */}
        <Section title="Package Dimensions" icon={<CubeIcon className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-4">
            <Field label={`Length (${shipment.lengthUnit ?? 'CM'})`} value={shipment.itemLength} />
            <Field label={`Width (${shipment.lengthUnit ?? 'CM'})`} value={shipment.itemWidth} />
            <Field label={`Height (${shipment.lengthUnit ?? 'CM'})`} value={shipment.itemHeight} />
            <Field label={`Weight (${shipment.weightUnit ?? 'KG'})`} value={shipment.itemWeight} />
          </div>
        </Section>

        {/* Tracking Timeline */}
        {sortedTracking.length > 0 && (
          <Section title="Tracking History" icon={<MapPinIcon className="w-4 h-4" />}>
            <div className="relative max-h-96 overflow-y-auto">
              {sortedTracking.map((event: ShipmentTrackingWithUser, index: number) => {
                const config = trackingStatusConfig[event.status] ?? {
                  color: 'text-gray-500',
                  dot: 'bg-gray-400'
                };
                const isLast = index === sortedTracking.length - 1;

                return (
                  <div key={event.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${config.dot}`} />
                      {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                    </div>

                    {/* Content */}
                    <div className={`pb-4 ${isLast ? '' : ''}`}>
                      <p className={`text-sm font-semibold ${config.color}`}>
                        {formatTrackingStatus(event.status)}
                      </p>
                      <p className="text-gray-500 text-xs">{event.location}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatDate(event.eventTime)}</p>
                      {event.createdByName && (
                        <p className="text-gray-400 text-xs mt-0.5 italic">
                          Updated by {event.createdByName}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-gray-500 text-xs mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default ShipmentDetail;
