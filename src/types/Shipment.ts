/* =========================
  ENUMS
========================= */

import type { LengthUnit, WeightUnit } from './ShipmentForm';
import type { ShipmentTracking } from './ShipmentTracking';

export type CarrierName = 'FEDEX' | 'DHL' | 'UPS' | 'BLUEDART' | 'DELHIVERY';

export type ShipmentStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type ShipmentDeliveryType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export type ShipmentSortField =
  | 'ID'
  | 'RATE'
  | 'SHIPPER'
  | 'CARRIER'
  | 'UPDATED_AT'
  | 'STATUS'
  | 'ITEM_VALUE';
export type SortDirection = 'ASC' | 'DESC';

/* =========================
  OBJECT TYPES
========================= */

export interface PaymentMeta {
  transactionId: string;
  provider?: string;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  gatewayResponseCode?: string;
}

export interface Address {
  city: string;
  postalCode: string;
  state: string;
  country: string;
  street?: string;
  contactNumber?: string;
}

export interface Shipment {
  id: string;
  shipperName: string;
  carrierName: CarrierName;

  pickupAddress: Address;
  deliveryAddress: Address;

  trackingNumber: string;

  status: ShipmentStatus;
  shipmentDeliveryType: ShipmentDeliveryType;

  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;

  pickedUpAt?: string;
  deliveredAt?: string;

  rate?: number;
  itemValue?: number;

  itemLength?: number;
  itemWidth?: number;
  itemHeight?: number;
  itemWeight?: number;

  weightUnit?: WeightUnit;
  lengthUnit?: LengthUnit;

  currentLocation?: string;

  paymentMeta?: PaymentMeta;
  tracking?: ShipmentTracking[];
}

/* =========================
  PAGINATION
========================= */

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface ShipmentOutput {
  shipments: Shipment[];
  pageInfo: PageInfo;
}

/* =========================
  QUERY RESPONSE
========================= */

export interface GetShipmentsResponse {
  getShipments: ShipmentOutput;
}

export interface GetShipmentByIdResponse {
  getShipmentById: Shipment;
}

/* =========================
  FILTERS & SORT
========================= */

export interface FloatRange {
  min?: number;
  max?: number;
}

export interface ShipmentFilter {
  carrier?: string[];
  status?: ShipmentStatus[];
  shipmentDeliveryType?: ShipmentDeliveryType[];
  trackingNumber?: string;
  shipperName?: string;
  rate?: FloatRange;
}

export interface ShipmentSort {
  field?: ShipmentSortField;
  direction?: SortDirection;
}

export interface GetShipmentsQuery {
  getShipments: {
    shipments: Shipment[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface GetAllFilterOptionsResponse {
  getAllFilterOptions: {
    carriers: {
      value: string;
      label: string;
    }[];
    statuses: {
      value: string;
      label: string;
    }[];
    shipmentDeliveryTypes: {
      value: string;
      label: string;
    }[];
  };
}
