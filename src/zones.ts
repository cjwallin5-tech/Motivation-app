export type ZoneKey = 'room' | 'garden' | 'loft'

export interface Zone {
  key: ZoneKey
  label: string
  unlockLevel: number
}

export const ZONES: Zone[] = [
  { key: 'room', label: 'Room', unlockLevel: 1 },
  { key: 'garden', label: 'Garden', unlockLevel: 4 },
  { key: 'loft', label: 'Loft', unlockLevel: 7 },
]

export function isZoneUnlocked(zone: Zone, level: number): boolean {
  return level >= zone.unlockLevel
}
