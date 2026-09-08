export interface SpeciesVariant {
  id: string
  name: string
}

/** Color schemes every species ships in — same list, same order, for all of them. */
export const VARIANTS: SpeciesVariant[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'vivid', name: 'Vivid' },
  { id: 'pastel', name: 'Pastel' },
]

export const DEFAULT_VARIANT_ID = VARIANTS[0].id

export interface PetSpecies {
  id: string
  name: string
  /** The animal this species actually is — shown as a subtitle in pickers. */
  animal: string
  tagline: string
  /** UI accent color for cards/highlights — matches the sprite's palette. */
  accent: string
  /** Offered in the very first choose-your-companion screen. */
  isStarter: boolean
}

export const ALL_SPECIES: PetSpecies[] = [
  {
    id: 'moss',
    name: 'Moss',
    animal: 'Dragon',
    tagline: 'Steady and grounded — grows with quiet patience.',
    accent: '#2b8a60',
    isStarter: true,
  },
  {
    id: 'cinder',
    name: 'Cinder',
    animal: 'Fox',
    tagline: 'Warm and quick to spark — dashes after every streak.',
    accent: '#d65a40',
    isStarter: true,
  },
  {
    id: 'marine',
    name: 'Marine',
    animal: 'Otter',
    tagline: 'Cool and easygoing — flows around whatever comes up.',
    accent: '#3a8ca8',
    isStarter: true,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    animal: 'Cat',
    tagline: 'A little mysterious — shows up right when you need it.',
    accent: '#8c66d6',
    isStarter: false,
  },
  {
    id: 'solstice',
    name: 'Solstice',
    animal: 'Chick',
    tagline: 'Bright and sunny — cheers loudest for small wins.',
    accent: '#e8b240',
    isStarter: false,
  },
  {
    id: 'frost',
    name: 'Frost',
    animal: 'Bunny',
    tagline: 'Calm under pressure — hops along at its own pace.',
    accent: '#7fb3d5',
    isStarter: false,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    animal: 'Bat',
    tagline: 'Quiet and sturdy — unbothered by rough days.',
    accent: '#5a4e74',
    isStarter: false,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    animal: 'Hedgehog',
    tagline: 'Soft and encouraging — celebrates every small win.',
    accent: '#e88ca8',
    isStarter: false,
  },
]

export const STARTER_SPECIES = ALL_SPECIES.filter((s) => s.isStarter)

export const SPECIES_BY_ID: Record<string, PetSpecies> = Object.fromEntries(
  ALL_SPECIES.map((s) => [s.id, s]),
)

/** Level gap between each new-companion choice — a repeating, long-horizon reason to keep leveling. */
export const SPECIES_MILESTONE_INTERVAL = 5
