import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { MINIGAME_UNLOCK_LEVEL } from '../minigame'
import type { PrestigeTier } from '../prestige'
import { CoinIcon, FlameIcon, GameIcon, LockIcon, PawIcon, ShieldIcon, StarIcon } from './icons'

interface Props {
  name: string
  level: number
  progress: number
  pointsToNext: number
  effectiveStreak: number
  longestStreak: number
  activeToday: boolean
  hasStarted: boolean
  graceTokens: number
  coins: number
  prestigeTier: PrestigeTier | null
  hasPendingCompanion: boolean
  onRename: (name: string) => void
  onOpenCompanions: () => void
  onOpenMinigame: () => void
}

function moodMessage({ activeToday, effectiveStreak, hasStarted }: Props): string {
  if (!hasStarted) return 'Complete a task to hatch your companion.'
  if (activeToday) {
    if (effectiveStreak >= 7) return `On fire — ${effectiveStreak} day streak!`
    if (effectiveStreak >= 3) return `Great momentum — ${effectiveStreak} day streak.`
    return 'Nice, you showed up today.'
  }
  if (effectiveStreak > 0) {
    return `Ready for today? Your streak is at ${effectiveStreak} day${effectiveStreak === 1 ? '' : 's'}.`
  }
  return 'Your companion missed you — one task restarts your streak.'
}

export function PetPanel(props: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(props.name)

  function commit() {
    if (draft.trim()) props.onRename(draft)
    else setDraft(props.name)
    setEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(props.name)
      setEditing(false)
    }
  }

  return (
    <div className="pet-panel">
      <div className="pet-info">
        <div className="pet-name-row">
          {editing ? (
            <input
              className="pet-name-input"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <h2 className="pet-name" onDoubleClick={() => setEditing(true)}>
              {props.name}
            </h2>
          )}
          <span className="pet-level">Lv {props.level}</span>
          {props.prestigeTier && (
            <span
              className="prestige-badge"
              style={{ '--prestige-color': props.prestigeTier.color } as CSSProperties}
              title={`Reached at level ${props.prestigeTier.level}`}
            >
              {props.prestigeTier.name}
            </span>
          )}
        </div>
        <div className="pet-quick-actions">
          <button type="button" className="quick-action-pill" onClick={props.onOpenCompanions}>
            <PawIcon /> Pets
            {props.hasPendingCompanion && <span className="companions-dot" />}
          </button>
          <button
            type="button"
            className="quick-action-pill"
            disabled={props.level < MINIGAME_UNLOCK_LEVEL}
            onClick={props.onOpenMinigame}
            title={props.level < MINIGAME_UNLOCK_LEVEL ? `Unlocks at level ${MINIGAME_UNLOCK_LEVEL}` : undefined}
          >
            {props.level < MINIGAME_UNLOCK_LEVEL ? <LockIcon /> : <GameIcon />}
            {props.level < MINIGAME_UNLOCK_LEVEL ? `Catch · Lv ${MINIGAME_UNLOCK_LEVEL}` : 'Catch'}
          </button>
        </div>
        <p className="pet-mood">{moodMessage(props)}</p>
        <div
          className="xp-bar"
          role="progressbar"
          aria-valuenow={props.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="xp-fill" style={{ width: `${props.progress}%` }} />
        </div>
        <div className="pet-stats">
          <span className="streak-stat">
            <FlameIcon />
            {props.effectiveStreak} day streak
          </span>
          {props.longestStreak > props.effectiveStreak && (
            <span className="best-streak-stat" title="Your longest streak ever — it stays on the board even after a reset.">
              <StarIcon />
              Best: {props.longestStreak}
            </span>
          )}
          <span
            className="grace-stat"
            title="Streak freezes: cover one fully missed day without losing your streak. Earn another every 7-day streak."
          >
            <ShieldIcon />
            {props.graceTokens}
          </span>
          <span className="coin-stat" title="Coins — spend them in the shop">
            <CoinIcon />
            {props.coins}
          </span>
          <span>{props.pointsToNext} XP to next level</span>
        </div>
      </div>
    </div>
  )
}
