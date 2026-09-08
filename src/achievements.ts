import type { PetState } from './types'
import { levelForPoints, stageForLevel } from './usePet'
import { ALL_SPECIES } from './petSpecies'
import { OUTFITS } from './outfits'
import { DECOR_ITEMS } from './decor'
import { TREATS } from './treats'
import { TOYS } from './toys'

export interface Achievement {
  id: string
  title: string
  description: string
  check: (state: PetState) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  // --- Tasks completed ---
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first task.',
    check: (s) => s.totalTasksCompleted >= 1,
  },
  {
    id: 'five-tasks',
    title: 'Warming Up',
    description: 'Complete 5 tasks.',
    check: (s) => s.totalTasksCompleted >= 5,
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Complete 10 tasks.',
    check: (s) => s.totalTasksCompleted >= 10,
  },
  {
    id: 'twentyfive-tasks',
    title: 'Building Momentum',
    description: 'Complete 25 tasks.',
    check: (s) => s.totalTasksCompleted >= 25,
  },
  {
    id: 'fifty-tasks',
    title: 'Fifty Strong',
    description: 'Complete 50 tasks.',
    check: (s) => s.totalTasksCompleted >= 50,
  },
  {
    id: 'hundred-tasks',
    title: 'Triple Digits',
    description: 'Complete 100 tasks.',
    check: (s) => s.totalTasksCompleted >= 100,
  },
  {
    id: 'two-hundred-tasks',
    title: 'Dedicated',
    description: 'Complete 200 tasks.',
    check: (s) => s.totalTasksCompleted >= 200,
  },
  {
    id: 'five-hundred-tasks',
    title: 'Relentless',
    description: 'Complete 500 tasks.',
    check: (s) => s.totalTasksCompleted >= 500,
  },
  {
    id: 'thousand-tasks',
    title: 'Thousand Club',
    description: 'Complete 1,000 tasks.',
    check: (s) => s.totalTasksCompleted >= 1000,
  },

  // --- Streaks ---
  {
    id: 'three-day-streak',
    title: 'Three in a Row',
    description: 'Reach a 3-day streak.',
    check: (s) => s.longestStreak >= 3,
  },
  {
    id: 'week-streak',
    title: 'One Week Strong',
    description: 'Reach a 7-day streak.',
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: 'two-week-streak',
    title: 'Two Weeks In',
    description: 'Reach a 14-day streak.',
    check: (s) => s.longestStreak >= 14,
  },
  {
    id: 'month-streak',
    title: 'One Month Strong',
    description: 'Reach a 30-day streak.',
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: 'sixty-day-streak',
    title: 'Two Months Deep',
    description: 'Reach a 60-day streak.',
    check: (s) => s.longestStreak >= 60,
  },
  {
    id: 'century-streak',
    title: 'Century Streak',
    description: 'Reach a 100-day streak.',
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: 'half-year-streak',
    title: 'Half a Year',
    description: 'Reach a 180-day streak.',
    check: (s) => s.longestStreak >= 180,
  },
  {
    id: 'year-streak',
    title: 'Full Year',
    description: 'Reach a 365-day streak.',
    check: (s) => s.longestStreak >= 365,
  },

  // --- Pet growth ---
  {
    id: 'hatchling',
    title: 'It Hatched!',
    description: 'Your companion hatches from its egg.',
    check: (s) => stageForLevel(levelForPoints(s.totalPoints)) !== 'egg',
  },
  {
    id: 'dragon',
    title: 'Full Grown',
    description: 'Your companion reaches its final grown form.',
    check: (s) => stageForLevel(levelForPoints(s.totalPoints)) === 'dragon',
  },
  {
    id: 'level-10',
    title: 'Rising Star',
    description: 'Reach level 10.',
    check: (s) => levelForPoints(s.totalPoints) >= 10,
  },
  {
    id: 'level-20',
    title: 'Seasoned',
    description: 'Reach level 20.',
    check: (s) => levelForPoints(s.totalPoints) >= 20,
  },
  {
    id: 'level-30',
    title: 'Expert',
    description: 'Reach level 30.',
    check: (s) => levelForPoints(s.totalPoints) >= 30,
  },
  {
    id: 'level-50',
    title: 'Master',
    description: 'Reach level 50.',
    check: (s) => levelForPoints(s.totalPoints) >= 50,
  },
  {
    id: 'level-100',
    title: 'Legend',
    description: 'Reach level 100.',
    check: (s) => levelForPoints(s.totalPoints) >= 100,
  },

  // --- Streak protection ---
  {
    id: 'first-grace',
    title: 'Safety Net',
    description: 'Earn your first streak freeze.',
    check: (s) => s.highestGraceMilestone >= 7,
  },
  {
    id: 'well-protected',
    title: 'Well Protected',
    description: 'Earn three streak freezes.',
    check: (s) => s.highestGraceMilestone >= 21,
  },
  {
    id: 'bounce-back',
    title: 'Bounce Back',
    description: 'Use a streak freeze to protect a streak.',
    check: (s) => s.lastGraceUsed !== null,
  },

  // --- Coming back, no judgment ---
  {
    id: 'welcome-back',
    title: 'Glad You’re Back',
    description: 'Return and complete a task after some time away.',
    check: (s) => s.welcomeBackCount >= 1,
  },
  {
    id: 'welcome-back-veteran',
    title: 'No Judgment Zone',
    description: 'Come back after a break, 3 times. Life happens.',
    check: (s) => s.welcomeBackCount >= 3,
  },
  {
    id: 'lucky-roll',
    title: 'Lucky Roll',
    description: 'Land a rare bonus.',
    check: (s) => s.rareBonusCount >= 1,
  },
  {
    id: 'lucky-roll-veteran',
    title: 'Fortune Favors You',
    description: 'Land 5 rare bonuses.',
    check: (s) => s.rareBonusCount >= 5,
  },

  // --- Companions ---
  {
    id: 'new-friend',
    title: 'Made a Friend',
    description: 'Unlock a second companion.',
    check: (s) => s.unlockedSpecies.length >= 2,
  },
  {
    id: 'full-menagerie',
    title: 'Full Menagerie',
    description: 'Unlock every companion.',
    check: (s) => s.unlockedSpecies.length >= ALL_SPECIES.length,
  },

  // --- Outfits ---
  {
    id: 'first-outfit',
    title: 'Dressed to Impress',
    description: 'Equip an outfit on your companion.',
    check: (s) => Object.values(s.outfitBySpecies).some((id) => id !== 'none'),
  },
  {
    id: 'full-wardrobe',
    title: 'Full Wardrobe',
    description: 'Unlock every outfit.',
    check: (s) => s.unlockedOutfits.length >= OUTFITS.length,
  },

  // --- Minigame ---
  {
    id: 'first-catch',
    title: 'Good Catch',
    description: 'Play the catch minigame with your companion.',
    check: (s) => s.minigameBestScore >= 1,
  },
  {
    id: 'quick-reflexes',
    title: 'Quick Reflexes',
    description: 'Catch 10 treats in a single round.',
    check: (s) => s.minigameBestScore >= 10,
  },

  // --- Decor shop ---
  {
    id: 'first-purchase',
    title: 'Home Improvement',
    description: 'Buy something for the room.',
    check: (s) => s.unlockedDecor.length >= 1,
  },
  {
    id: 'fully-furnished',
    title: 'Fully Furnished',
    description: 'Own every decor item.',
    check: (s) => s.unlockedDecor.length >= DECOR_ITEMS.length,
  },

  // --- Treats & toys ---
  {
    id: 'spoiled-rotten',
    title: 'Spoiled Rotten',
    description: 'Unlock every treat and toy.',
    check: (s) => s.unlockedTreats.length >= TREATS.length + 1 && s.unlockedToys.length >= TOYS.length + 1,
  },
]
