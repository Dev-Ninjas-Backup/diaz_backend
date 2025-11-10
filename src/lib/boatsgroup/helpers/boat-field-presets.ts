import { FieldPreset } from '../interface/boats-fields.interface';
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
  'GeneralBoatDescription',
  'AdditionalDetailDescription',
  'Engines',
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

const ALL_FIELDS: BoatFieldKey[] = Object.keys(
  {} as BoatFromBoatsGroup,
) as BoatFieldKey[];

/**
 * Get field keys based on preset type.
 */
export function getBoatFieldsByPreset(
  preset: FieldPreset = FieldPreset.minimal,
): BoatFieldKey[] {
  switch (preset) {
    case FieldPreset.all:
      return ALL_FIELDS;
    case FieldPreset.search:
      return SEARCH_FIELDS;
    case FieldPreset.minimal:
    default:
      return MINIMAL_FIELDS;
  }
}
