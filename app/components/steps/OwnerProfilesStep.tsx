'use client';

import { useEffect, useState } from 'react';
import { FormData, Owner } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';

interface OwnerProfilesStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

// First, let's add some validation utilities
const CODICE_FISCALE_REGEX = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
const ZIP_CODE_REGEX = /^\d{5}$/; // Italian ZIP codes are 5 digits

interface ValidationError {
  field: string;
  message: string;
}

const validateOwner = (owner: Owner): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Personal Information validation
  if (!owner.firstName?.trim()) {
    errors.push({
      field: 'firstName',
      message: 'First name is required'
    });
  }

  if (!owner.lastName?.trim()) {
    errors.push({
      field: 'lastName',
      message: 'Last name is required'
    });
  }

  if (!owner.dateOfBirth) {
    errors.push({
      field: 'dateOfBirth',
      message: 'Date of birth is required'
    });
  }

  if (!owner.countryOfBirth?.trim()) {
    errors.push({
      field: 'countryOfBirth',
      message: 'Country of birth is required'
    });
  }

  // Italian Tax Code validation
  if (!owner.italianTaxCode?.trim()) {
    errors.push({
      field: 'italianTaxCode',
      message: 'Italian Tax Code (Codice Fiscale) is required'
    });
  } else if (!CODICE_FISCALE_REGEX.test(owner.italianTaxCode.toUpperCase())) {
    errors.push({
      field: 'italianTaxCode',
      message: 'Invalid Codice Fiscale format'
    });
  }

  // Address outside Italy validation
  if (!owner.address?.street?.trim()) {
    errors.push({
      field: 'address.street',
      message: 'Street address outside Italy is required'
    });
  }

  if (!owner.address?.city?.trim()) {
    errors.push({
      field: 'address.city',
      message: 'City outside Italy is required'
    });
  }

  if (!owner.address?.country?.trim()) {
    errors.push({
      field: 'address.country',
      message: 'Country outside Italy is required'
    });
  }

  if (!owner.address?.zip?.trim()) {
    errors.push({
      field: 'address.zip',
      message: 'ZIP/Postal code outside Italy is required'
    });
  }

  // Italian residence validation (only if they are a resident)
  if (owner.isResidentInItaly) {
    if (!owner.italianResidenceDetails?.street?.trim()) {
      errors.push({
        field: 'italianResidenceDetails.street',
        message: 'Italian street address is required for residents'
      });
    }

    if (!owner.italianResidenceDetails?.comuneName?.trim()) {
      errors.push({
        field: 'italianResidenceDetails.comuneName',
        message: 'Comune name is required for residents'
      });
    }

    if (!owner.italianResidenceDetails?.province?.trim()) {
      errors.push({
        field: 'italianResidenceDetails.province',
        message: 'Province is required for residents'
      });
    }

    if (!owner.italianResidenceDetails?.zip?.trim()) {
      errors.push({
        field: 'italianResidenceDetails.zip',
        message: 'Italian ZIP code is required for residents'
      });
    }
  }

  return errors;
};

const InfoTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="group relative inline-block ml-2">
    <InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
      {children}
      <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1 border-4 border-transparent border-t-gray-900" />
    </div>
  </div>
);

// Helper function to get the owner's display name
const getOwnerDisplayName = (owner: Owner | undefined, index: number) => {
  if (!owner) return index === 0 ? 'Primary Owner' : `Additional Owner ${index + 1}`;
  
  const firstName = owner.firstName?.trim() || '';
  const lastName = owner.lastName?.trim() || '';
  
  if (firstName || lastName) {
    const fullName = [firstName, lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return index === 0 ? `Primary Owner - ${fullName}` : `Additional Owner - ${fullName}`;
  }
  
  return index === 0 ? 'Primary Owner' : `Additional Owner ${index + 1}`;
};

const OwnerProfilesStep = ({
  formData,
  setFormData,
  onNext,
  onBack,
}: OwnerProfilesStepProps) => {
  const [errors, setErrors] = useState<{ [key: string]: ValidationError[] }>({});

  // Ensure there's always at least one owner when entering this step
  useEffect(() => {
    if (formData.owners.length === 0) {
      addNewOwner();
    }
  }, []);

  const addNewOwner = () => {
    const newOwner: Owner = {
      id: `owner-${Date.now()}`,
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(),
      countryOfBirth: '',
      citizenship: '',
      address: {
        street: '',
        city: '',
        zip: '',
        country: '',
      },
      maritalStatus: 'UNMARRIED',
      isResidentInItaly: false,
    };

    setFormData({
      ...formData,
      owners: [...formData.owners, newOwner],
    });
  };

  const updateOwner = (index: number, field: string, value: any) => {
    const updatedOwners = [...formData.owners];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      owners: updatedOwners,
    });
  };

  const removeOwner = (index: number) => {
    if (formData.owners.length <= 1) return; // Don't remove if it's the last owner
    
    const updatedOwners = [...formData.owners];
    const ownerToRemove = updatedOwners[index];
    updatedOwners.splice(index, 1);

    // Also remove any assignments associated with this owner
    const updatedAssignments = formData.assignments.filter(
      assignment => assignment.ownerId !== ownerToRemove.id
    );

    setFormData({
      ...formData,
      owners: updatedOwners,
      assignments: updatedAssignments
    });
  };

  const handleOwnerChange = (index: number, field: string, value: any) => {
    const updatedOwners = [...formData.owners];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedOwners[index] = {
        ...updatedOwners[index],
        [parent]: {
          ...updatedOwners[index][parent],
          [child]: value
        }
      };
    } else {
      updatedOwners[index] = {
        ...updatedOwners[index],
        [field]: value
      };
    }

    setFormData({
      ...formData,
      owners: updatedOwners
    });

    // Validate the updated owner immediately
    const ownerErrors = validateOwner(updatedOwners[index]);
    const newErrors = { ...errors };
    
    if (ownerErrors.length > 0) {
      newErrors[index] = ownerErrors;
    } else {
      delete newErrors[index];
    }
    
    setErrors(newErrors);
  };

  const handleNext = () => {
    const newErrors: { [key: string]: ValidationError[] } = {};
    let hasErrors = false;

    formData.owners.forEach((owner, index) => {
      const ownerErrors = validateOwner(owner);
      if (ownerErrors.length > 0) {
        newErrors[index] = ownerErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      // Smooth scroll to the top where errors are displayed
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onBack();
  };

  // Helper to determine if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Error Summary Section */}
      {hasValidationErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-700 font-medium mb-2">Please fix the following errors:</h4>
          {Object.entries(errors).map(([ownerIndex, ownerErrors]) => (
            <div key={ownerIndex}>
              <p className="font-medium text-red-600">
                {getOwnerDisplayName(formData.owners[Number(ownerIndex)], Number(ownerIndex))}:
              </p>
              <ul className="list-disc list-inside ml-4">
                {ownerErrors.map((error, i) => (
                  <li key={i} className="text-red-600 text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Owner Information
        </h2>
        <p className="mt-2 text-gray-600">
          Please provide details for each property owner. Fields marked with * are required.
        </p>
      </div>

      {formData.owners.map((owner, index) => {
        const ownerErrors = errors[index] || [];
        const getError = (field: string) => 
          ownerErrors.find(error => error.field === field)?.message;

        return (
          <div
            key={owner.id}
            className="bg-white rounded-xl shadow-sm p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {getOwnerDisplayName(owner, index)}
              </h3>
              {/* Only show remove button if there's more than one owner */}
              {formData.owners.length > 1 && (
                <button
                  onClick={() => removeOwner(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove Owner
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  value={owner.firstName}
                  onChange={(e) => handleOwnerChange(index, 'firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                  error={getError('firstName')}
                />

                <Input
                  label="Last Name"
                  value={owner.lastName}
                  onChange={(e) => handleOwnerChange(index, 'lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                  error={getError('lastName')}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={owner.dateOfBirth.toISOString().split('T')[0]}
                  onChange={(e) => handleOwnerChange(index, 'dateOfBirth', new Date(e.target.value))}
                  required
                  error={getError('dateOfBirth')}
                />

                <Input
                  label="Country of Birth"
                  value={owner.countryOfBirth}
                  onChange={(e) => handleOwnerChange(index, 'countryOfBirth', e.target.value)}
                  placeholder="Enter country of birth"
                  required
                  error={getError('countryOfBirth')}
                />

                <Input
                  label="Italian Tax Code (Codice Fiscale)"
                  value={owner.italianTaxCode || ''}
                  onChange={(e) => handleOwnerChange(index, 'italianTaxCode', e.target.value.toUpperCase())}
                  placeholder="Enter your codice fiscale"
                  required
                  error={getError('italianTaxCode')}
                  pattern={CODICE_FISCALE_REGEX.source}
                  info={
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">What is a Codice Fiscale?</h3>
                      <p className="text-sm">
                        The Codice Fiscale is a unique tax identification code required for all tax-related matters in Italy. 
                        It's a 16-character code that combines letters and numbers.
                      </p>
                      <p className="text-sm font-medium">Format: LLLLLL00L00L000L</p>
                      <div className="bg-gray-50 rounded p-2 text-center font-mono text-sm">
                        Example: MRTMTT91D08F205J
                      </div>
                    </div>
                  }
                />

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Marital Status
                  </label>
                  <select
                    value={owner.maritalStatus}
                    onChange={(e) => handleOwnerChange(index, 'maritalStatus', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    required
                    error={getError('maritalStatus')}
                  >
                    <option value="UNMARRIED">Unmarried</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                    <option value="SEPARATED">Separated</option>
                  </select>
                </div>
              </div>

              {/* Address Outside Italy */}
              <div className="bg-gray-50 rounded-lg py-4 px-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Address Outside Italy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <Input
                      label="Street Address"
                      value={owner.address.street}
                      onChange={(e) => handleOwnerChange(index, 'address.street', e.target.value)}
                      placeholder="Enter street address"
                      required
                      error={getError('address.street')}
                    />
                  </div>
                  <Input
                    label="City"
                    value={owner.address.city}
                    onChange={(e) => handleOwnerChange(index, 'address.city', e.target.value)}
                    placeholder="Enter city"
                    required
                    error={getError('address.city')}
                  />
                  <Input
                    label="ZIP/Postal Code"
                    value={owner.address.zip}
                    onChange={(e) => handleOwnerChange(index, 'address.zip', e.target.value)}
                    placeholder="Enter ZIP/postal code"
                    required
                    error={getError('address.zip')}
                  />
                  <Input
                    label="Country"
                    value={owner.address.country}
                    onChange={(e) => handleOwnerChange(index, 'address.country', e.target.value)}
                    placeholder="Enter country"
                    required
                    error={getError('address.country')}
                  />
                </div>
              </div>

              {/* Italian Residency */}
              <div className="bg-gray-50 rounded-lg py-4 px-6">
                <div>
                  <Toggle
                    checked={owner.isResidentInItaly}
                    onChange={(checked) => handleOwnerChange(index, 'isResidentInItaly', checked)}
                    label="Are you registered as a resident in Italian Comune (Ufficio Anagrafe)?"
                  />
                </div>

                {owner.isResidentInItaly && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-800 mt-8">
                      Italian Residence Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Street Address"
                        value={owner.italianResidenceDetails?.street || ''}
                        onChange={(e) =>
                          handleOwnerChange(index, 'italianResidenceDetails.street', e.target.value)
                        }
                        placeholder="Enter Italian street address"
                        required
                        error={getError(index, 'italianResidenceDetails.street')}
                      />
                      <Input
                        label="Comune"
                        value={owner.italianResidenceDetails?.comuneName || ''}
                        onChange={(e) =>
                          handleOwnerChange(index, 'italianResidenceDetails.comuneName', e.target.value)
                        }
                        placeholder="Enter comune"
                        required
                        error={getError(index, 'italianResidenceDetails.comuneName')}
                      />
                      <Input
                        label="Province"
                        value={owner.italianResidenceDetails?.province || ''}
                        onChange={(e) =>
                          handleOwnerChange(index, 'italianResidenceDetails.province', e.target.value)
                        }
                        placeholder="Enter province"
                        required
                        error={getError(index, 'italianResidenceDetails.province')}
                      />
                      <Input
                        label="ZIP Code"
                        value={owner.italianResidenceDetails?.zip || ''}
                        onChange={(e) =>
                          handleOwnerChange(index, 'italianResidenceDetails.zip', e.target.value)
                        }
                        placeholder="Enter ZIP code"
                        required
                        error={getError(index, 'italianResidenceDetails.zip')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-col space-y-4 mt-8">
        <Button variant="outline" onClick={addNewOwner}>
          Add Another Owner
        </Button>

        <div className="flex justify-between space-x-4">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className={hasValidationErrors ? 'opacity-50 bg-gray-400' : ''}
            disabled={hasValidationErrors}
          >
            {hasValidationErrors ? 'Please Fix Errors to Continue' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfilesStep; 