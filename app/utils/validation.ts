import { FormData, Owner, Property, OwnerPropertyAssignment } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOwner = (owner: Owner): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!owner.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!owner.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!owner.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  }

  if (!owner.citizenship?.trim()) {
    errors.push({ field: 'citizenship', message: 'Citizenship is required' });
  }

  if (!owner.address.street?.trim()) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  if (!owner.address.city?.trim()) {
    errors.push({ field: 'address.city', message: 'City is required' });
  }

  if (!owner.address.zip?.trim()) {
    errors.push({ field: 'address.zip', message: 'ZIP/Postal code is required' });
  }

  if (!owner.address.country?.trim()) {
    errors.push({ field: 'address.country', message: 'Country is required' });
  }

  if (owner.isResidentInItaly && !owner.italianResidenceDetails?.comuneName?.trim()) {
    errors.push({ field: 'italianResidenceDetails.comuneName', message: 'Comune name is required for Italian residents' });
  }

  return errors;
};

export const validateProperty = (property: Property): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!property.address.comune?.trim()) {
    errors.push({ field: 'address.comune', message: 'Comune is required' });
  }

  if (!property.address.province?.trim()) {
    errors.push({ field: 'address.province', message: 'Province is required' });
  }

  if (!property.address.street?.trim()) {
    errors.push({ field: 'address.street', message: 'Street address is required' });
  }

  if (!property.address.zip?.trim()) {
    errors.push({ field: 'address.zip', message: 'ZIP code is required' });
  }

  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      errors.push({ field: 'purchaseDate', message: 'Purchase date is required' });
    }
    if (!property.purchasePrice) {
      errors.push({ field: 'purchasePrice', message: 'Purchase price is required' });
    }
  }

  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      errors.push({ field: 'saleDate', message: 'Sale date is required' });
    }
    if (!property.salePrice) {
      errors.push({ field: 'salePrice', message: 'Sale price is required' });
    }
  }

  if (!property.occupancyPeriods || property.occupancyPeriods.length === 0) {
    errors.push({ 
      field: 'occupancyPeriods', 
      message: 'At least one occupancy period is required' 
    });
  } else {
    const totalMonths = property.occupancyPeriods.reduce((sum, period) => sum + period.months, 0);
    if (totalMonths !== 12) {
      errors.push({ 
        field: 'occupancyPeriods', 
        message: `Total months across all periods must equal 12 (currently ${totalMonths})` 
      });
    }

    property.occupancyPeriods.forEach((period, index) => {
      if (period.months < 0 || period.months > 12) {
        errors.push({ 
          field: `occupancyPeriods[${index}].months`, 
          message: 'Months must be between 0 and 12' 
        });
      }
    });
  }

  return errors;
};

export const validateAssignments = (
  assignments: OwnerPropertyAssignment[],
  propertyId: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const totalPercentage = assignments
    .filter(a => a.propertyId === propertyId)
    .reduce((sum, a) => sum + (a.ownershipPercentage || 0), 0);

  if (totalPercentage !== 100) {
    errors.push({
      field: 'ownershipPercentage',
      message: `Total ownership percentage must be 100% (currently ${totalPercentage}%)`
    });
  }

  assignments
    .filter(a => a.propertyId === propertyId)
    .forEach(assignment => {
      if (assignment.residentAtProperty) {
        if (!assignment.residentDateRange?.from) {
          errors.push({
            field: 'residentDateRange.from',
            message: 'Residency start date is required'
          });
        }
        if (!assignment.residentDateRange?.to) {
          errors.push({
            field: 'residentDateRange.to',
            message: 'Residency end date is required'
          });
        }
      }

      if (assignment.taxCredits !== undefined && assignment.taxCredits < 0) {
        errors.push({
          field: 'taxCredits',
          message: 'Tax credits cannot be negative'
        });
      }
    });

  return errors;
};

export const validateFormData = (formData: FormData): ValidationError[] => {
  let errors: ValidationError[] = [];

  // Validate owners
  formData.owners.forEach((owner, index) => {
    const ownerErrors = validateOwner(owner);
    errors = errors.concat(
      ownerErrors.map(error => ({
        ...error,
        field: `owners[${index}].${error.field}`
      }))
    );
  });

  // Validate properties
  formData.properties.forEach((property, index) => {
    const propertyErrors = validateProperty(property);
    errors = errors.concat(
      propertyErrors.map(error => ({
        ...error,
        field: `properties[${index}].${error.field}`
      }))
    );

    // Validate assignments for this property
    const assignmentErrors = validateAssignments(formData.assignments, property.id);
    errors = errors.concat(
      assignmentErrors.map(error => ({
        ...error,
        field: `assignments.${property.id}.${error.field}`
      }))
    );
  });

  return errors;
}; 