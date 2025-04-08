'use client';

import { useState } from 'react';
import { FormData, Owner, OwnerPropertyAssignment, ValidationError } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Toggle from '../ui/Toggle';
import Modal from '../ui/Modal';
import OwnerForm from '../forms/OwnerForm';

interface AssignmentsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

// Add validation function (similar to OwnerProfilesStep)
const validateOwner = (owner: Owner): ValidationError[] => {
  const errors: ValidationError[] = [];
  const CODICE_FISCALE_REGEX = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  if (!owner.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!owner.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!owner.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  }

  if (!owner.countryOfBirth?.trim()) {
    errors.push({ field: 'countryOfBirth', message: 'Country of birth is required' });
  }

  if (!owner.italianTaxCode?.trim()) {
    errors.push({ field: 'italianTaxCode', message: 'Italian Tax Code is required' });
  } else if (!CODICE_FISCALE_REGEX.test(owner.italianTaxCode.toUpperCase())) {
    errors.push({ field: 'italianTaxCode', message: 'Invalid Codice Fiscale format' });
  }

  if (!owner.address?.street?.trim()) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  if (!owner.address?.city?.trim()) {
    errors.push({ field: 'address.city', message: 'City is required' });
  }

  if (!owner.address?.country?.trim()) {
    errors.push({ field: 'address.country', message: 'Country is required' });
  }

  if (!owner.address?.zip?.trim()) {
    errors.push({ field: 'address.zip', message: 'ZIP/Postal code is required' });
  }

  if (owner.isResidentInItaly) {
    if (!owner.italianResidenceDetails?.street?.trim()) {
      errors.push({ field: 'italianResidenceDetails.street', message: 'Italian street address is required' });
    }
    if (!owner.italianResidenceDetails?.comuneName?.trim()) {
      errors.push({ field: 'italianResidenceDetails.comuneName', message: 'Comune name is required' });
    }
    if (!owner.italianResidenceDetails?.province?.trim()) {
      errors.push({ field: 'italianResidenceDetails.province', message: 'Province is required' });
    }
    if (!owner.italianResidenceDetails?.zip?.trim()) {
      errors.push({ field: 'italianResidenceDetails.zip', message: 'Italian ZIP code is required' });
    }
  }

  return errors;
};

const AssignmentsStep = ({
  formData,
  setFormData,
  onNext,
  onBack,
}: AssignmentsStepProps) => {
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<string>('');
  const [newOwner, setNewOwner] = useState<Owner>({
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    countryOfBirth: '',
    italianTaxCode: '',
    address: {
      street: '',
      city: '',
      zip: '',
      country: '',
    },
    isResidentInItaly: false,
  });
  const [ownerErrors, setOwnerErrors] = useState<ValidationError[]>([]);

  const getAssignment = (propertyId: string, ownerId: string) => {
    return formData.assignments.find(
      (a) => a.propertyId === propertyId && a.ownerId === ownerId
    );
  };

  const updateAssignment = (
    propertyId: string,
    ownerId: string,
    updates: Partial<OwnerPropertyAssignment>
  ) => {
    const newAssignments = [...formData.assignments];
    const existingIndex = newAssignments.findIndex(
      (a) => a.propertyId === propertyId && a.ownerId === ownerId
    );

    if (existingIndex >= 0) {
      newAssignments[existingIndex] = {
        ...newAssignments[existingIndex],
        ...updates,
      };
    } else {
      newAssignments.push({
        propertyId,
        ownerId,
        ownershipPercentage: 0,
        residentAtProperty: false,
        ...updates,
      });
    }

    setFormData({
      ...formData,
      assignments: newAssignments,
    });
  };

  const handleAddOwner = () => {
    const errors = validateOwner(newOwner);
    if (errors.length > 0) {
      setOwnerErrors(errors);
      return;
    }

    const ownerId = `owner-${Date.now()}`;
    const ownerToAdd = {
      ...newOwner,
      id: ownerId,
    };

    // Add the new owner to formData
    const updatedFormData = {
      ...formData,
      owners: [...formData.owners, ownerToAdd],
    };

    // Create initial assignment for the current property
    const newAssignment: OwnerPropertyAssignment = {
      propertyId: currentPropertyId,
      ownerId: ownerId,
      ownershipPercentage: 0,
      residentAtProperty: false,
    };

    updatedFormData.assignments = [...formData.assignments, newAssignment];

    setFormData(updatedFormData);

    // Reset form and close modal
    setNewOwner({
      id: '',
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(),
      countryOfBirth: '',
      italianTaxCode: '',
      address: {
        street: '',
        city: '',
        zip: '',
        country: '',
      },
      isResidentInItaly: false,
    });
    setOwnerErrors([]);
    setIsAddOwnerModalOpen(false);
    setCurrentPropertyId('');
  };

  const handleNewOwnerChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewOwner(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setNewOwner(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear the error for this field if it exists
    setOwnerErrors(prev => prev.filter(error => error.field !== field));
  };

  const calculateTotalOwnership = (propertyId: string) => {
    return formData.assignments
      .filter((a) => a.propertyId === propertyId)
      .reduce((sum, assignment) => sum + (assignment.ownershipPercentage || 0), 0);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = formData.owners.find((o) => o.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Property Ownership Assignments
      </h2>
      <p className="text-gray-600 mb-8">
        Specify ownership details and residency status for each property.
      </p>

      {formData.properties.map((property) => (
        <div key={property.id} className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {property.label || `${property.address.street}, ${property.address.comune}`}
            </h3>
            <p className="text-sm text-gray-500">
              {property.address.comune}, {property.address.province}
            </p>
          </div>

          <div className="space-y-8">
            {/* Existing Owners Section */}
            {formData.owners.map((owner) => {
              const assignment = getAssignment(property.id, owner.id);
              return (
                <div
                  key={`${property.id}-${owner.id}`}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-medium text-gray-800">
                      {getOwnerName(owner.id)}
                    </h4>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700">
                        Ownership %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assignment?.ownershipPercentage || 0}
                        onChange={(e) =>
                          updateAssignment(property.id, owner.id, {
                            ownershipPercentage: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Residency Status */}
                    <div className="space-y-4">
                      <Toggle
                        checked={assignment?.residentAtProperty || false}
                        onChange={(checked) =>
                          updateAssignment(property.id, owner.id, {
                            residentAtProperty: checked,
                          })
                        }
                        label="Resident at this property"
                      />

                      {assignment?.residentAtProperty && (
                        <div className="pl-8 space-y-4">
                          <Input
                            label="Residency Start Date"
                            type="date"
                            value={
                              assignment.residentDateRange?.from
                                ? new Date(assignment.residentDateRange.from)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              updateAssignment(property.id, owner.id, {
                                residentDateRange: {
                                  from: e.target.value ? new Date(e.target.value) : new Date(),
                                  to:
                                    assignment.residentDateRange?.to ||
                                    new Date(new Date().getFullYear(), 11, 31),
                                },
                              })
                            }
                          />
                          <Input
                            label="Residency End Date"
                            type="date"
                            value={
                              assignment.residentDateRange?.to
                                ? new Date(assignment.residentDateRange.to)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              updateAssignment(property.id, owner.id, {
                                residentDateRange: {
                                  from:
                                    assignment.residentDateRange?.from ||
                                    new Date(new Date().getFullYear(), 0, 1),
                                  to: e.target.value ? new Date(e.target.value) : new Date(),
                                },
                              })
                            }
                            min={
                              assignment.residentDateRange?.from
                                ? new Date(assignment.residentDateRange.from)
                                    .toISOString()
                                    .split('T')[0]
                                : undefined
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Tax Credits */}
                    <div className="space-y-4">
                      <Toggle
                        checked={assignment?.taxCredits !== undefined}
                        onChange={(checked) =>
                          updateAssignment(property.id, owner.id, {
                            taxCredits: checked ? 0 : undefined,
                          })
                        }
                        label="Claiming tax credits"
                      />

                      {assignment?.taxCredits !== undefined && (
                        <div className="pl-8">
                          <Input
                            label="Tax Credit Amount (€)"
                            type="number"
                            value={assignment.taxCredits || ''}
                            onChange={(e) =>
                              updateAssignment(property.id, owner.id, {
                                taxCredits: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter tax credit amount"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Owner Button */}
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPropertyId(property.id);
                  setIsAddOwnerModalOpen(true);
                }}
                className="w-full"
              >
                Add New Owner to This Property
              </Button>
            </div>

            {/* Ownership Total */}
            <div className="mt-4">
              <div
                className={`text-sm font-medium ${
                  calculateTotalOwnership(property.id) === 100
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                Total Ownership: {calculateTotalOwnership(property.id)}%
                {calculateTotalOwnership(property.id) !== 100 && (
                  <span className="ml-2">
                    (Must equal 100%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Owner Modal */}
      <Modal
        isOpen={isAddOwnerModalOpen}
        onClose={() => {
          setIsAddOwnerModalOpen(false);
          setOwnerErrors([]);
          setNewOwner({
            id: '',
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            countryOfBirth: '',
            italianTaxCode: '',
            address: {
              street: '',
              city: '',
              zip: '',
              country: '',
            },
            isResidentInItaly: false,
          });
          setCurrentPropertyId('');
        }}
        title="Add New Owner"
      >
        <div className="space-y-6">
          <OwnerForm
            owner={newOwner}
            onChange={handleNewOwnerChange}
            errors={ownerErrors}
          />
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddOwnerModalOpen(false);
                setCurrentPropertyId('');
                setOwnerErrors([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddOwner}>
              Add Owner
            </Button>
          </div>
        </div>
      </Modal>

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-4 mt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AssignmentsStep; 