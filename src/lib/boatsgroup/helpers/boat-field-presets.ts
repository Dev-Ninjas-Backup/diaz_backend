import {
  BOAT_FIELD_KEYS,
  FieldPreset,
} from '../interface/boats-fields.interface';
import { BoatFromBoatsGroup } from '../interface/boats.interface';

export type BoatFieldKey = keyof BoatFromBoatsGroup;

const MINIMAL_FIELDS: BoatFieldKey[] = [
  'DocumentID',
  'ListingTitle',
  'Price',
  'BoatLocation',
  'FuelTankCapacityMeasure',
  'FuelTankCountNumeric',
  'MakeString',
  'ModelYear',
  'Model',
  'BeamMeasure',
  'TotalEnginePowerQuantity',
  'NominalLength',
  'LengthOverall',
  'LastModificationDate',
  'ItemReceivedDate',
  'GeneralBoatDescription',
  'AdditionalDetailDescription',
  'Engines',
  'Images',
];

const SEARCH_FIELDS: BoatFieldKey[] = [
  ...MINIMAL_FIELDS,
  'Owner',
  'SalesRep',
  'CompanyName',
  'Office',
  'NumberOfEngines',
  'MaxDraft',
];

export function getBoatFieldsByPreset(
  preset: FieldPreset = FieldPreset.minimal,
): BoatFieldKey[] {
  switch (preset) {
    case FieldPreset.all:
      return [...BOAT_FIELD_KEYS];
    case FieldPreset.search:
      return SEARCH_FIELDS;
    case FieldPreset.minimal:
    default:
      return MINIMAL_FIELDS;
  }
}
