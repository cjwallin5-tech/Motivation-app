export interface ToyItem {
  id: string
  name: string
  unlockLevel: number
}

// The original striped ball — always available, never re-locked, matches the existing /pet/toy.png.
export const CLASSIC_TOY_ID = 'classic'

// More toys to play with, unlocked automatically as you level (like outfits).
export const TOYS: ToyItem[] = [
  { id: 'bone', name: 'Chew Bone', unlockLevel: 6 },
  { id: 'yarn', name: 'Yarn Ball', unlockLevel: 13 },
  { id: 'frisbee', name: 'Frisbee', unlockLevel: 22 },
]

export const TOYS_BY_ID: Record<string, ToyItem> = Object.fromEntries(TOYS.map((t) => [t.id, t]))
