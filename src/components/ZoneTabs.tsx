import { ZONES } from '../zones'
import type { ZoneKey } from '../zones'
import { LockIcon } from './icons'

interface Props {
  level: number
  active: ZoneKey
  onChange: (zone: ZoneKey) => void
}

export function ZoneTabs({ level, active, onChange }: Props) {
  return (
    <div className="zone-tabs">
      {ZONES.map((zone) => {
        const unlocked = level >= zone.unlockLevel
        return (
          <button
            key={zone.key}
            type="button"
            className={`zone-tab${zone.key === active ? ' active' : ''}`}
            disabled={!unlocked}
            onClick={() => onChange(zone.key)}
            title={unlocked ? undefined : `Unlocks at level ${zone.unlockLevel}`}
          >
            {unlocked ? zone.label : (
              <>
                <LockIcon /> Lvl {zone.unlockLevel}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
