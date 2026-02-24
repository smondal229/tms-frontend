import React from 'react';
import type { Shipment, ShipmentStatus as ShipmentStatusType } from '../types/Shipment';
import { ShipmentStatus, type ShipmentFormData } from '../types/ShipmentForm';
import SelectField from './common/SelectField';

interface Props {
  shipment?: Shipment | undefined;
  formData: ShipmentFormData;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Allowed transitions map
 * Mirrors backend validation logic
 */
const STATUS_TRANSITIONS: Record<ShipmentStatusType, ShipmentStatusType[]> = {
  [ShipmentStatus.CREATED]: [ShipmentStatus.PICKED_UP, ShipmentStatus.CANCELLED],
  [ShipmentStatus.PICKED_UP]: [ShipmentStatus.IN_TRANSIT],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.OUT_FOR_DELIVERY],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.CANCELLED]: []
};

const StatusField: React.FC<Props> = ({ shipment, formData, handleChange }) => {
  const currentStatus = shipment?.status;

  /**
   * EDIT MODE
   */
  if (!currentStatus) return null;

  const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">Status</label>

      <SelectField
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full h-11 px-3 rounded-lg border bg-white text-sm
        focus:outline-none focus:ring-2 focus:ring-slate-500/20
        focus:border-slate-500"
      >
        {/* Always show current status */}
        <option value={currentStatus}>{currentStatus.replaceAll('_', ' ')}</option>

        {/* Show only valid next transitions */}
        {allowedNextStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll('_', ' ')}
          </option>
        ))}
      </SelectField>
    </div>
  );
};

export default StatusField;
