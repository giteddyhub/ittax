'use client';

import { useEffect, useState } from 'react';
import { FormData, Property, ActivityStatus, PropertyType, OccupancyStatus, OccupancyPeriod, ValidationError } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';

interface PropertiesStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const validateProperty = (property: Property): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Property Name validation is optional
  if (property.label && !property.label.trim()) {
    errors.push({
      field: 'label',
      message: 'Property name cannot be empty if provided'
    });
  }

  // Address validation
  if (!property.address?.street?.trim()) {
    errors.push({
      field: 'address.street',
      message: 'Street address is required'
    });
  }

  if (!property.address?.comune?.trim()) {
    errors.push({
      field: 'address.comune',
      message: 'Comune is required'
    });
  }

  if (!property.address?.province?.trim()) {
    errors.push({
      field: 'address.province',
      message: 'Province is required'
    });
  }

  if (!property.address?.zip?.trim()) {
    errors.push({
      field: 'address.zip',
      message: 'ZIP code is required'
    });
  }

  // Validate activity2024 related fields
  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      errors.push({
        field: 'purchaseDate',
        message: 'Purchase date is required'
      });
    }
    if (!property.purchasePrice) {
      errors.push({
        field: 'purchasePrice',
        message: 'Purchase price is required'
      });
    }
  }

  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      errors.push({
        field: 'saleDate',
        message: 'Sale date is required'
      });
    }
    if (!property.salePrice) {
      errors.push({
        field: 'salePrice',
        message: 'Sale price is required'
      });
    }
  }

  return errors;
};

const PropertiesStep = ({
  formData,
  setFormData,
  onNext,
  onBack,
}: PropertiesStepProps) => {
  const [errors, setErrors] = useState<{ [key: string]: ValidationError[] }>({});
  const [debugMode, setDebugMode] = useState(false);  // For development only

  // Ensure there's always at least one property when entering this step
  useEffect(() => {
    if (formData.properties.length === 0) {
      addNewProperty();
    }
  }, []);

  // Update this useEffect to use the correct property names
  useEffect(() => {
    if (formData.properties.length > 0) {
      const updatedProperties = formData.properties.map(property => ({
        ...property,
        propertyType: property.propertyType || 'RESIDENTIAL',
        activity2024: property.activity2024 || 'neither',
        occupancyPeriods: property.occupancyPeriods || [{ 
          status: 'PERSONAL_USE' as OccupancyStatus, 
          months: 12 
        }]
      }));

      if (JSON.stringify(updatedProperties) !== JSON.stringify(formData.properties)) {
        setFormData({
          ...formData,
          properties: updatedProperties
        });
      }
    }
  }, []);

  const addNewProperty = () => {
    const newProperty: Property = {
      id: Date.now().toString(),
      address: {
        street: '',
        comune: '',
        province: '',
        zip: ''
      },
      propertyType: 'RESIDENTIAL',
      activity2024: 'neither',
      remodeling: false,
      occupancyPeriods: [{
        status: 'PERSONAL_USE',
        months: 12
      }]
    };

    setFormData({
      ...formData,
      properties: [...formData.properties, newProperty]
    });
  };

  const handlePropertyChange = (index: number, field: string, value: any) => {
    const updatedProperties = [...formData.properties];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [keyof Property, string];
      const parentObj = updatedProperties[index][parent] as Record<string, any>;
      
      updatedProperties[index] = {
        ...updatedProperties[index],
        [parent]: {
          ...parentObj,
          [child]: value
        }
      };
    } else {
      updatedProperties[index] = {
        ...updatedProperties[index],
        [field as keyof Property]: value
      };
    }

    setFormData({
      ...formData,
      properties: updatedProperties
    });

    // Immediate validation of the updated property
    const propertyErrors = validateProperty(updatedProperties[index]);
    const newErrors = { ...errors };
    
    if (propertyErrors.length > 0) {
      newErrors[index] = propertyErrors;
    } else {
      delete newErrors[index];
    }
    
    setErrors(newErrors);
  };

  const updatePropertyAddress = (index: number, field: string, value: string) => {
    const updatedProperties = [...formData.properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      address: {
        ...updatedProperties[index].address,
        [field]: value,
      },
    };

    setFormData({
      ...formData,
      properties: updatedProperties,
    });
  };

  const removeProperty = (index: number) => {
    const updatedProperties = [...formData.properties];
    if (updatedProperties.length > 1) {
      updatedProperties.splice(index, 1);
      setFormData({
        ...formData,
        properties: updatedProperties
      });
      // Clear errors for removed property
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleNext = () => {
    const newErrors: { [key: string]: ValidationError[] } = {};
    let hasErrors = false;

    formData.properties.forEach((property, index) => {
      const propertyErrors = validateProperty(property);
      if (propertyErrors.length > 0) {
        newErrors[index] = propertyErrors;
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

  // Helper function to get error message for a specific field
  const getError = (propertyIndex: number, field: string) => {
    const propertyErrors = errors[propertyIndex] || [];
    const error = propertyErrors.find(err => err.field === field);
    return error?.message;
  };

  // Helper to determine if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0;

  // Helper to get property display name
  const getPropertyDisplayName = (property: Property, index: number) => {
    if (property.label?.trim()) {
      return index === 0 ? `Primary Property - ${property.label}` : `Additional Property - ${property.label}`;
    }
    return index === 0 ? 'Primary Property' : `Additional Property ${index}`;
  };

  const getTotalMonths = (periods: OccupancyPeriod[]) => {
    return periods.reduce((sum, period) => sum + period.months, 0);
  };

  const getAvailableOccupancyStatuses = (property: Property, currentPeriodIndex: number) => {
    const usedStatuses = new Set(
      property.occupancyPeriods
        .filter((_, index) => index !== currentPeriodIndex)
        .map(period => period.status)
    );

    const allStatuses = [
      { value: 'LONG_TERM_RENTAL', label: 'Long-term Rental' },
      { value: 'SHORT_TERM_RENTAL', label: 'Short-term Rental' },
      { value: 'OWNER_OCCUPIED', label: 'Owner Occupied' },
      { value: 'VACANT', label: 'Vacant/Personal Use' }
    ];

    return allStatuses.filter(status => !usedStatuses.has(status.value as OccupancyStatus));
  };

  const handleOccupancyChange = (propertyIndex: number, periodIndex: number, field: 'status' | 'months', value: OccupancyStatus | number) => {
    const updatedProperties = [...formData.properties];
    const property = updatedProperties[propertyIndex];
    
    if (!property.occupancyPeriods) {
      property.occupancyPeriods = [{ status: 'PERSONAL_USE', months: 12 }];
    }

    const periods = [...property.occupancyPeriods];
    
    if (field === 'status') {
      periods[periodIndex] = {
        ...periods[periodIndex],
        status: value as OccupancyStatus
      };
    } else {
      periods[periodIndex] = {
        ...periods[periodIndex],
        months: value as number
      };
    }

    // Calculate total months excluding the last period
    const totalMonthsExcludingLast = getTotalMonths(periods.slice(0, -1));

    // If total months of all periods except last is 12 or more, remove the last period
    if (totalMonthsExcludingLast >= 12) {
      periods.splice(-1, 1); // Remove the last period
    } 
    // Otherwise, if total is less than 12 and the last period's months > 0, maybe add a new period
    else if (getTotalMonths(periods) < 12 && periods[periods.length - 1].months > 0) {
      const availableStatuses = getAvailableOccupancyStatuses({ ...property, occupancyPeriods: periods }, periods.length);
      if (availableStatuses.length > 0) {
        periods.push({
          status: availableStatuses[0].value as OccupancyStatus,
          months: 12 - getTotalMonths(periods)
        });
      }
    }

    // Update the property with the new periods
    updatedProperties[propertyIndex] = {
      ...property,
      occupancyPeriods: periods
    };

    setFormData({
      ...formData,
      properties: updatedProperties
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Debug panel - remove in production */}
      {debugMode && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <button 
            onClick={() => console.log('Current form data:', formData)}
            className="text-sm text-blue-500"
          >
            Log Form Data
          </button>
          <pre className="mt-2 text-xs">
            {JSON.stringify(errors, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Summary Section */}
      {hasValidationErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-700 font-medium mb-2">Please fix the following errors:</h4>
          {Object.entries(errors).map(([propertyIndex, propertyErrors]) => (
            <div key={propertyIndex}>
              <p className="font-medium text-red-600">
                {getPropertyDisplayName(formData.properties[Number(propertyIndex)], Number(propertyIndex))}:
              </p>
              <ul className="list-disc list-inside ml-4">
                {propertyErrors.map((error, i) => (
                  <li key={i} className="text-red-600 text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Property Information
        </h2>
        <p className="mt-2 text-gray-600">
          Please provide details for each property. Fields marked with * are required.
        </p>
      </div>

      {formData.properties.map((property, propertyIndex) => (
        <div
          key={property.id}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {getPropertyDisplayName(property, propertyIndex)}
            </h3>
            {formData.properties.length > 1 && (
              <button
                onClick={() => removeProperty(propertyIndex)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove Property
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Property Name */}
            <div className="mb-6">
              <Input
                label="Property Name"
                value={property.label || ''}
                onChange={(e) => handlePropertyChange(propertyIndex, 'label', e.target.value)}
                placeholder="e.g., Vacation House in Venice"
                required
                error={getError(propertyIndex, 'label')}
              />
            </div>

            {/* Address Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                Address Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Street Address"
                  value={property.address.street || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'address.street', e.target.value)}
                  placeholder="Enter street address"
                  className="col-span-2"
                  required
                  error={getError(propertyIndex, 'address.street')}
                />
                <Input
                  label="Comune"
                  value={property.address.comune || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'address.comune', e.target.value)}
                  placeholder="Enter comune"
                  required
                  error={getError(propertyIndex, 'address.comune')}
                />
                <Input
                  label="Province"
                  value={property.address.province || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'address.province', e.target.value)}
                  placeholder="Enter province"
                  required
                  error={getError(propertyIndex, 'address.province')}
                />
                <Input
                  label="ZIP Code"
                  value={property.address.zip || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'address.zip', e.target.value)}
                  placeholder="Enter ZIP code"
                  required
                  error={getError(propertyIndex, 'address.zip')}
                  pattern="\d{5}"
                  title="ZIP code must be 5 digits"
                />
              </div>
            </div>

            {/* Property Type and Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Property Type *
                </label>
                <select
                  value={property.propertyType}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'propertyType', e.target.value as PropertyType)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    getError(propertyIndex, 'propertyType') ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="B&B">B&B</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LAND">Land</option>
                </select>
                {getError(propertyIndex, 'propertyType') && (
                  <p className="mt-1 text-sm text-red-500">{getError(propertyIndex, 'propertyType')}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Activity in 2024
                </label>
                <select
                  value={property.activity2024}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'activity2024', e.target.value as ActivityStatus)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  required
                >
                  <option value="OWNED_ALL_YEAR">Owned All Year</option>
                  <option value="purchased">Purchased Only</option>
                  <option value="sold">Sold Only</option>
                  <option value="both">Both Purchased and Sold</option>
                </select>
              </div>
            </div>

            {/* Purchase/Sale Information */}
            {(property.activity2024 === 'purchased' || property.activity2024 === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-purple-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-800 col-span-2">
                  Purchase Details
                </h4>
                <Input
                  label="Purchase Date"
                  type="date"
                  value={property.purchaseDate ? new Date(property.purchaseDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'purchaseDate', e.target.value ? new Date(e.target.value) : null)}
                  required
                  error={getError(propertyIndex, 'purchaseDate')}
                />
                <Input
                  label="Purchase Price (€)"
                  type="number"
                  value={property.purchasePrice || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'purchasePrice', parseFloat(e.target.value) || '')}
                  placeholder="Enter purchase price"
                  required
                />
              </div>
            )}

            {(property.activity2024 === 'sold' || property.activity2024 === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-purple-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-800 col-span-2">
                  Sale Details
                </h4>
                <Input
                  label="Sale Date"
                  type="date"
                  value={property.saleDate ? new Date(property.saleDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'saleDate', e.target.value ? new Date(e.target.value) : null)}
                  required
                  error={getError(propertyIndex, 'saleDate')}
                  min={property.purchaseDate ? new Date(property.purchaseDate).toISOString().split('T')[0] : undefined}
                />
                <Input
                  label="Sale Price (€)"
                  type="number"
                  value={property.salePrice || ''}
                  onChange={(e) => handlePropertyChange(propertyIndex, 'salePrice', parseFloat(e.target.value) || '')}
                  placeholder="Enter sale price"
                  required
                />
              </div>
            )}

            {/* Occupancy Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                Occupancy Details
              </h4>
              
              {/* Initialize occupancyPeriods if not exists */}
              {!property.occupancyPeriods && handleOccupancyChange(propertyIndex, 0, 'months', 12)}
              
              {property.occupancyPeriods?.map((period, periodIndex) => {
                // Calculate total months up to this period (excluding this period)
                const totalMonthsUpToHere = getTotalMonths(property.occupancyPeriods.slice(0, periodIndex));
                
                // Don't render this period if it's not the first and previous periods total 12 or more
                if (periodIndex > 0 && totalMonthsUpToHere >= 12) {
                  return null;
                }

                return (
                  <div key={periodIndex} className="mb-6 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Occupancy Status {periodIndex === 0 ? '*' : ''}
                        </label>
                        <select
                          value={period.status}
                          onChange={(e) => handleOccupancyChange(
                            propertyIndex,
                            periodIndex,
                            'status',
                            e.target.value as OccupancyStatus
                          )}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {getAvailableOccupancyStatuses(property, periodIndex).map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Number of Months {periodIndex === 0 ? '*' : ''}
                        </label>
                        <select
                          value={period.months}
                          onChange={(e) => handleOccupancyChange(
                            propertyIndex,
                            periodIndex,
                            'months',
                            parseInt(e.target.value)
                          )}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {Array.from(
                            { length: Math.min(
                              12 - totalMonthsUpToHere,  // Only show months that are still available
                              12  // Never more than 12
                            )},
                            (_, i) => i + 1
                          ).map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 flex items-center">
                <div className={`text-sm font-medium ${
                  getTotalMonths(property.occupancyPeriods) === 12 ? 'text-green-600' : 'text-red-600'
                }`}>
                  Total Months: {getTotalMonths(property.occupancyPeriods)}/12
                </div>
              </div>
            </div>

            {/* Remodeling Information */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Toggle
                checked={property.remodeling}
                onChange={(checked) => handlePropertyChange(propertyIndex, 'remodeling', checked)}
                label="Did you do any remodeling or improvements for which a building permit was filed in the past 10 years?"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col space-y-4 mt-8">
        <Button variant="outline" onClick={addNewProperty}>
          Add Another Property
        </Button>

        <div className="flex justify-between space-x-4">
          <Button variant="secondary" onClick={onBack}>
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

export default PropertiesStep; 