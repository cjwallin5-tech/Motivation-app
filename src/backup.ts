// Every piece of app state lives in localStorage under this prefix (see usePet.ts, useTasks.ts,
// notifications.ts, focusMode.ts) — backup/restore just needs to know the prefix, not each key
// individually, so a future feature's new key is automatically included without touching this file.
const PREFIX = 'motivation-app.'

export interface BackupFile {
  app: 'motivation-app'
  version: 1
  exportedAt: string
  data: Record<string, string>
}

function collectData(): Record<string, string> {
  const data: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(PREFIX)) continue
    const value = localStorage.getItem(key)
    if (value !== null) data[key] = value
  }
  return data
}

/** Downloads a JSON snapshot of all app data as a file. */
export function exportBackup(): void {
  const backup: BackupFile = {
    app: 'motivation-app',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: collectData(),
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `motivation-app-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Parses and sanity-checks a backup file's contents. Returns null if it isn't a recognizable backup. */
export function parseBackupFile(text: string): BackupFile | null {
  try {
    const parsed = JSON.parse(text)
    if (
      parsed &&
      parsed.app === 'motivation-app' &&
      parsed.data &&
      typeof parsed.data === 'object' &&
      !Array.isArray(parsed.data)
    ) {
      return parsed as BackupFile
    }
    return null
  } catch {
    return null
  }
}

/**
 * Replaces all current app data with what's in the backup. Clears existing keys first so a
 * restore is deterministic — the app ends up matching the backup exactly, not a mix of the
 * backup plus whatever was already there (e.g. a newer key the backup predates).
 */
export function applyBackup(backup: BackupFile): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith(PREFIX)) localStorage.removeItem(key)
  }
  for (const [key, value] of Object.entries(backup.data)) {
    if (key.startsWith(PREFIX)) localStorage.setItem(key, value)
  }
}
