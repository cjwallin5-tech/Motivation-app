import { useEffect, useState } from 'react'
import type { PetState, TaskCategory } from './types'
import { daysBetween, todayKey, yesterdayKey } from './date'
import { ACHIEVEMENTS } from './achievements'
import { ALL_SPECIES, DEFAULT_VARIANT_ID, SPECIES_MILESTONE_INTERVAL, VARIANTS } from './petSpecies'
import { NONE_OUTFIT_ID, OUTFITS } from './outfits'
import { COINS_PER_TASK, DECOR_ITEMS } from './decor'
import { prestigeTierForLevel } from './prestige'
import { CLASSIC_TREAT_ID, TREATS } from './treats'
import { CLASSIC_TOY_ID, TOYS } from './toys'
import { profileKey } from './profiles'

const POINTS_PER_TASK = 10
// Deliberately paced so a level takes a couple of days even for an engaged user, not one busy
// afternoon — see DAILY_XP_CAP below for the hard backstop against adding a pile of tasks to
// blow through levels in a single sitting.
const POINTS_PER_LEVEL = 200
// The most XP any single day can contribute toward a level, regardless of how many tasks get
// completed. Extra completions past this still mark done, still count for streak/coins/heatmap/
// achievements — only the level-relevant XP stops, so this never costs anyone their streak or
// their sense of having gotten something done today.
const DAILY_XP_CAP = 120
const MAX_GRACE_TOKENS = 3
const GRACE_MILESTONE_INTERVAL = 7
const BONUS_CHANCE = 0.15
const BONUS_MIN_POINTS = 5
const BONUS_MAX_POINTS = 20
const RARE_BONUS_CHANCE = 0.03
const RARE_BONUS_MIN_POINTS = 25
const RARE_BONUS_MAX_POINTS = 40
// If nothing has triggered a bonus in this many completions, the next one is guaranteed
// a small bonus — keeps a run of bad luck from feeling like the game stopped rewarding you.
const PITY_THRESHOLD = 8
// A gap this long (or longer) since the last completion counts as a real absence, not just
// "yesterday" — the first task back gets a welcome-back bonus instead of the normal roll.
const WELCOME_BACK_GAP_DAYS = 3
const WELCOME_BACK_MIN_POINTS = 15
const WELCOME_BACK_MAX_POINTS = 25
// Every this-many completions, surface a gentle reflection message instead of (or alongside) the
// usual reward feedback — a quiet reminder that the record is for the player's own benefit, not
// a score to game. See reflections.ts for why this is the honesty lever instead of verification.
const REFLECTION_INTERVAL = 12

export type BonusTier = 'none' | 'small' | 'rare' | 'welcome'

export interface CompleteTaskResult {
  points: number
  bonusTier: BonusTier
  /** True if DAILY_XP_CAP reduced the points actually awarded below what the roll would've given. */
  capped: boolean
  /** True on every REFLECTION_INTERVAL-th completion — App.tsx shows a reflection message. */
  showReflection: boolean
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Picks up to `count` random ids from `pool`, order unimportant. */
function pickRandom(pool: string[], count: number): string[] {
  const copy = [...pool]
  const picked: string[] = []
  while (copy.length > 0 && picked.length < count) {
    const i = Math.floor(Math.random() * copy.length)
    picked.push(copy.splice(i, 1)[0])
  }
  return picked
}

const DEFAULT_STATE: PetState = {
  name: 'Ember',
  totalPoints: 0,
  streak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  graceTokens: 1,
  highestGraceMilestone: 0,
  lastGraceUsed: null,
  noBonusStreak: 0,
  totalTasksCompleted: 0,
  welcomeBackCount: 0,
  rareBonusCount: 0,
  unlockedAchievements: [],
  speciesId: '',
  unlockedSpecies: [],
  speciesVariant: {},
  lastSpeciesMilestone: 0,
  pendingSpeciesChoice: null,
  unlockedOutfits: [],
  outfitBySpecies: {},
  minigameBestScore: 0,
  dailyActivity: {},
  categoryActivity: {},
  coins: 0,
  unlockedDecor: [],
  placedDecor: [],
  highestPrestigeLevel: 0,
  unlockedTreats: [CLASSIC_TREAT_ID],
  equippedTreatId: CLASSIC_TREAT_ID,
  unlockedToys: [CLASSIC_TOY_ID],
  equippedToyId: CLASSIC_TOY_ID,
  dailyXpDate: null,
  dailyXpEarned: 0,
}

// The species everyone's companion looked like before other companions existed — existing
// players keep this look automatically instead of being asked to pick on their next visit.
const LEGACY_SPECIES_ID = 'moss'

// Keeps placed decor within the room's drag-safe area — clear of the top HUD overlay and the
// bottom feed/play action row.
const DECOR_X_MIN = 6
const DECOR_X_MAX = 94
const DECOR_Y_MIN = 20
const DECOR_Y_MAX = 82

// Spread-out starting spots for newly placed decor, so buying or adding several items in a row
// doesn't stack them on top of each other before the player has a chance to drag them apart.
const DECOR_DEFAULT_SLOTS: { x: number; y: number }[] = [
  { x: 84, y: 60 },
  { x: 14, y: 30 },
  { x: 80, y: 26 },
  { x: 18, y: 66 },
  { x: 50, y: 22 },
  { x: 60, y: 72 },
]

function clampPercent(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export type PetStage = 'egg' | 'hatchling' | 'dragon'
export type PetMood = 'cozy' | 'content' | 'excited'

function load(storageKey: string): PetState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as PetState & { equippedDecorId?: string | null }
    const merged = { ...DEFAULT_STATE, ...parsed } as PetState
    // Migrate the old single-equipped decor field into the new placed-items list.
    if (merged.placedDecor.length === 0 && parsed.equippedDecorId) {
      const slot = DECOR_DEFAULT_SLOTS[0]
      merged.placedDecor = [{ id: parsed.equippedDecorId, x: slot.x, y: slot.y }]
    }
    if (!merged.speciesId && merged.lastCompletionDate !== null) {
      merged.speciesId = LEGACY_SPECIES_ID
      merged.unlockedSpecies = merged.unlockedSpecies.length
        ? merged.unlockedSpecies
        : [LEGACY_SPECIES_ID]
    }
    // Backfill a default color for any unlocked species saved before variants existed.
    const missingVariants = merged.unlockedSpecies.filter((id) => !merged.speciesVariant[id])
    if (missingVariants.length > 0) {
      merged.speciesVariant = { ...merged.speciesVariant }
      for (const id of missingVariants) merged.speciesVariant[id] = DEFAULT_VARIANT_ID
    }
    return merged
  } catch {
    return DEFAULT_STATE
  }
}

export function levelForPoints(points: number): number {
  return 1 + Math.floor(points / POINTS_PER_LEVEL)
}

export function stageForLevel(level: number): PetStage {
  if (level <= 1) return 'egg'
  if (level <= 4) return 'hatchling'
  return 'dragon'
}

export function usePet(profileId: string) {
  const [storageKey] = useState(() => profileKey(profileId, 'pet'))
  const [state, setState] = useState<PetState>(() => load(storageKey))

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  // Reconciles the permanent achievement record against current progress. Only ever adds ids,
  // so an achievement stays earned even if the state that unlocked it later changes (e.g. undo).
  useEffect(() => {
    const newly = ACHIEVEMENTS.filter(
      (a) => !state.unlockedAchievements.includes(a.id) && a.check(state),
    )
    if (newly.length === 0) return
    setState((prev) => ({
      ...prev,
      unlockedAchievements: [...prev.unlockedAchievements, ...newly.map((a) => a.id)],
    }))
  }, [state])

  // Unlocks outfits automatically as the level crosses each one's threshold — a second,
  // faster-cadence level-up reward alongside the new-companion track, needing no decision from
  // the player (they equip whenever they like via the Companions panel).
  useEffect(() => {
    const level = levelForPoints(state.totalPoints)
    const newly = OUTFITS.filter((o) => level >= o.unlockLevel && !state.unlockedOutfits.includes(o.id))
    if (newly.length === 0) return
    setState((prev) => ({
      ...prev,
      unlockedOutfits: [...prev.unlockedOutfits, ...newly.map((o) => o.id)],
    }))
  }, [state.totalPoints, state.unlockedOutfits])

  // Unlocks treats and toys automatically as the level crosses each one's threshold — same
  // no-decision-needed pattern as outfits, just for the Feed/Play interaction instead of looks.
  useEffect(() => {
    const level = levelForPoints(state.totalPoints)
    const newTreats = TREATS.filter((t) => level >= t.unlockLevel && !state.unlockedTreats.includes(t.id))
    const newToys = TOYS.filter((t) => level >= t.unlockLevel && !state.unlockedToys.includes(t.id))
    if (newTreats.length === 0 && newToys.length === 0) return
    setState((prev) => ({
      ...prev,
      unlockedTreats: [...prev.unlockedTreats, ...newTreats.map((t) => t.id)],
      unlockedToys: [...prev.unlockedToys, ...newToys.map((t) => t.id)],
    }))
  }, [state.totalPoints, state.unlockedTreats, state.unlockedToys])

  // Advances the prestige tier once the authored content (companions, outfits) is behind you —
  // an infinite title+color track that never runs out of new content to hand-author, since it's
  // generated, not designed. Permanent once reached, like the other unlock tracks.
  useEffect(() => {
    const level = levelForPoints(state.totalPoints)
    const tier = prestigeTierForLevel(level)
    if (!tier || tier.level <= state.highestPrestigeLevel) return
    setState((prev) => (tier.level > prev.highestPrestigeLevel ? { ...prev, highestPrestigeLevel: tier.level } : prev))
  }, [state.totalPoints, state.highestPrestigeLevel])

  // Offers a new companion to choose every SPECIES_MILESTONE_INTERVAL levels — a recurring,
  // long-horizon reason to keep leveling up. Never interrupts task flow: the choice just sits
  // available (via the Companions panel) until the player picks one, and it survives reloads.
  useEffect(() => {
    if (!state.speciesId || state.pendingSpeciesChoice) return
    const level = levelForPoints(state.totalPoints)
    const nextMilestone = state.lastSpeciesMilestone + SPECIES_MILESTONE_INTERVAL
    if (level < nextMilestone) return
    const locked = ALL_SPECIES.map((s) => s.id).filter((id) => !state.unlockedSpecies.includes(id))
    if (locked.length === 0) return
    const options = pickRandom(locked, Math.min(2, locked.length))
    setState((prev) =>
      prev.pendingSpeciesChoice ? prev : { ...prev, pendingSpeciesChoice: { level: nextMilestone, options } },
    )
  }, [state.speciesId, state.pendingSpeciesChoice, state.lastSpeciesMilestone, state.unlockedSpecies, state.totalPoints])

  function completeTask(category?: TaskCategory | null): CompleteTaskResult {
    let result: CompleteTaskResult = {
      points: POINTS_PER_TASK,
      bonusTier: 'none',
      capped: false,
      showReflection: false,
    }

    setState((prev) => {
      const today = todayKey()
      const isReturning =
        prev.lastCompletionDate !== null &&
        prev.lastCompletionDate !== today &&
        daysBetween(prev.lastCompletionDate, today) >= WELCOME_BACK_GAP_DAYS

      let bonusTier: BonusTier = 'none'
      if (isReturning) {
        bonusTier = 'welcome'
      } else {
        const roll = Math.random()
        if (roll < RARE_BONUS_CHANCE) bonusTier = 'rare'
        else if (roll < RARE_BONUS_CHANCE + BONUS_CHANCE) bonusTier = 'small'

        // pity timer: force a small bonus once the dry spell gets too long
        if (bonusTier === 'none' && prev.noBonusStreak + 1 >= PITY_THRESHOLD) {
          bonusTier = 'small'
        }
      }
      const noBonusStreak = bonusTier === 'none' ? prev.noBonusStreak + 1 : 0

      const bonusAmount =
        bonusTier === 'welcome'
          ? randomInt(WELCOME_BACK_MIN_POINTS, WELCOME_BACK_MAX_POINTS)
          : bonusTier === 'rare'
            ? randomInt(RARE_BONUS_MIN_POINTS, RARE_BONUS_MAX_POINTS)
            : bonusTier === 'small'
              ? randomInt(BONUS_MIN_POINTS, BONUS_MAX_POINTS)
              : 0
      const rolledPoints = POINTS_PER_TASK + bonusAmount

      // Cap how much XP a single day can contribute toward a level. Everything else about the
      // completion still happens normally (streak, coins, heatmap, achievements) — only the
      // level-relevant points stop, so hitting the cap never costs anyone their streak.
      const dailyXpSoFar = prev.dailyXpDate === today ? prev.dailyXpEarned : 0
      const remainingCap = Math.max(0, DAILY_XP_CAP - dailyXpSoFar)
      const points = Math.min(rolledPoints, remainingCap)
      const capped = points < rolledPoints
      const showReflection = (prev.totalTasksCompleted + 1) % REFLECTION_INTERVAL === 0
      result = { points, bonusTier, capped, showReflection }

      const dailyActivity = {
        ...prev.dailyActivity,
        [today]: (prev.dailyActivity[today] ?? 0) + 1,
      }
      const categoryActivity = category
        ? { ...prev.categoryActivity, [category]: (prev.categoryActivity[category] ?? 0) + 1 }
        : prev.categoryActivity

      if (prev.lastCompletionDate === today) {
        // already logged activity today, streak unchanged
        return {
          ...prev,
          totalPoints: prev.totalPoints + points,
          coins: prev.coins + COINS_PER_TASK,
          dailyActivity,
          categoryActivity,
          dailyXpDate: today,
          dailyXpEarned: dailyXpSoFar + points,
          noBonusStreak,
          totalTasksCompleted: prev.totalTasksCompleted + 1,
          welcomeBackCount: prev.welcomeBackCount + (bonusTier === 'welcome' ? 1 : 0),
          rareBonusCount: prev.rareBonusCount + (bonusTier === 'rare' ? 1 : 0),
        }
      }

      let streak: number
      let graceTokens = prev.graceTokens
      let lastGraceUsed = prev.lastGraceUsed

      if (prev.lastCompletionDate === null) {
        streak = 1
      } else {
        const gap = daysBetween(prev.lastCompletionDate, today)
        if (gap === 1) {
          streak = prev.streak + 1
        } else if (gap === 2 && prev.graceTokens > 0) {
          // exactly one full day was missed — spend a grace token to keep the streak alive
          streak = prev.streak + 1
          graceTokens -= 1
          lastGraceUsed = today
        } else {
          // streak lapsed with no grace token to cover it — soften the fall instead of wiping
          // it out, so a rough week doesn't erase months of progress in one keystroke
          streak = Math.max(1, Math.floor(prev.streak / 2))
        }
      }

      let highestGraceMilestone = prev.highestGraceMilestone
      if (streak > highestGraceMilestone && streak % GRACE_MILESTONE_INTERVAL === 0) {
        graceTokens = Math.min(graceTokens + 1, MAX_GRACE_TOKENS)
        highestGraceMilestone = streak
      }

      return {
        ...prev,
        totalPoints: prev.totalPoints + points,
        coins: prev.coins + COINS_PER_TASK,
        dailyActivity,
        categoryActivity,
        dailyXpDate: today,
        dailyXpEarned: dailyXpSoFar + points,
        streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastCompletionDate: today,
        graceTokens,
        highestGraceMilestone,
        lastGraceUsed,
        noBonusStreak,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        welcomeBackCount: prev.welcomeBackCount + (bonusTier === 'welcome' ? 1 : 0),
        rareBonusCount: prev.rareBonusCount + (bonusTier === 'rare' ? 1 : 0),
      }
    })

    return result
  }

  function undoTask(points: number, category?: TaskCategory | null) {
    setState((prev) => {
      const today = todayKey()
      const dailyActivity = { ...prev.dailyActivity }
      if (dailyActivity[today]) dailyActivity[today] = Math.max(0, dailyActivity[today] - 1)
      const categoryActivity =
        category && prev.categoryActivity[category]
          ? { ...prev.categoryActivity, [category]: Math.max(0, prev.categoryActivity[category]! - 1) }
          : prev.categoryActivity
      const dailyXpEarned =
        prev.dailyXpDate === today ? Math.max(0, prev.dailyXpEarned - points) : prev.dailyXpEarned
      return {
        ...prev,
        totalPoints: Math.max(0, prev.totalPoints - points),
        coins: Math.max(0, prev.coins - COINS_PER_TASK),
        dailyXpEarned,
        dailyActivity,
        categoryActivity,
        totalTasksCompleted: Math.max(0, prev.totalTasksCompleted - 1),
      }
    })
  }

  function rename(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setState((prev) => ({ ...prev, name: trimmed }))
  }

  function chooseStarterSpecies(id: string, name: string, variantId: string = DEFAULT_VARIANT_ID) {
    const trimmed = name.trim()
    const variant = VARIANTS.some((v) => v.id === variantId) ? variantId : DEFAULT_VARIANT_ID
    setState((prev) =>
      prev.speciesId
        ? prev
        : {
            ...prev,
            speciesId: id,
            unlockedSpecies: [id],
            speciesVariant: { ...prev.speciesVariant, [id]: variant },
            name: trimmed || prev.name,
          },
    )
  }

  function resolveSpeciesChoice(id: string) {
    setState((prev) => {
      if (!prev.pendingSpeciesChoice || !prev.pendingSpeciesChoice.options.includes(id)) return prev
      return {
        ...prev,
        speciesId: id,
        unlockedSpecies: [...prev.unlockedSpecies, id],
        speciesVariant: { ...prev.speciesVariant, [id]: DEFAULT_VARIANT_ID },
        lastSpeciesMilestone: prev.pendingSpeciesChoice.level,
        pendingSpeciesChoice: null,
      }
    })
  }

  function switchSpecies(id: string) {
    setState((prev) => (prev.unlockedSpecies.includes(id) ? { ...prev, speciesId: id } : prev))
  }

  function setSpeciesVariant(speciesId: string, variantId: string) {
    setState((prev) => {
      if (!prev.unlockedSpecies.includes(speciesId)) return prev
      if (!VARIANTS.some((v) => v.id === variantId)) return prev
      return { ...prev, speciesVariant: { ...prev.speciesVariant, [speciesId]: variantId } }
    })
  }

  function setOutfit(speciesId: string, outfitId: string) {
    setState((prev) => {
      if (!prev.unlockedSpecies.includes(speciesId)) return prev
      if (outfitId !== NONE_OUTFIT_ID && !prev.unlockedOutfits.includes(outfitId)) return prev
      return { ...prev, outfitBySpecies: { ...prev.outfitBySpecies, [speciesId]: outfitId } }
    })
  }

  function recordMinigameScore(score: number) {
    setState((prev) => (score > prev.minigameBestScore ? { ...prev, minigameBestScore: score } : prev))
  }

  function purchaseDecor(id: string) {
    setState((prev) => {
      if (prev.unlockedDecor.includes(id)) return prev
      const item = DECOR_ITEMS.find((d) => d.id === id)
      if (!item || prev.coins < item.cost) return prev
      const slot = DECOR_DEFAULT_SLOTS[prev.placedDecor.length % DECOR_DEFAULT_SLOTS.length]
      return {
        ...prev,
        coins: prev.coins - item.cost,
        unlockedDecor: [...prev.unlockedDecor, id],
        placedDecor: [...prev.placedDecor, { id, x: slot.x, y: slot.y }],
      }
    })
  }

  /** Puts an already-owned item back in the room at a default spot, if it isn't placed already. */
  function addDecorToRoom(id: string) {
    setState((prev) => {
      if (!prev.unlockedDecor.includes(id) || prev.placedDecor.some((p) => p.id === id)) return prev
      const slot = DECOR_DEFAULT_SLOTS[prev.placedDecor.length % DECOR_DEFAULT_SLOTS.length]
      return { ...prev, placedDecor: [...prev.placedDecor, { id, x: slot.x, y: slot.y }] }
    })
  }

  function removeDecorFromRoom(id: string) {
    setState((prev) => ({ ...prev, placedDecor: prev.placedDecor.filter((p) => p.id !== id) }))
  }

  function moveDecor(id: string, x: number, y: number) {
    setState((prev) => {
      const clamped = { x: clampPercent(x, DECOR_X_MIN, DECOR_X_MAX), y: clampPercent(y, DECOR_Y_MIN, DECOR_Y_MAX) }
      return {
        ...prev,
        placedDecor: prev.placedDecor.map((p) => (p.id === id ? { ...p, ...clamped } : p)),
      }
    })
  }

  function setTreat(id: string) {
    setState((prev) => (prev.unlockedTreats.includes(id) ? { ...prev, equippedTreatId: id } : prev))
  }

  function setToy(id: string) {
    setState((prev) => (prev.unlockedToys.includes(id) ? { ...prev, equippedToyId: id } : prev))
  }

  const today = todayKey()
  const activeToday = state.lastCompletionDate === today
  const effectiveStreak =
    state.lastCompletionDate === today || state.lastCompletionDate === yesterdayKey()
      ? state.streak
      : 0

  // Purely cosmetic — never shown as a labeled stat, just shifts the idle animation. 'cozy' means
  // it's been a couple of quiet days (or the very start), never framed as disappointment.
  const daysSinceActive = state.lastCompletionDate ? daysBetween(state.lastCompletionDate, today) : null
  const mood: PetMood =
    daysSinceActive === null || daysSinceActive >= 2
      ? 'cozy'
      : (state.dailyActivity[today] ?? 0) >= 2
        ? 'excited'
        : 'content'

  const level = levelForPoints(state.totalPoints)
  const stage = stageForLevel(level)
  const progress = state.totalPoints % POINTS_PER_LEVEL
  const prestigeTier = prestigeTierForLevel(state.highestPrestigeLevel)

  return {
    state,
    completeTask,
    undoTask,
    rename,
    chooseStarterSpecies,
    resolveSpeciesChoice,
    switchSpecies,
    setSpeciesVariant,
    setOutfit,
    recordMinigameScore,
    purchaseDecor,
    addDecorToRoom,
    removeDecorFromRoom,
    moveDecor,
    setTreat,
    setToy,
    level,
    stage,
    prestigeTier,
    progress,
    pointsToNext: POINTS_PER_LEVEL - progress,
    effectiveStreak,
    activeToday,
    mood,
    hasStarted: state.lastCompletionDate !== null,
    longestStreak: state.longestStreak,
  }
}
