import type { ShipmentStatus } from './Shipment';

export interface ShipmentTracking {
  id: string;
  status: ShipmentStatus;
  location: string;
  eventTime: string;
  description?: string | null;
}
