export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateKey(d)
}

/** Whole days between two YYYY-MM-DD keys (b - a), treating both as UTC midnight. */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  const da = Date.parse(`${a}T00:00:00Z`)
  const db = Date.parse(`${b}T00:00:00Z`)
  return Math.round((db - da) / msPerDay)
}

/** 0 (Sun) .. 6 (Sat) for a YYYY-MM-DD key, treated as UTC midnight to match `dateKey`. */
export function dayOfWeek(key: string): number {
  return new Date(`${key}T00:00:00Z`).getUTCDay()
}
