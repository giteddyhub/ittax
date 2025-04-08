export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface ItalianResidenceDetails {
  street: string;
  comuneName: string;
  province: string;
  zip: string;
  isPartialYear: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  countryOfBirth: string;
  citizenship: string;
  address: Address;
  italianTaxCode?: string;
  maritalStatus: 'UNMARRIED' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
  isResidentInItaly: boolean;
  italianResidenceDetails?: ItalianResidenceDetails;
}

export interface PropertyAddress {
  comune: string;
  province: string;
  street: string;
  zip: string;
}

export type ActivityStatus = 'purchased' | 'sold' | 'both' | 'neither';
export type PropertyType = 'RESIDENTIAL' | 'B&B' | 'COMMERCIAL' | 'LAND';
export type OccupancyStatus = 'LONG_TERM_RENT' | 'SHORT_TERM_RENT' | 'PERSONAL_USE';

export interface OccupancyPeriod {
  status: OccupancyStatus;
  months: number;
}

export interface Property {
  id: string;
  label?: string;
  address: PropertyAddress;
  activity2024: ActivityStatus;
  purchaseDate?: Date;
  purchasePrice?: number;
  saleDate?: Date;
  salePrice?: number;
  propertyType: PropertyType;
  remodeling: boolean;
  occupancyPeriods: OccupancyPeriod[];
}

export interface OwnerPropertyRelationship {
  ownerId: string;
  propertyId: string;
  ownershipPercentage: number;
  isResidentAtProperty: boolean;
}

export interface FormData {
  owners: Owner[];
  properties: Property[];
  ownerPropertyRelationships: OwnerPropertyRelationship[];
} 