import type { ShipmentDeliveryType, ShipmentStatus } from '../../types/Shipment';

export type PaymentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface AddressInput {
  city: string;
  postalCode: string;
  state: string;
  country: string;
  street?: string;
  contactNumber?: string;
}

export interface DimensionsInput {
  itemWeight?: number | null;
  itemLength?: number | null;
  itemWidth?: number | null;
  itemHeight?: number | null;
  lengthUnit?: string | null;
  weightUnit?: string | null;
}

export interface PaymentMeta {
  transactionId?: string | null;
  provider?: string | null;
  currency?: string | null;
  paymentMethod?: string | null;
  gatewayResponseCode?: string | null;
  status?: PaymentStatus | null;
}

export interface ShipmentUpdateInput {
  shipperName?: string;
  carrierName?: string;
  currentLocation: string;

  trackingNumber?: string;
  rate?: number;
  status?: ShipmentStatus;
  shipmentDeliveryType?: ShipmentDeliveryType;

  itemValue?: number;
  dimensions?: DimensionsInput;

  pickedUpAt?: string;
  deliveredAt?: string;

  isFlagged?: boolean;
}
