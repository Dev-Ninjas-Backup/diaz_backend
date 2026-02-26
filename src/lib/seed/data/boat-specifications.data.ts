import { BoatSpecificationType } from 'generated/client';
import { BOAT_MAKES_SEED } from './boat-makes.data';
import { BOAT_MODELS_SEED } from './boat-models.data';

export const BOAT_SPECIFICATIONS_SEED: Record<BoatSpecificationType, string[]> =
  {
    [BoatSpecificationType.MAKE]: BOAT_MAKES_SEED,

    [BoatSpecificationType.MODEL]: BOAT_MODELS_SEED,

    [BoatSpecificationType.ENGINE_TYPE]: [
      'Electric',
      'Inboard',
      'Inboard/Outboard',
      'Other',
      'Outboard',
      'Outboard 2S',
      'Outboard 4S',
      'V-Drive',
    ],

    [BoatSpecificationType.FUEL_TYPE]: [
      'Diesel',
      'Electric',
      'Gas / Petrol',
      'LPG',
      'Other',
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

    [BoatSpecificationType.CONDITION]: ['NEW', 'USED'],

    [BoatSpecificationType.PROP_TYPE]: [
      '2 Blade',
      '3 Blade',
      '4 Blade',
      '5 Blade',
      '6 Blade',
    ],

    [BoatSpecificationType.PROP_MATERIAL]: [
      'Alloy',
      'Aluminum',
      'Bronze',
      'Nibril',
      'Other',
      'Stainless Steel',
    ],
  };
