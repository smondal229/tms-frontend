import type { ShipmentStatus } from './Shipment';

export interface ShipmentTracking {
  id: string;
  status: ShipmentStatus;
  location: string;
  eventTime: string;
  description?: string | null;
  userId?: string | null;
}

export interface ShipmentTrackingWithUser extends ShipmentTracking {
  createdByName?: string;
}
