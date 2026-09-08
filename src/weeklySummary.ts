import { dateKey } from './date'

export interface WeekStats {
  activeDays: number
  taskCount: number
}

/** Sunday-start YYYY-MM-DD key for the week containing `date`, matching the History heatmap's week grid. */
export function weekStartKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return dateKey(d)
}

/** Stats for `dayCount` days starting at `startKey` (inclusive) — pass fewer than 7 for an in-progress week. */
export function computeWeekStats(
  dailyActivity: Record<string, number>,
  startKey: string,
  dayCount = 7,
): WeekStats {
  const start = new Date(`${startKey}T00:00:00`)
  let activeDays = 0
  let taskCount = 0
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const count = dailyActivity[dateKey(d)] ?? 0
    if (count > 0) activeDays++
    taskCount += count
  }
  return { activeDays, taskCount }
}

// Tiered by how many of the counted days had any activity, but every tier stays supportive —
// there's no version of this message meant to sting, even at zero. See reflections.ts for why:
// a self-reported record only works when it doesn't feel like something to be graded on.
export function weeklyRecapMessage({ activeDays, taskCount }: WeekStats, dayCount: number): string {
  if (dayCount <= 0) return ''
  if (activeDays === 0) {
    return 'A quiet week. Whenever you’re ready, this is still here for you.'
  }
  if (activeDays === dayCount) {
    return `Every day counted this week — ${taskCount} task${taskCount === 1 ? '' : 's'} done. Nicely kept.`
  }
  if (activeDays >= dayCount / 2) {
    return `A solid week — ${activeDays} of ${dayCount} days moving, ${taskCount} task${taskCount === 1 ? '' : 's'} total.`
  }
  return `A lighter week — ${activeDays} of ${dayCount} days, and that still counts.`
}
