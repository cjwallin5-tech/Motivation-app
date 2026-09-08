export interface Outfit {
  id: string
  name: string
  description: string
  /** The level a player's overall progress unlocks this outfit for every companion. */
  unlockLevel: number
}

// Cosmetic level-up rewards — unlocked automatically as you level, independent of the every-5-
// level new-companion track. Every unlocked outfit can be worn by any companion (equipped per
// species in PetState.outfitBySpecies), so this is a second, faster-cadence reason to level up.
export const OUTFITS: Outfit[] = [
  {
    id: 'bandana',
    name: 'Bandana',
    description: 'A little neckerchief.',
    unlockLevel: 3,
  },
  {
    id: 'bow',
    name: 'Bow',
    description: 'A bow for the occasion.',
    unlockLevel: 8,
  },
  {
    id: 'crown',
    name: 'Crown',
    description: 'Royalty has entered the room.',
    unlockLevel: 14,
  },
  {
    id: 'scarf',
    name: 'Scarf',
    description: 'Cozy for any weather.',
    unlockLevel: 20,
  },
  {
    id: 'party_hat',
    name: 'Party Hat',
    description: 'Every day is worth celebrating.',
    unlockLevel: 26,
  },
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    description: 'A touch of magic.',
    unlockLevel: 32,
  },
  {
    id: 'cape',
    name: 'Cape',
    description: 'A hero, right here.',
    unlockLevel: 38,
  },
]

export const OUTFITS_BY_ID: Record<string, Outfit> = Object.fromEntries(
  OUTFITS.map((o) => [o.id, o]),
)

export const NONE_OUTFIT_ID = 'none'
