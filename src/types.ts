export type TaskRecurrence = 'none' | 'daily' | 'weekly'
export type TaskSource = 'user' | 'auto' | 'anchor'
export type TaskBucket = 'today' | 'someday'
export type TaskCategory = 'chores' | 'health' | 'work' | 'social' | 'selfCare' | 'creative'

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: number
  completedAt: number | null
  recurrence: TaskRecurrence
  /** 'someday' = a low-pressure backlog item, kept out of Today's list and progress count.
   *  Only meaningful for non-recurring user tasks — recurring/auto/anchor tasks are always 'today'. */
  bucket: TaskBucket
  /** Optional user-picked tag (see categories.ts) — null means uncategorized, never required. */
  category: TaskCategory | null
  /** Days of week (0=Sun..6=Sat) this repeats on; only meaningful when recurrence is 'weekly'. */
  recurDays: number[]
  /** YYYY-MM-DD the `done` flag currently reflects; only meaningful when recurrence is 'daily' or 'weekly'. */
  lastResetDate: string | null
  /** 'auto' = a system-suggested wellness prompt, regenerated daily; 'anchor' = the one
   *  always-available, never-deletable tiny win. Neither is ever user-typed. */
  source: TaskSource
  /** Points actually awarded for the current `done` state — undo must refund exactly this, since bonus rolls vary. Null when not done. */
  pointsAwarded: number | null
}

export interface PlacedDecor {
  id: string
  /** Percent of the room's width/height, top-left origin (0-100). */
  x: number
  y: number
}

export interface PetState {
  name: string
  totalPoints: number
  streak: number
  longestStreak: number
  lastCompletionDate: string | null
  /** Banked streak freezes; consuming one covers a single fully-missed day. */
  graceTokens: number
  /** Highest streak length a grace token has already been awarded for, so milestones aren't double-paid. */
  highestGraceMilestone: number
  /** YYYY-MM-DD a grace token was last spent, so the UI can show a one-time "streak freeze used" toast. */
  lastGraceUsed: string | null
  /** Consecutive completions with no bonus; a pity timer forces a bonus once this gets too high. */
  noBonusStreak: number
  /** Lifetime count of task completions; decremented on undo, unlike the permanent achievement record. */
  totalTasksCompleted: number
  /** Lifetime count of welcome-back bonuses received. Never decremented, even on undo. */
  welcomeBackCount: number
  /** Lifetime count of rare bonuses received. Never decremented, even on undo. */
  rareBonusCount: number
  /** Ids of achievements ever earned. Never removed, even if the state that earned them later changes. */
  unlockedAchievements: string[]
  /** Id (from petSpecies.ts) of the companion currently shown in the room. Empty until the player picks a starter. */
  speciesId: string
  /** Ids of every companion species unlocked so far, including the active one. */
  unlockedSpecies: string[]
  /** Chosen color-variant id per unlocked species (from petSpecies.ts VARIANTS). Missing entries default to 'classic'. */
  speciesVariant: Record<string, string>
  /** Highest level milestone a new-companion choice has already been offered (and resolved) for. */
  lastSpeciesMilestone: number
  /** A new-companion choice waiting to be resolved — persists across reloads until the player picks one. */
  pendingSpeciesChoice: { level: number; options: string[] } | null
  /** Ids of outfits unlocked so far (from outfits.ts) — usable by any companion, not tied to a species. */
  unlockedOutfits: string[]
  /** Equipped outfit id per species (missing/'none' = unequipped). Independent per companion, like speciesVariant. */
  outfitBySpecies: Record<string, string>
  /** Best score ever reached in the catch minigame, purely for a personal-best display. */
  minigameBestScore: number
  /** Tasks completed per YYYY-MM-DD, kept forever — powers the History heatmap. Decremented on undo. */
  dailyActivity: Record<string, number>
  /** Completions per TaskCategory, all-time — powers the History tab's category breakdown. Decremented on undo. Only categorized completions count, so this never sums to totalTasksCompleted. */
  categoryActivity: Partial<Record<TaskCategory, number>>
  /** Spendable currency, separate from totalPoints/XP so spending it can never lower your level or stage. */
  coins: number
  /** Ids of decor items purchased in the shop (from decor.ts). Owned permanently once bought. */
  unlockedDecor: string[]
  /** Owned decor items currently placed in the room, each at its own free-form position — an
   *  owned item appears here at most once. Replaces the old single equippedDecorId. */
  placedDecor: PlacedDecor[]
  /** Highest prestige tier level reached (see prestige.ts) — permanent, like the other unlock tracks. */
  highestPrestigeLevel: number
  /** Ids of treats unlocked so far (from treats.ts), always includes 'classic'. */
  unlockedTreats: string[]
  /** Which unlocked treat is currently used for the Feed interaction. */
  equippedTreatId: string
  /** Ids of toys unlocked so far (from toys.ts), always includes 'classic'. */
  unlockedToys: string[]
  /** Which unlocked toy is currently used for the Play interaction. */
  equippedToyId: string
  /** YYYY-MM-DD that dailyXpEarned reflects — resets the counter when the date moves on. */
  dailyXpDate: string | null
  /** XP earned toward totalPoints so far today, capped at DAILY_XP_CAP regardless of how many tasks get completed. */
  dailyXpEarned: number
}
