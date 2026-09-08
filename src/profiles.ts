export interface Profile {
  id: string
  name: string
  createdAt: number
}

const PROFILES_KEY = 'motivation-app.profiles'
const ACTIVE_PROFILE_KEY = 'motivation-app.activeProfileId'
// Every key that belongs to a specific profile lives under this namespace. It still starts with
// the shared 'motivation-app.' prefix, so backup.ts's whole-device export/restore (which just
// grabs everything under that prefix) keeps working for free — no changes needed there.
const PROFILE_NAMESPACE = 'motivation-app.p'

// Keys used by a single-profile install before profiles existed. The first time loadProfiles()
// runs and finds no profiles yet, whatever's under these gets moved into a new default profile's
// namespaced keys instead of silently vanishing.
const LEGACY_KEYS = [
  'motivation-app.tasks',
  'motivation-app.autoTaskHistory',
  'motivation-app.pet',
  'motivation-app.remindersEnabled',
  'motivation-app.reminderHour',
  'motivation-app.reminderTone',
  'motivation-app.focusMode',
  'motivation-app.lastWeeklySummaryShown',
]

/** The localStorage key for a piece of per-profile data — e.g. profileKey(id, 'tasks'). */
export function profileKey(profileId: string, suffix: string): string {
  return `${PROFILE_NAMESPACE}.${profileId}.${suffix}`
}

function readProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? (JSON.parse(raw) as Profile[]) : []
  } catch {
    return []
  }
}

function writeProfiles(profiles: Profile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch {
    // ignore — worst case the profile list doesn't persist across launches
  }
}

function migrateLegacyData(): Profile | null {
  const hasLegacyData = LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null)
  if (!hasLegacyData) return null

  const profile: Profile = { id: crypto.randomUUID(), name: 'You', createdAt: Date.now() }
  for (const key of LEGACY_KEYS) {
    const value = localStorage.getItem(key)
    if (value === null) continue
    const suffix = key.slice('motivation-app.'.length)
    localStorage.setItem(profileKey(profile.id, suffix), value)
    localStorage.removeItem(key)
  }
  return profile
}

/** Loads every profile on this device, migrating pre-profiles single-user data into a default
 *  profile the first time this ever runs. Safe to call as often as needed after that. */
export function loadProfiles(): Profile[] {
  const existing = readProfiles()
  if (existing.length > 0) return existing

  const migrated = migrateLegacyData()
  const profiles = migrated ? [migrated] : []
  if (migrated) writeProfiles(profiles)
  return profiles
}

export function createProfile(name: string): Profile {
  const trimmed = name.trim() || 'New profile'
  const profile: Profile = { id: crypto.randomUUID(), name: trimmed, createdAt: Date.now() }
  writeProfiles([...readProfiles(), profile])
  return profile
}

export function renameProfile(id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  writeProfiles(readProfiles().map((p) => (p.id === id ? { ...p, name: trimmed } : p)))
}

/** Deletes a profile and every piece of data namespaced under it. Irreversible. */
export function deleteProfile(id: string) {
  writeProfiles(readProfiles().filter((p) => p.id !== id))
  const prefix = `${PROFILE_NAMESPACE}.${id}.`
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) localStorage.removeItem(key)
  }
  if (loadActiveProfileId() === id) clearActiveProfileId()
}

export function loadActiveProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY)
  } catch {
    return null
  }
}

export function setActiveProfileId(id: string) {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id)
  } catch {
    // ignore — worst case the picker shows again next launch
  }
}

export function clearActiveProfileId() {
  try {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  } catch {
    // ignore
  }
}
