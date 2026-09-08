import { profileKey } from './profiles'

export function loadFocusModeEnabled(profileId: string): boolean {
  try {
    const raw = localStorage.getItem(profileKey(profileId, 'focusMode'))
    return raw === null ? true : raw === 'true'
  } catch {
    return true
  }
}

export function saveFocusModeEnabled(profileId: string, enabled: boolean) {
  try {
    localStorage.setItem(profileKey(profileId, 'focusMode'), String(enabled))
  } catch {
    // ignore — worst case the toggle doesn't persist across launches
  }
}
