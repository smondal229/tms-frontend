import { City, Country, State } from 'country-state-city';
import React, { useMemo } from 'react';
import Field from './common/Field';
import SelectField from './common/SelectField';

interface AddressSectionProps {
  title: string;
  description: string;
  prefix: 'pickupAddress' | 'deliveryAddress';
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

function AddressSection({
  title,
  description,
  prefix,
  data,
  onChange,
  errors
}: AddressSectionProps) {
  const countries = useMemo(() => {
    return Country.getAllCountries();
  }, []);

  const states = useMemo(() => {
    if (!data.country) return [];
    return State.getStatesOfCountry(data.country);
  }, [data.country]);

  const cities = useMemo(() => {
    if (!data.country || !data.state) return [];
    return City.getCitiesOfState(data.country, data.state);
  }, [data.country, data.state]);

  const emitChange = (field: string, value: string) => {
    onChange({
      target: {
        name: `${prefix}.${field}`,
        value
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <SelectField
            label="Country"
            value={data.country}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              emitChange('country', e.target.value)
            }
            error={errors[`${prefix}.country`]}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>

        {/* State */}
        <div>
          <SelectField
            label="State"
            value={data.state}
            disabled={!data.country}
            onChange={(e) => emitChange('state', e.target.value)}
            error={errors[`${prefix}.state`]}
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </SelectField>
        </div>

        <Field
          label="Postal Code"
          name={`${prefix}.postalCode`}
          value={data.postalCode}
          onChange={onChange}
          pattern="[a-zA-Z0-9 -]*"
          maxLength={10}
          placeholder={data.country === 'US' ? 'Enter ZIP code' : 'Postal code'}
          error={errors[`${prefix}.postalCode`]}
        />

        <div>
          <SelectField
            label="City"
            value={data.city}
            disabled={!data.state}
            onChange={(e) => emitChange('city', e.target.value)}
            error={errors[`${prefix}.city`]}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <Field
          label="Street"
          name={`${prefix}.street`}
          value={data.street}
          placeholder="Enter street address"
          onChange={onChange}
          error={errors[`${prefix}.street`]}
        />

        <Field
          label="Contact Number"
          name={`${prefix}.contactNumber`}
          value={data.contactNumber}
          placeholder="Enter contact number"
          type="tel"
          error={errors[`${prefix}.contactNumber`]}
          onChange={onChange}
        />
      </div>
    </section>
  );
}

export default AddressSection;
