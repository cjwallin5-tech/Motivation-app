import { useEffect, useMemo, useState } from 'react'
import { ACHIEVEMENTS } from '../achievements'
import { TASK_CATEGORIES_BY_ID } from '../categories'
import { dateKey } from '../date'
import { randomReflection } from '../reflections'
import type { TaskCategory } from '../types'
import { computeWeekStats, weekStartKey, weeklyRecapMessage } from '../weeklySummary'
import { CalendarIcon, CloseIcon, LockIcon, TrophyIcon } from './icons'

type Tab = 'achievements' | 'history'

interface Props {
  open: boolean
  onClose: () => void
  unlockedIds: string[]
  dailyActivity: Record<string, number>
  categoryActivity: Partial<Record<TaskCategory, number>>
  /** Which tab to show when the modal opens — lets a dedicated History entry point jump straight there. */
  initialTab?: Tab
}

const HEATMAP_WEEKS = 12

interface HeatCell {
  date: string
  count: number
  isFuture: boolean
}

function buildHeatmapWeeks(dailyActivity: Record<string, number>): HeatCell[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())

  const gridStart = new Date(currentWeekStart)
  gridStart.setDate(currentWeekStart.getDate() - (HEATMAP_WEEKS - 1) * 7)

  const weeks: HeatCell[][] = []
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const week: HeatCell[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(gridStart)
      day.setDate(gridStart.getDate() + w * 7 + d)
      const key = dateKey(day)
      week.push({ date: key, count: dailyActivity[key] ?? 0, isFuture: day > today })
    }
    weeks.push(week)
  }
  return weeks
}

function heatLevel(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  return 3
}

export function AchievementsModal({
  open,
  onClose,
  unlockedIds,
  dailyActivity,
  categoryActivity,
  initialTab = 'achievements',
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  // Picked fresh each time the modal opens, not on every render — a quiet reminder that this
  // heatmap is a record for the player, not a score, right where they'd look to judge themselves.
  const reflection = useMemo(() => randomReflection(), [open])

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  if (!open) return null

  const weeks = buildHeatmapWeeks(dailyActivity)
  const activeDays = Object.values(dailyActivity).filter((c) => c > 0).length

  const today = new Date()
  const daysSoFar = today.getDay() + 1
  const thisWeekStats = computeWeekStats(dailyActivity, weekStartKey(today), daysSoFar)

  const categoryRows = Object.entries(categoryActivity)
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([id, count]) => ({ def: TASK_CATEGORIES_BY_ID[id as TaskCategory], count: count! }))
    .sort((a, b) => b.count - a.count)
  const maxCategoryCount = Math.max(1, ...categoryRows.map((r) => r.count))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-tabs">
            <button
              type="button"
              className={`modal-tab${tab === 'achievements' ? ' active' : ''}`}
              onClick={() => setTab('achievements')}
            >
              <TrophyIcon /> Achievements
            </button>
            <button
              type="button"
              className={`modal-tab${tab === 'history' ? ' active' : ''}`}
              onClick={() => setTab('history')}
            >
              <CalendarIcon /> History
            </button>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {tab === 'achievements' ? (
            <>
              <p className="progress">
                {unlockedIds.length} of {ACHIEVEMENTS.length} unlocked
              </p>
              <ul className="achievement-list">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedIds.includes(a.id)
                  return (
                    <li key={a.id} className={`achievement-item${unlocked ? ' unlocked' : ''}`}>
                      <span className="achievement-icon">
                        {unlocked ? <TrophyIcon /> : <LockIcon />}
                      </span>
                      <span className="achievement-copy">
                        <span className="achievement-title">{a.title}</span>
                        <span className="achievement-desc">{a.description}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <>
              <div className="week-summary-card">
                <p className="week-summary-title">This week</p>
                <p className="week-summary-body">{weeklyRecapMessage(thisWeekStats, daysSoFar)}</p>
              </div>
              <p className="progress">{activeDays} active days, all time</p>
              <div className="heatmap">
                {weeks.map((week) => (
                  <div className="heatmap-col" key={week[0].date}>
                    {week.map((cell) => (
                      <span
                        key={cell.date}
                        className={`heatmap-cell heat-${heatLevel(cell.count)}${cell.isFuture ? ' future' : ''}`}
                        title={
                          cell.isFuture
                            ? undefined
                            : `${cell.date}: ${cell.count} task${cell.count === 1 ? '' : 's'}`
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <span className="heatmap-cell heat-0" />
                <span className="heatmap-cell heat-1" />
                <span className="heatmap-cell heat-2" />
                <span className="heatmap-cell heat-3" />
                <span>More</span>
              </div>
              {categoryRows.length > 0 && (
                <div className="category-breakdown">
                  <p className="week-summary-title">By category, all time</p>
                  {categoryRows.map(({ def, count }) => (
                    <div className="category-row" key={def.id}>
                      <span className="category-row-label" style={{ color: def.color }}>
                        {def.label}
                      </span>
                      <div className="category-bar-track">
                        <div
                          className="category-bar-fill"
                          style={{ width: `${(count / maxCategoryCount) * 100}%`, background: def.color }}
                        />
                      </div>
                      <span className="category-row-count">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="reflection-note">{reflection}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
