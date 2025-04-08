'use client';

import { Owner, ValidationError } from '../../types';
import Input from '../ui/Input';
import Toggle from '../ui/Toggle';

interface OwnerFormProps {
  owner: Owner;
  onChange: (field: string, value: any) => void;
  errors?: ValidationError[];
}

const OwnerForm = ({ owner, onChange, errors = [] }: OwnerFormProps) => {
  const getError = (field: string) => 
    errors.find(error => error.field === field)?.message;

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={owner.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            required
            error={getError('firstName')}
          />
          <Input
            label="Last Name"
            value={owner.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            required
            error={getError('lastName')}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={owner.dateOfBirth ? new Date(owner.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value ? new Date(e.target.value) : null)}
            required
            error={getError('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Country of Birth"
            value={owner.countryOfBirth || ''}
            onChange={(e) => onChange('countryOfBirth', e.target.value)}
            required
            error={getError('countryOfBirth')}
          />
          <Input
            label="Italian Tax Code (Codice Fiscale)"
            value={owner.italianTaxCode || ''}
            onChange={(e) => onChange('italianTaxCode', e.target.value.toUpperCase())}
            required
            error={getError('italianTaxCode')}
            pattern="[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]"
            title="Please enter a valid Italian Tax Code"
          />
        </div>
      </div>

      {/* Address Outside Italy */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-4">Address Outside Italy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Street Address"
            value={owner.address?.street || ''}
            onChange={(e) => onChange('address.street', e.target.value)}
            className="col-span-2"
            required
            error={getError('address.street')}
          />
          <Input
            label="City"
            value={owner.address?.city || ''}
            onChange={(e) => onChange('address.city', e.target.value)}
            required
            error={getError('address.city')}
          />
          <Input
            label="Country"
            value={owner.address?.country || ''}
            onChange={(e) => onChange('address.country', e.target.value)}
            required
            error={getError('address.country')}
          />
          <Input
            label="ZIP/Postal Code"
            value={owner.address?.zip || ''}
            onChange={(e) => onChange('address.zip', e.target.value)}
            required
            error={getError('address.zip')}
          />
        </div>
      </div>

      {/* Italian Residency */}
      <div className="bg-gray-50 rounded-lg py-4 px-6">
        <div>
          <Toggle
            checked={owner.isResidentInItaly}
            onChange={(checked) => onChange('isResidentInItaly', checked)}
            label="Are you registered as a resident in Italian Comune (Ufficio Anagrafe)?"
          />
        </div>

        {owner.isResidentInItaly && (
          <div className="space-y-6 mt-6">
            <h4 className="text-lg font-medium text-gray-800">
              Italian Residence Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Street Address"
                value={owner.italianResidenceDetails?.street || ''}
                onChange={(e) => onChange('italianResidenceDetails.street', e.target.value)}
                required
                error={getError('italianResidenceDetails.street')}
              />
              <Input
                label="Comune"
                value={owner.italianResidenceDetails?.comuneName || ''}
                onChange={(e) => onChange('italianResidenceDetails.comuneName', e.target.value)}
                required
                error={getError('italianResidenceDetails.comuneName')}
              />
              <Input
                label="Province"
                value={owner.italianResidenceDetails?.province || ''}
                onChange={(e) => onChange('italianResidenceDetails.province', e.target.value)}
                required
                error={getError('italianResidenceDetails.province')}
              />
              <Input
                label="ZIP Code"
                value={owner.italianResidenceDetails?.zip || ''}
                onChange={(e) => onChange('italianResidenceDetails.zip', e.target.value)}
                required
                error={getError('italianResidenceDetails.zip')}
                pattern="\d{5}"
                title="ZIP code must be 5 digits"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerForm; 