export interface DecorItem {
  id: string
  name: string
  description: string
  /** Cost in coins — a currency separate from XP, so spending it never touches your level. */
  cost: number
}

// A small shop for the room, spending coins earned alongside XP on every completed task.
// Any number of owned items can be placed in the room at once, each at its own dragged position.
export const DECOR_ITEMS: DecorItem[] = [
  {
    id: 'rug',
    name: 'Cozy Rug',
    description: 'Ties the room together.',
    cost: 15,
  },
  {
    id: 'plant',
    name: 'Potted Plant',
    description: 'A little more green.',
    cost: 20,
  },
  {
    id: 'lantern',
    name: 'Lantern',
    description: 'Warm light for the evenings.',
    cost: 25,
  },
  {
    id: 'cushion',
    name: 'Floor Cushion',
    description: 'Somewhere comfy to sit.',
    cost: 30,
  },
]

export const DECOR_BY_ID: Record<string, DecorItem> = Object.fromEntries(
  DECOR_ITEMS.map((d) => [d.id, d]),
)

// Coins earned per completed task — flat, unlike XP's variable bonus rolls, so undo can always
// refund exactly this without needing to store a per-task amount.
export const COINS_PER_TASK = 3
