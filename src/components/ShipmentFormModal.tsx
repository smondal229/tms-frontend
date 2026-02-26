import { useMutation, useQuery } from '@apollo/client/react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { City, Country, State } from 'country-state-city';
import { useSnackbar } from 'notistack';
import { postcodeValidator } from 'postcode-validator';
import React, { useEffect, useMemo, useState } from 'react';
import { CarrierName } from '../common/constant';
import { CREATE_SHIPMENT, UPDATE_SHIPMENT } from '../graphql/mutations';
import { SHIPMENT_FORM_GET_SHIPMENT_BY_ID } from '../graphql/queries';
import type { AddressInput } from '../graphql/types';
import { normalizePhone, toDateTimeLocal, toISOStringSafe } from '../helpers/shipments';
import type { GetShipmentByIdResponse, Shipment } from '../types/Shipment';
import type { ShipmentFormData } from '../types/ShipmentForm';
import {
  LengthUnit,
  ShipmentDeliveryType,
  ShipmentStatus,
  WeightUnit
} from '../types/ShipmentForm';
import AddressSection from './AddressSection';
import Field from './common/Field';
import SearchSelect from './common/SearchSelect';
import SelectField from './common/SelectField';
import StatusField from './StatusField';

interface ShipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  shipmentId?: string | null;
  mode?: 'create' | 'edit';
}

const ShipmentFormModal: React.FC<ShipmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shipmentId,
  mode = 'create'
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createShipment, { loading: creating }] = useMutation(CREATE_SHIPMENT);
  const {
    data: shipmentData,
    loading: shipmentDetailLoading,
    error: shipmentDetailError,
    refetch: refetchShipment
  } = useQuery<GetShipmentByIdResponse>(SHIPMENT_FORM_GET_SHIPMENT_BY_ID, {
    variables: { id: shipmentId },
    skip: !shipmentId
  });
  const shipment = shipmentData?.getShipmentById;
  const [updateShipment, { loading: updating }] = useMutation(UPDATE_SHIPMENT);
  const citiesList = useMemo(() => {
    return City.getAllCities().map((c) => c.name);
  }, [shipment]);

  const initialFormData: ShipmentFormData = {
    shipperName: '',
    carrierName: '',
    pickupAddress: {
      city: '',
      postalCode: '',
      state: '',
      country: '',
      street: undefined,
      contactNumber: undefined
    },
    deliveryAddress: {
      city: '',
      postalCode: '',
      state: '',
      country: '',
      street: undefined,
      contactNumber: undefined
    },
    trackingNumber: '',
    rate: null,
    status: ShipmentStatus.CREATED,
    shipmentDeliveryType: ShipmentDeliveryType.STANDARD,
    itemValue: null,
    dimensions: {
      itemWeight: null,
      itemLength: null,
      itemWidth: null,
      itemHeight: null,
      lengthUnit: LengthUnit.CM,
      weightUnit: WeightUnit.KG
    },
    pickedUpAt: '',
    deliveredAt: ''
  };

  const [formData, setFormData] = useState<ShipmentFormData>(initialFormData);
  const [errors, setErrors] = useState<any>({});
  const disabledOnPickedUp = useMemo(() => {
    return mode === 'edit' && shipment?.status !== ShipmentStatus.CREATED;
  }, [mode, shipment?.status]);

  const disabledOnDelivered = useMemo(() => {
    return mode === 'edit' && shipment?.status === ShipmentStatus.DELIVERED;
  }, [mode, shipment?.status]);

  useEffect(() => {
    if (shipment && mode === 'edit') {
      setFormData(mapShipmentToFormData(shipment));
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [shipment, mode, isOpen]);

  const updateField = (name: string, value: any, type?: string) => {
    if (name.startsWith('dimensions.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [key]: type === 'number' ? (value ? parseFloat(value) : null) : value
        }
      }));
    } else if (name.startsWith('pickupAddress.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        pickupAddress: {
          ...prev.pickupAddress,
          [key]: value
        }
      }));
    } else if (name.startsWith('deliveryAddress.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [key]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? (value ? parseFloat(value) : null) : value
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    updateField(name, value, type);
  };

  const validateAddress = (
    address: AddressInput,
    prefix: string,
    errors: Record<string, string>
  ) => {
    if (!address?.city?.trim()) errors[`${prefix}.city`] = 'City is required';
    if (!address?.state?.trim()) errors[`${prefix}.state`] = 'State is required';
    if (!address?.country?.trim()) errors[`${prefix}.country`] = 'Country is required';
    if (!address?.street?.trim()) errors[`${prefix}.street`] = 'Street is required';

    if (!address?.postalCode?.trim()) {
      errors[`${prefix}.postalCode`] = 'Postal Code is required';
    } else {
      try {
        const isValid = postcodeValidator(
          address.postalCode.trim(),
          address.country?.toUpperCase()
        );

        if (!isValid) {
          errors[`${prefix}.postalCode`] = 'Invalid Postal Code for selected country';
        }
      } catch (err) {
        if (err.message.includes('Invalid country code')) {
          errors[`${prefix}.postalCode`] = 'Country not supported at this time';
        }
      }
    }

    const addressContact = address.contactNumber?.trim?.() || '';

    if (addressContact?.trim()) {
      const normalized = normalizePhone(addressContact);

      if (!normalized || !/^\+?\d{10,15}$/.test(normalized)) {
        errors[`${prefix}.contactNumber`] = 'Enter a valid contact number';
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.shipperName?.trim()) newErrors.shipperName = 'Required';
    if (!formData.carrierName) newErrors.carrierName = 'Required';
    if (!formData.shipmentDeliveryType) newErrors.shipmentDeliveryType = 'Required';
    if (formData.itemValue && formData.rate && formData.itemValue < formData.rate)
      newErrors.itemValue = 'Item value must be greater than rate';

    if (formData.pickedUpAt && formData.deliveredAt && formData.pickedUpAt > formData.deliveredAt) {
      newErrors.deliveredAt = 'Delivered date must be after picked up date';
    }

    if (mode === 'edit' && !formData.currentLocation) {
      newErrors.currentLocation = 'Required';
    }

    validateAddress(formData.pickupAddress, 'pickupAddress', newErrors);
    validateAddress(formData.deliveryAddress, 'deliveryAddress', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapShipmentAddressToFormData = (
    shipment: Shipment,
    prefix: 'pickupAddress' | 'deliveryAddress'
  ): AddressInput => {
    const addressVal = shipment[prefix];
    if (addressVal == null) {
      return {
        contactNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
    }

    const countryIsoCode = Country.getAllCountries().find(
      (c) => c.name === addressVal?.country
    )?.isoCode;
    const stateIsoCode = State.getStatesOfCountry(countryIsoCode || '').find(
      (s) => s.name === addressVal?.state
    )?.isoCode;
    const city = City.getCitiesOfState(countryIsoCode || '', stateIsoCode || '').find(
      (c) => c.name === addressVal?.city
    )?.name;

    return {
      ...addressVal,
      country: countryIsoCode || '',
      state: stateIsoCode || '',
      city: city || ''
    };
  };

  const mapShipmentToFormData = (shipment: Shipment): ShipmentFormData => ({
    shipperName: shipment.shipperName,
    carrierName: shipment.carrierName,
    currentLocation: shipment.currentLocation,
    trackingNumber: shipment.trackingNumber,
    rate: shipment.rate ?? 0,
    itemValue: shipment.itemValue ?? 0,
    status: shipment.status ?? ShipmentStatus.CREATED,
    shipmentDeliveryType: shipment.shipmentDeliveryType ?? 'STANDARD',
    pickedUpAt: shipment.pickedUpAt ? toDateTimeLocal(shipment.pickedUpAt) : '',
    deliveredAt: shipment.deliveredAt ? toDateTimeLocal(shipment.deliveredAt) : '',
    dimensions: {
      itemLength: shipment.itemLength ?? 0,
      itemWidth: shipment.itemWidth ?? 0,
      itemHeight: shipment.itemHeight ?? 0,
      itemWeight: shipment.itemWeight ?? 0,
      lengthUnit: shipment.lengthUnit ?? LengthUnit.CM,
      weightUnit: shipment.weightUnit ?? WeightUnit.KG
    },
    pickupAddress: mapShipmentAddressToFormData(shipment, 'pickupAddress'),
    deliveryAddress: mapShipmentAddressToFormData(shipment, 'deliveryAddress')
  });

  const mapFormDataToAddressInput = (
    shipmentFormdata: ShipmentFormData,
    prefix: 'pickupAddress' | 'deliveryAddress'
  ): AddressInput => {
    if (shipmentFormdata[prefix] == null) {
      return {
        contactNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
    }
    const address = shipmentFormdata[prefix];
    const country = Country.getCountryByCode(address.country);
    const state = State.getStateByCodeAndCountry(address.state, address.country);

    return {
      city: address.city,
      street: address.street,
      country: country?.name || '',
      state: state?.name || '',
      postalCode: address.postalCode,
      contactNumber: normalizePhone(address.contactNumber) || ''
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      enqueueSnackbar('Fix form errors', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    const input = {
      ...formData,
      trackingNumber: formData.trackingNumber || null,
      pickedUpAt: toISOStringSafe(formData.pickedUpAt) || null,
      deliveredAt: toISOStringSafe(formData.deliveredAt) || null,
      dimensions:
        Object.values(formData.dimensions || {}).filter(Boolean).length > 0
          ? formData.dimensions
          : null,
      deliveryAddress: mapFormDataToAddressInput(formData, 'deliveryAddress'),
      pickupAddress: mapFormDataToAddressInput(formData, 'pickupAddress')
    };

    try {
      if (mode === 'edit' && shipment?.id) {
        await updateShipment({
          variables: {
            id: shipment.id,
            input
          }
        });

        enqueueSnackbar('Shipment updated', {
          variant: 'success'
        });
      } else {
        await createShipment({
          variables: { input }
        });

        enqueueSnackbar('Shipment created', {
          variant: 'success'
        });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const validationErrors = err.errors?.[0]?.extensions?.validationErrors;

      if (validationErrors) {
        setErrors(validationErrors);
      }

      enqueueSnackbar(err.message || 'Failed to save', {
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Create Shipment' : 'Edit Shipment'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage shipment details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {mode === 'edit' && shipmentDetailLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-slate-900" />
          </div>
        )}

        {mode === 'edit' && shipmentDetailError && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
            <p className="text-red-600 font-medium">Failed to load shipment details</p>

            <div className="flex gap-3">
              <button
                onClick={() => refetchShipment()}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Try Again
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!shipmentDetailLoading && !shipmentDetailError && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-5">
              {' '}
              <h3 className="text-sm font-semibold text-gray-800">Shipment Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Field
                  label="Shipper Name"
                  name="shipperName"
                  value={formData.shipperName}
                  placeholder="Enter shipper name"
                  onChange={handleChange}
                  error={errors.shipperName}
                  disabled={disabledOnPickedUp}
                  tooltip={
                    disabledOnPickedUp
                      ? 'Shipper name cannot be changed once shipment is picked up'
                      : undefined
                  }
                />
                <SelectField
                  label="Carrier Name"
                  name="carrierName"
                  value={formData.carrierName}
                  placeholder="Select carrier"
                  onChange={handleChange}
                  error={errors.carrierName}
                  disabled={disabledOnPickedUp}
                  tooltip={
                    disabledOnPickedUp
                      ? 'Carrier cannot be changed once shipment is picked up'
                      : undefined
                  }
                >
                  <option value="">Select Carrier</option>
                  {Object.values(CarrierName).map((carrier) => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                </SelectField>
                {mode === 'edit' && (
                  <StatusField
                    shipment={shipment}
                    formData={formData}
                    handleChange={handleChange}
                    disabled={disabledOnDelivered}
                    tooltip="Shipment status cannot be changed once shipment is delivered"
                  />
                )}
              </div>
            </div>
            {mode === 'edit' && (
              <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Tracking Details</h3>
                <SearchSelect
                  label="Current Location"
                  value={formData.currentLocation}
                  options={citiesList}
                  error={errors.currentLocation}
                  onChange={(val: string) => updateField('currentLocation', val)}
                  disabled={disabledOnDelivered}
                  tooltip={
                    disabledOnDelivered
                      ? 'Current location cannot be changed once shipment is delivered'
                      : undefined
                  }
                />
              </div>
            )}
            <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-6 space-y-12">
              <AddressSection
                title="Pickup"
                description="Location where the shipment begins."
                prefix="pickupAddress"
                data={formData.pickupAddress}
                onChange={handleChange}
                errors={errors || {}}
                disabled={disabledOnPickedUp}
              />

              <div className="border-t border-gray-200" />

              <AddressSection
                title="Delivery"
                description="Location where the shipment will be delivered."
                prefix="deliveryAddress"
                data={formData.deliveryAddress}
                onChange={handleChange}
                errors={errors || {}}
                disabled={disabledOnPickedUp}
              />
            </div>

            {/* Pricing */}
            <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-5">
              <h3 className="text-sm font-semibold text-gray-800">Pricing</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Field
                  label="Rate ($)"
                  type="number"
                  name="rate"
                  placeholder="0.00"
                  step="any"
                  error={errors.rate}
                  value={formData.rate || ''}
                  onChange={handleChange}
                  disabled={disabledOnPickedUp}
                  tooltip={
                    disabledOnPickedUp
                      ? 'Rate cannot be changed once shipment is picked up'
                      : undefined
                  }
                />
                <Field
                  label="Item Value ($)"
                  type="number"
                  name="itemValue"
                  placeholder="0.00"
                  step="any"
                  value={formData.itemValue || ''}
                  onChange={handleChange}
                  error={errors.itemValue}
                  disabled={disabledOnPickedUp}
                  tooltip={
                    disabledOnPickedUp
                      ? 'Item value cannot be changed once shipment is picked up'
                      : undefined
                  }
                />
                <SelectField
                  label="Delivery Type"
                  name="shipmentDeliveryType"
                  value={formData.shipmentDeliveryType}
                  onChange={handleChange}
                  disabled={disabledOnPickedUp}
                  error={errors.shipmentDeliveryType}
                  tooltip={
                    disabledOnPickedUp
                      ? 'Delivery type cannot be changed once shipment is picked up'
                      : undefined
                  }
                >
                  {Object.values(ShipmentDeliveryType).map((t) => (
                    <option key={t} value={t}>
                      {t.replaceAll('_', ' ')}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Package Details</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter package size and weight information
                </p>
              </div>

              {/* ---------------- DIMENSIONS BLOCK ---------------- */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Dimensions
                  </h4>

                  {/* Dimension Unit */}
                  <SelectField
                    name="dimensions.lengthUnit"
                    value={formData.dimensions?.lengthUnit?.toString?.()}
                    onChange={handleChange}
                    containerClassName="!w-28"
                    disabled={disabledOnPickedUp}
                    tooltip={
                      disabledOnPickedUp
                        ? 'Length unit cannot be changed once shipment is picked up'
                        : undefined
                    }
                  >
                    {Object.values(LengthUnit).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {/* Dimension Inputs */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Field
                    label="Length"
                    type="number"
                    name="dimensions.itemLength"
                    placeholder="0.0"
                    step="any"
                    min={1.0}
                    value={formData.dimensions?.itemLength || ''}
                    onChange={handleChange}
                    disabled={disabledOnPickedUp}
                    tooltip={
                      disabledOnPickedUp
                        ? 'Length cannot be changed once shipment is picked up'
                        : undefined
                    }
                  />

                  <Field
                    label="Width"
                    type="number"
                    name="dimensions.itemWidth"
                    placeholder="0.0"
                    min={1.0}
                    step="any"
                    value={formData.dimensions?.itemWidth || ''}
                    onChange={handleChange}
                    disabled={disabledOnPickedUp}
                    tooltip={
                      disabledOnPickedUp
                        ? 'Width cannot be changed once shipment is picked up'
                        : undefined
                    }
                  />

                  <Field
                    label="Height"
                    type="number"
                    name="dimensions.itemHeight"
                    placeholder="0.0"
                    min={1.0}
                    step="any"
                    value={formData.dimensions?.itemHeight || ''}
                    onChange={handleChange}
                    disabled={disabledOnPickedUp}
                    tooltip={
                      disabledOnPickedUp
                        ? 'Height cannot be changed once shipment is picked up'
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* ---------------- WEIGHT BLOCK ---------------- */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-700 tracking-wide">Weight</h4>
                  {disabledOnPickedUp && (
                    <div className="relative inline-flex group">
                      <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-pointer" />

                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64
                      opacity-0 group-hover:opacity-100
                      transition bg-gray-900 text-white text-xs
                      rounded-md px-3 py-2 shadow-lg z-[999] pointer-events-none"
                      >
                        Weight cannot be changed once shipment is picked up
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex">
                  <input
                    type="number"
                    name="dimensions.itemWeight"
                    value={formData.dimensions?.itemWeight || ''}
                    onChange={handleChange}
                    className={`flex-1 h-11 px-3 rounded-l-lg border border-gray-200 bg-white text-sm
        focus:outline-none focus:ring-2 focus:ring-slate-500/20
        focus:border-slate-500 transition ${disabledOnPickedUp ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="0.00"
                    min={1.0}
                    step="any"
                    disabled={disabledOnPickedUp}
                    title={
                      disabledOnPickedUp
                        ? 'Weight cannot be changed once shipment is picked up'
                        : undefined
                    }
                  />

                  <select
                    name="dimensions.weightUnit"
                    value={formData.dimensions?.weightUnit ?? ''}
                    onChange={handleChange}
                    className={`h-11 px-3 rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 text-sm
        focus:outline-none focus:ring-2 focus:ring-slate-500/20
        focus:border-slate-500 transition ${disabledOnPickedUp ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={disabledOnPickedUp}
                    title={
                      disabledOnPickedUp
                        ? 'Weight unit cannot be changed once shipment is picked up'
                        : undefined
                    }
                  >
                    {Object.values(WeightUnit).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* <PackageDetailsSection formData={formData} onChange={handleChange} /> */}

            {/* Timeline */}
            {mode === 'edit' && (
              <div className="bg-gray-50/60 border border-gray-200 rounded-xl p-5 space-y-5">
                <h3 className="text-sm font-semibold text-gray-800">Timeline</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field
                    label="Picked Up At"
                    type="datetime-local"
                    name="pickedUpAt"
                    value={formData.pickedUpAt || ''}
                    error={errors.pickedUpAt}
                    onChange={handleChange}
                    disabled={disabledOnPickedUp}
                    tooltip={
                      disabledOnPickedUp
                        ? 'Picked up time cannot be changed once shipment is picked up'
                        : undefined
                    }
                  />
                  <Field
                    label="Delivered At"
                    type="datetime-local"
                    name="deliveredAt"
                    placeholder="Select delivered time"
                    value={formData.deliveredAt || ''}
                    error={errors.deliveredAt}
                    onChange={handleChange}
                    disabled={disabledOnDelivered}
                    tooltip={
                      disabledOnDelivered
                        ? 'Delivered time cannot be changed once shipment is delivered'
                        : undefined
                    }
                  />
                </div>
              </div>
            )}
          </form>
        )}

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={creating || updating || shipmentDetailLoading}
            className="h-11 px-5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating || updating || shipmentDetailLoading}
            className="h-11 px-6 rounded-lg !bg-slate-900 text-white text-sm font-medium hover:!bg-slate-800 active:scale-[0.98] transition disabled:opacity-50"
          >
            {creating || updating
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Shipment'
                : 'Update Shipment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentFormModal;
