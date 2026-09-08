import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { profileKey } from './profiles'

// One OS-level notification slot, always reflecting whichever profile is currently active — a
// device only ever has one profile's app instance running at a time, so this never conflicts.
const REMINDER_ID = 1001
const DEFAULT_REMINDER_HOUR = 18
// How far past the chosen hour a catch-up nudge can still land — after that, the day's mostly
// over and it waits until tomorrow instead.
const LATE_CUTOFF_SPAN_HOURS = 3
// If the app is opened after the usual hour (but before the cutoff), nudge a little later
// rather than the instant they open the app — this is a check-in prompt, not a popup.
const CATCH_UP_DELAY_MINUTES = 90

export type ReminderTone = 'gentle' | 'minimal' | 'playful'

export const REMINDER_TIME_PRESETS: { hour: number; label: string }[] = [
  { hour: 9, label: 'Morning' },
  { hour: 13, label: 'Midday' },
  { hour: 18, label: 'Evening' },
  { hour: 21, label: 'Night' },
]

export const REMINDER_TONES: { tone: ReminderTone; label: string }[] = [
  { tone: 'gentle', label: 'Gentle' },
  { tone: 'minimal', label: 'Minimal' },
  { tone: 'playful', label: 'Playful' },
]

export interface ReminderContext {
  petName: string
  hasCompletedToday: boolean
  streak: number
  suggestedTask: string | null
}

export function loadReminderHour(profileId: string): number {
  try {
    const raw = localStorage.getItem(profileKey(profileId, 'reminderHour'))
    const n = raw === null ? NaN : Number(raw)
    return Number.isInteger(n) && n >= 0 && n <= 23 ? n : DEFAULT_REMINDER_HOUR
  } catch {
    return DEFAULT_REMINDER_HOUR
  }
}

export function saveReminderHour(profileId: string, hour: number) {
  try {
    localStorage.setItem(profileKey(profileId, 'reminderHour'), String(hour))
  } catch {
    // ignore — worst case the chosen time doesn't persist across launches
  }
}

export function loadReminderTone(profileId: string): ReminderTone {
  try {
    const raw = localStorage.getItem(profileKey(profileId, 'reminderTone'))
    return raw === 'minimal' || raw === 'playful' ? raw : 'gentle'
  } catch {
    return 'gentle'
  }
}

export function saveReminderTone(profileId: string, tone: ReminderTone) {
  try {
    localStorage.setItem(profileKey(profileId, 'reminderTone'), tone)
  } catch {
    // ignore — worst case the chosen tone doesn't persist across launches
  }
}

export function isNotificationsSupported(): boolean {
  return Capacitor.isNativePlatform()
}

export function loadRemindersEnabled(profileId: string): boolean {
  try {
    return localStorage.getItem(profileKey(profileId, 'remindersEnabled')) === 'true'
  } catch {
    return false
  }
}

function saveRemindersEnabled(profileId: string, enabled: boolean) {
  try {
    localStorage.setItem(profileKey(profileId, 'remindersEnabled'), String(enabled))
  } catch {
    // ignore — worst case the toggle doesn't persist across launches
  }
}

/** Requests notification permission and, if granted, turns reminders on. Returns whether they're now active. */
export async function requestReminderPermission(profileId: string): Promise<boolean> {
  if (!isNotificationsSupported()) return false
  const permission = await LocalNotifications.requestPermissions()
  const granted = permission.display === 'granted'
  saveRemindersEnabled(profileId, granted)
  return granted
}

export async function disableDailyReminder(profileId: string): Promise<void> {
  saveRemindersEnabled(profileId, false)
  await cancelReminder()
}

/** Cancels any pending OS notification without touching the enabled/hour/tone preferences — use
 *  this when switching away from a profile so its reminder doesn't fire while it's inactive. */
export async function cancelReminder(): Promise<void> {
  if (!isNotificationsSupported()) return
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
}

/** Today's fire time for the check-in, or null if it's too late in the day to bother. */
function nextFireTime(now: Date, hour: number): Date | null {
  const usual = new Date(now)
  usual.setHours(hour, 0, 0, 0)
  if (usual > now) return usual
  const lateCutoffHour = Math.min(23, hour + LATE_CUTOFF_SPAN_HOURS)
  if (now.getHours() < lateCutoffHour) {
    return new Date(now.getTime() + CATCH_UP_DELAY_MINUTES * 60_000)
  }
  return null
}

function buildMessage(ctx: ReminderContext, tone: ReminderTone): string {
  if (tone === 'minimal') {
    return ctx.suggestedTask
      ? `Still open: “${ctx.suggestedTask}”.`
      : 'Nothing marked done yet today.'
  }
  if (tone === 'playful') {
    const streakPart =
      ctx.streak >= 2
        ? `${ctx.petName} is hyped about your ${ctx.streak}-day streak!`
        : `${ctx.petName} is bouncing around, hoping to see you.`
    const taskPart = ctx.suggestedTask
      ? ` “${ctx.suggestedTask}” could be a fun one to knock out.`
      : ' Even a tiny win would make their day.'
    return streakPart + taskPart
  }
  const streakPart =
    ctx.streak >= 2
      ? `Your ${ctx.streak}-day streak is going strong — want to keep it up?`
      : `${ctx.petName} would love to see you today.`
  const taskPart = ctx.suggestedTask
    ? ` Maybe start with “${ctx.suggestedTask}” — it only takes a minute.`
    : ' No pressure, even something tiny counts.'
  return streakPart + taskPart
}

/**
 * Re-evaluates whether a check-in notification is needed and (re)schedules or cancels it to
 * match. Cheap and safe to call often — on mount, whenever today's completion status or the
 * suggested task changes, and when the app regains focus. Content reflects a snapshot of
 * today (nothing else can complete tasks while the app isn't open), so an already-scheduled
 * notification stays accurate even if the app never reopens before it fires.
 */
export async function refreshReminder(profileId: string, ctx: ReminderContext): Promise<void> {
  if (!isNotificationsSupported() || !loadRemindersEnabled(profileId)) return
  if (ctx.hasCompletedToday) {
    await cancelReminder()
    return
  }

  const fireAt = nextFireTime(new Date(), loadReminderHour(profileId))
  if (!fireAt) {
    await cancelReminder()
    return
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'Tasks',
        body: buildMessage(ctx, loadReminderTone(profileId)),
        schedule: { at: fireAt },
      },
    ],
  })
}
