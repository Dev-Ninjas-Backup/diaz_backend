import { BoatSpecificationType } from '@prisma/client';

export const BOAT_SPECIFICATIONS_SEED: Record<BoatSpecificationType, string[]> =
  {
    [BoatSpecificationType.MAKE]: [
      'Yamaha',
      'Suzuki',
      'Mercury',
      'Honda',
      'Volvo Penta',
      'Caterpillar',
      'MAN',
      'Perkins',
      'Yanmar',
      'Evinrude',
    ],

    [BoatSpecificationType.MODEL]: [
      'F150',
      'F200',
      'V8 4.3L',
      'D4-300',
      'IPS 600',
      'C12',
      'M 635',
      'X100',
      'Sport 250',
      'Cruiser 380',
    ],

    [BoatSpecificationType.ENGINE_TYPE]: [
      'Inboard',
      'Outboard',
      'Inboard/Outboard',
      'Jet Drive',
      'Pod Drive',
      'Electric Motor',
      'Hybrid',
    ],

    [BoatSpecificationType.FUEL_TYPE]: [
      'Gasoline',
      'Diesel',
      'Electric',
      'Hybrid',
      'LPG',
    ],

    [BoatSpecificationType.CLASS]: [
      'Sailboat',
      'Motorboat',
      'Yacht',
      'Catamaran',
      'Fishing',
      'Pontoon',
      'Speedboat',
      'RIB',
    ],

    [BoatSpecificationType.MATERIAL]: [
      'Fiberglass',
      'Aluminum',
      'Wood',
      'Steel',
      'Composite',
      'Carbon Fiber',
    ],

    [BoatSpecificationType.CONDITION]: [
      'NEW',
      'USED',
      'REFURBISHED',
      'FOR_PARTS',
    ],

    [BoatSpecificationType.PROP_TYPE]: [
      'Fixed Pitch',
      'Feathering',
      'Surface Piercing',
      'Ducted (Jet)',
    ],

    [BoatSpecificationType.PROP_MATERIAL]: [
      'Bronze',
      'Stainless Steel',
      'Aluminum',
      'Composite',
    ],
  };
