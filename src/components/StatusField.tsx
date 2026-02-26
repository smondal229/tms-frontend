import React from 'react';
import type { Shipment, ShipmentStatus as ShipmentStatusType } from '../types/Shipment';
import { ShipmentStatus, type ShipmentFormData } from '../types/ShipmentForm';
import SelectField from './common/SelectField';

interface Props {
  shipment?: Shipment;
  formData: ShipmentFormData;
  disabled?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  tooltip?: string;
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

const StatusField: React.FC<Props> = ({ shipment, formData, disabled, handleChange, tooltip }) => {
  const currentStatus = shipment?.status;

  if (!currentStatus) return null;

  const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  return (
    <div title={tooltip} className="space-y-1.5">
      <SelectField
        label="Status"
        name="status"
        value={formData.status}
        disabled={disabled}
        onChange={handleChange}
        tooltip={disabled ? tooltip : undefined}
      >
        {Object.values(ShipmentStatus).map((status) => {
          const isCurrent = status === currentStatus;
          const isAllowed = allowedNextStatuses.includes(status);

          return (
            <option key={status} value={status} disabled={!isCurrent && !isAllowed}>
              {status.replaceAll('_', ' ')}
            </option>
          );
        })}
      </SelectField>
    </div>
  );
};

export default StatusField;
