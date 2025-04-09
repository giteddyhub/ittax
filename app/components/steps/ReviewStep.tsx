'use client';

import { FormData, Owner, OwnerPropertyAssignment } from '../../types';
import Button from '../ui/Button';
import { useState } from 'react';

interface ReviewStepProps {
  formData: FormData;
  onSubmit: () => void;
  onBack: () => void;
}

const ReviewStep = ({ formData, onSubmit, onBack }: ReviewStepProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add console log to debug the data structure
  console.log('Form Data:', formData);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = formData.owners.find((o) => o.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner';
  };

  const getPropertyLabel = (propertyId: string) => {
    const property = formData.properties.find((p) => p.id === propertyId);
    return property
      ? property.label ||
          `${property.address.street}, ${property.address.comune}`
      : 'Unknown Property';
  };

  // Helper function to format status text
  const formatStatusText = (text: string) => {
    return text.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Updated to use actual assignments data
  const getPropertyOwners = (propertyId: string) => {
    return formData.assignments
      .filter(assignment => 
        assignment.propertyId === propertyId && 
        assignment.ownershipPercentage > 0
      )
      .map(assignment => {
        const owner = formData.owners.find(o => o.id === assignment.ownerId);
        return {
          owner,
          assignment
        };
      })
      .filter((item): item is { owner: Owner; assignment: OwnerPropertyAssignment } => 
        item.owner !== undefined
      );
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Review Your Information</h2>

      {/* Properties with their respective owners */}
      {formData.properties.map((property) => (
        <div key={property.id} className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Property Header */}
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {property.label}
          </h3>

          {/* Property Details */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Property Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address:</p>
                <p className="text-gray-800">
                  {property.address.street}<br />
                  {property.address.comune}, {property.address.province}<br />
                  {property.address.zip}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Information:</p>
                <p className="text-gray-800">
                  Type: {formatStatusText(property.propertyType)}<br />
                  Activity Status: {formatStatusText(property.activity2024)}<br />
                  {/* Display occupancy periods */}
                  Occupancy Periods:<br />
                  {property.occupancyPeriods.map((period, index) => (
                    <span key={index}>
                      {formatStatusText(period.status)}: {period.months} months<br />
                    </span>
                  ))}
                  {property.remodeling && (
                    <>Remodeling: Yes<br /></>
                  )}
                </p>
              </div>
            </div>
            {property.remodeling && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Additional Information:</p>
                <p className="text-gray-800">Has remodeling or improvements with building permits filed in the past 10 years</p>
              </div>
            )}
          </div>

          {/* Property Owners - only show if there are owners with > 0% ownership */}
          {getPropertyOwners(property.id).length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">Property Owners</h4>
              {getPropertyOwners(property.id).map(({ owner, assignment }, index) => (
                <div key={owner.id} className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-medium text-gray-900">
                      {index === 0 ? 'Primary Owner' : `Additional Owner ${index + 1}`}: {owner.firstName} {owner.lastName}
                    </h5>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Ownership: {assignment.ownershipPercentage.toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        {assignment.residentAtProperty ? 'Resident at this property' : 'Non-resident at this property'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Personal Information:</p>
                      <p className="text-gray-800">
                        Born: {new Date(owner.dateOfBirth).toLocaleDateString()}<br />
                        Country of Birth: {owner.countryOfBirth}<br />
                        Italian Tax Code: {owner.italianTaxCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address Outside Italy:</p>
                      <p className="text-gray-800">
                        {owner.address.street}<br />
                        {owner.address.city}, {owner.address.country}<br />
                        {owner.address.zip}
                      </p>
                    </div>
                  </div>

                  {/* Residency Period if applicable */}
                  {assignment.residentAtProperty && assignment.residentDateRange && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Residency Period:</p>
                      <p className="text-gray-800">
                        From: {formatDate(assignment.residentDateRange.from)}<br />
                        To: {formatDate(assignment.residentDateRange.to)}
                      </p>
                    </div>
                  )}

                  {/* Tax Credits if applicable */}
                  {assignment.taxCredits !== undefined && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Tax Credits:</p>
                      <p className="text-gray-800">
                        Amount: {formatCurrency(assignment.taxCredits)}
                      </p>
                    </div>
                  )}

                  {/* Italian Residence if applicable */}
                  {owner.isResidentInItaly && owner.italianResidenceDetails && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Italian Residency Registration:</p>
                      <p className="text-gray-800">
                        Registered resident in Italian Comune at:<br />
                        {owner.italianResidenceDetails.street}<br />
                        {owner.italianResidenceDetails.comuneName}, {owner.italianResidenceDetails.province}<br />
                        {owner.italianResidenceDetails.zip}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-4 mt-8">
        <Button 
          variant="secondary" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep; 