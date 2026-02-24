export const ShipmentStatus = {
  CREATED: 'CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const ShipmentDeliveryType = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
  SAME_DAY: 'SAME_DAY'
} as const;
export type ShipmentDeliveryType = (typeof ShipmentDeliveryType)[keyof typeof ShipmentDeliveryType];

export const LengthUnit = {
  CM: 'CM',
  M: 'M',
  FT: 'FT',
  IN: 'IN'
} as const;
export type LengthUnit = (typeof LengthUnit)[keyof typeof LengthUnit];

export const WeightUnit = {
  GM: 'GM',
  KG: 'KG',
  LB: 'LB',
  MG: 'MG'
} as const;
export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

export interface DimensionsInput {
  itemWeight?: number | null;
  itemLength?: number | null;
  itemWidth?: number | null;
  itemHeight?: number | null;
  lengthUnit?: LengthUnit | null;
  weightUnit?: WeightUnit | null;
}

export interface ShipmentCreateInput {
  shipperName: string;
  carrierName: string;
  pickupAddress: {
    city: string;
    postalCode: string;
    state: string;
    country: string;
    street?: string;
    contactNumber?: string;
  };
  deliveryAddress: {
    city: string;
    postalCode: string;
    state: string;
    country: string;
    street?: string;
    contactNumber?: string;
  };
  trackingNumber?: string | null;
  rate?: number | null;
  status?: ShipmentStatus | null;
  shipmentDeliveryType: ShipmentDeliveryType;
  itemValue?: number | null;
  dimensions?: DimensionsInput | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
}

export interface ShipmentFormData extends ShipmentCreateInput {
  id?: string; // For edit mode
  currentLocation?: string | null; // For tracking updates
}
