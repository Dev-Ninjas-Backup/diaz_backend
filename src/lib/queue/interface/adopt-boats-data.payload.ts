export interface AdoptBoatsSpecification {
  listingId: string;
  make: string;
  model: string;
  fuelType: string;
  class: string;
  material: string;
  condition: string;
  engineType: string;
  propType: string;
  propMaterial: string;
}

export interface AdoptBoatsFeatures {
  listingId: string;
  electronics: string[];
  insideEquipment: string[];
  outsideEquipment: string[];
  electricalEquipment: string[];
  additionalEquipment: string[];
  covers: string[];
}
