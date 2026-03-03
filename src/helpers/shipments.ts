import type { Shipment } from '../types/Shipment';

export function formatRate(amount?: number, currency?: string): string {
  if (!amount || amount === undefined) {
    return 'N/A';
  }

  const currencyToUse = currency ?? '';
  const rate = Number(amount.toFixed(2));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyToUse,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rate);
}

export function formatDimensions(shipment?: Shipment): string {
  return shipment?.itemLength && shipment?.itemWidth && shipment?.itemHeight
    ? `${shipment.itemLength} x ${shipment.itemWidth} x ${shipment.itemHeight} ${shipment.lengthUnit ?? ''}`
    : 'N/A';
}

export function formatWeight(shipment?: Shipment): string {
  return shipment?.weightUnit && shipment?.itemWeight
    ? `${shipment.itemWeight} ${shipment.weightUnit}`
    : 'N/A';
}

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) {
    return 'N/A';
  }

  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function formatTrackingStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const normalizePhone = (phone?: string | null) => {
  if (!phone) return null;

  // Remove everything except digits and leading +
  const cleaned = phone
    .trim()
    .replace(/\s+/g, '')
    .replace(/(?!^\+)[^\d]/g, '');

  return cleaned || null;
};

export const getShipmentStatusLabel = (s: Shipment) => {
  switch (s.status) {
    case 'DELIVERED':
      return `Delivered at: ${formatDate(s.deliveredAt)}`;

    case 'PICKED_UP':
      return `Picked up at: ${formatDate(s.pickedUpAt)}`;

    case 'IN_TRANSIT':
      return `Current location: ${s.currentLocation}`;

    default:
      return undefined;
  }
};

export const toDateTimeLocal = (isoString?: string | null) => {
  if (!isoString) return '';

  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const toISOStringSafe = (localDate?: string | null) =>
  localDate ? new Date(localDate).toISOString() : null;

export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
