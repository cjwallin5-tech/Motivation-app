// Once all the authored level-gated content (companions unlock through level 35, outfits
// through level 14) is exhausted, prestige tiers keep leveling up meaningful forever — a title
// and a color, nothing that needs new art, so it can never "run out" the way finite unlockables
// eventually do.
const PRESTIGE_START_LEVEL = 40
const PRESTIGE_INTERVAL = 10

export interface PrestigeTier {
  /** The level this tier was reached at. */
  level: number
  name: string
  color: string
}

// Cycles through these names, appending a roman numeral once a full cycle completes (so level
// 40 is "Veteran", level 110 is "Veteran II", level 180 is "Veteran III", and so on forever).
const TIER_THEMES: { name: string; color: string }[] = [
  { name: 'Veteran', color: '#b08d57' }, // bronze
  { name: 'Elder', color: '#9aa5b1' }, // silver
  { name: 'Sage', color: '#e8b240' }, // gold
  { name: 'Luminary', color: '#7fb3d5' }, // platinum
  { name: 'Paragon', color: '#a06be0' }, // amethyst
  { name: 'Legend', color: '#e0567a' }, // ruby
  { name: 'Mythic', color: '#4fd1c5' }, // diamond
]

function toRoman(n: number): string {
  const numerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let remaining = n
  let result = ''
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

/** The prestige tier reached at (or most recently reached below) `level`, or null before level 40. */
export function prestigeTierForLevel(level: number): PrestigeTier | null {
  if (level < PRESTIGE_START_LEVEL) return null
  const index = Math.floor((level - PRESTIGE_START_LEVEL) / PRESTIGE_INTERVAL)
  const tierLevel = PRESTIGE_START_LEVEL + index * PRESTIGE_INTERVAL
  const theme = TIER_THEMES[index % TIER_THEMES.length]
  const cycle = Math.floor(index / TIER_THEMES.length) + 1
  const name = cycle > 1 ? `${theme.name} ${toRoman(cycle)}` : theme.name
  return { level: tierLevel, name, color: theme.color }
}
