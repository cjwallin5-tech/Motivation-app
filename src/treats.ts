export interface TreatItem {
  id: string
  name: string
  unlockLevel: number
}

// The original apple — always available, never re-locked, matches the existing /pet/treat.png.
export const CLASSIC_TREAT_ID = 'classic'

// More treats to feed your companion, unlocked automatically as you level (like outfits).
export const TREATS: TreatItem[] = [
  { id: 'cookie', name: 'Cookie', unlockLevel: 4 },
  { id: 'carrot', name: 'Carrot', unlockLevel: 11 },
  { id: 'cupcake', name: 'Cupcake', unlockLevel: 18 },
]

export const TREATS_BY_ID: Record<string, TreatItem> = Object.fromEntries(
  TREATS.map((t) => [t.id, t]),
)
