import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { TaskInput } from './TaskInput'
import { TaskItem } from './TaskItem'
import { BackupIcon, BellIcon, ChevronIcon, CloseIcon, TargetIcon, UserIcon } from './icons'
import { applyBackup, exportBackup, parseBackupFile } from '../backup'
import { REMINDER_TIME_PRESETS, REMINDER_TONES } from '../notifications'
import type { ReminderTone } from '../notifications'
import type { Task, TaskBucket, TaskCategory, TaskRecurrence } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  routine: Task[]
  active: Task[]
  completed: Task[]
  someday: Task[]
  oneOffCount: number
  emptyMessage: string
  onAdd: (
    title: string,
    recurrence: TaskRecurrence,
    recurDays: number[],
    bucket: TaskBucket,
    category: TaskCategory | null,
  ) => void
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  onClearCompleted: () => void
  onMoveBucket: (id: string, bucket: TaskBucket) => void
  remindersSupported: boolean
  remindersEnabled: boolean
  onToggleReminders: (next: boolean) => void
  reminderHour: number
  onReminderHourChange: (hour: number) => void
  reminderTone: ReminderTone
  onReminderToneChange: (tone: ReminderTone) => void
  focusModeEnabled: boolean
  onToggleFocusMode: (next: boolean) => void
  profileName: string
  onSwitchProfile: () => void
}

export function TasksModal({
  open,
  onClose,
  routine,
  active,
  completed,
  someday,
  oneOffCount,
  emptyMessage,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
  onClearCompleted,
  onMoveBucket,
  remindersSupported,
  remindersEnabled,
  onToggleReminders,
  reminderHour,
  onReminderHourChange,
  reminderTone,
  onReminderToneChange,
  focusModeEnabled,
  onToggleFocusMode,
  profileName,
  onSwitchProfile,
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const [somedayOpen, setSomedayOpen] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setShowAll(false)
      setSomedayOpen(false)
    }
  }, [open])

  async function handleImportChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const text = await file.text()
    const backup = parseBackupFile(text)
    if (!backup) {
      setImportMessage("That file doesn't look like a backup from this app.")
      return
    }

    const confirmed = window.confirm(
      'This replaces everything currently in the app — your companion, streak, tasks, and progress — with what\'s in this backup file. This can\'t be undone. Continue?',
    )
    if (!confirmed) return

    applyBackup(backup)
    window.location.reload()
  }

  if (!open) return null

  // The anchor task is a last resort — a real routine/one-off task should always win the pick
  // when one exists, so the guaranteed tiny win only surfaces once nothing else is pending.
  const undoneRealRoutine = routine.filter((t) => !t.done && t.source !== 'anchor')
  const anchorTask = routine.find((t) => t.source === 'anchor') ?? null
  const nextTask =
    undoneRealRoutine[0] ?? active[0] ?? (anchorTask && !anchorTask.done ? anchorTask : null)
  const pendingElsewhere =
    nextTask && nextTask.source === 'anchor'
      ? 0
      : undoneRealRoutine.length + active.length - (nextTask ? 1 : 0)
  const inFocusView = focusModeEnabled && !showAll

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Tasks</h1>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {inFocusView ? (
            <div className="focus-view">
              {nextTask ? (
                <>
                  <p className="focus-subtitle">One thing at a time.</p>
                  <ul className="task-list focus-task">
                    <TaskItem
                      task={nextTask}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </ul>
                  {pendingElsewhere > 0 && (
                    <button
                      type="button"
                      className="focus-reveal"
                      onClick={() => setShowAll(true)}
                    >
                      Show full list ({pendingElsewhere} more waiting)
                    </button>
                  )}
                </>
              ) : (
                <p className="empty-state">Nothing waiting on you right now — nice work.</p>
              )}
            </div>
          ) : (
            <>
              {routine.length > 0 && (
                <div className="routine-section">
                  <h2>Daily Routine</h2>
                  <ul className="task-list">
                    {routine.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </ul>
                </div>
              )}

              <div className="today-header">
                <h2>Today</h2>
                {oneOffCount > 0 && (
                  <p className="progress">
                    {completed.length} of {oneOffCount} done
                  </p>
                )}
              </div>

              <TaskInput onAdd={onAdd} />

              {oneOffCount === 0 ? (
                <p className="empty-state">{emptyMessage}</p>
              ) : (
                <>
                  <ul className="task-list">
                    {active.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMoveBucket={(id) => onMoveBucket(id, 'someday')}
                        moveBucketLabel="Someday"
                      />
                    ))}
                  </ul>

                  {completed.length > 0 && (
                    <div className="completed-section">
                      <div className="completed-header">
                        <h2>Done</h2>
                        <button type="button" className="clear-btn" onClick={onClearCompleted}>
                          Clear
                        </button>
                      </div>
                      <ul className="task-list">
                        {completed.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {someday.length > 0 && (
                <div className="someday-section">
                  <button
                    type="button"
                    className="someday-header"
                    aria-expanded={somedayOpen}
                    onClick={() => setSomedayOpen((o) => !o)}
                  >
                    <ChevronIcon className={`someday-chevron${somedayOpen ? ' open' : ''}`} />
                    <h2>Someday ({someday.length})</h2>
                  </button>
                  {somedayOpen && (
                    <ul className="task-list">
                      {someday.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={onToggle}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onMoveBucket={(id) => onMoveBucket(id, 'today')}
                          moveBucketLabel="Today"
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {focusModeEnabled && (
                <button type="button" className="focus-reveal" onClick={() => setShowAll(false)}>
                  Back to one thing
                </button>
              )}
            </>
          )}

          <div className="reminders-row">
            <TargetIcon className="reminders-icon" />
            <div className="reminders-copy">
              <p className="reminders-title">Just one thing</p>
              <p className="reminders-sub">Show a single task at a time instead of the full list.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={focusModeEnabled}
              aria-label="Just one thing mode"
              className={`toggle-switch${focusModeEnabled ? ' on' : ''}`}
              onClick={() => onToggleFocusMode(!focusModeEnabled)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="reminders-row">
            <BellIcon className="reminders-icon" />
            <div className="reminders-copy">
              <p className="reminders-title">Check-in reminder</p>
              <p className="reminders-sub">
                {remindersSupported
                  ? remindersEnabled
                    ? "A nudge later today, only if you haven't done anything yet."
                    : "Get a nudge, but only on days you haven't done anything yet."
                  : 'Available once this is running as the phone app.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={remindersEnabled}
              aria-label="Check-in reminder"
              className={`toggle-switch${remindersEnabled ? ' on' : ''}`}
              disabled={!remindersSupported}
              onClick={() => onToggleReminders(!remindersEnabled)}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          {remindersSupported && remindersEnabled && (
            <div className="reminder-settings">
              <div className="reminder-settings-group">
                <p className="reminder-settings-label">Around what time?</p>
                <div className="reminder-settings-options">
                  {REMINDER_TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.hour}
                      type="button"
                      className={`reminder-option${reminderHour === preset.hour ? ' active' : ''}`}
                      aria-pressed={reminderHour === preset.hour}
                      onClick={() => onReminderHourChange(preset.hour)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="reminder-settings-group">
                <p className="reminder-settings-label">What tone?</p>
                <div className="reminder-settings-options">
                  {REMINDER_TONES.map((option) => (
                    <button
                      key={option.tone}
                      type="button"
                      className={`reminder-option${reminderTone === option.tone ? ' active' : ''}`}
                      aria-pressed={reminderTone === option.tone}
                      onClick={() => onReminderToneChange(option.tone)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="reminders-row">
            <UserIcon className="reminders-icon" />
            <div className="reminders-copy">
              <p className="reminders-title">Profile</p>
              <p className="reminders-sub">{profileName}</p>
            </div>
            <button type="button" className="backup-btn" onClick={onSwitchProfile}>
              Switch
            </button>
          </div>

          <div className="reminders-row backup-row">
            <BackupIcon className="reminders-icon" />
            <div className="reminders-copy">
              <p className="reminders-title">Backup</p>
              <p className="reminders-sub">
                {importMessage ?? 'Save your progress to a file, or restore from one.'}
              </p>
            </div>
            <div className="backup-actions">
              <button type="button" className="backup-btn" onClick={exportBackup}>
                Export
              </button>
              <button type="button" className="backup-btn" onClick={() => fileInputRef.current?.click()}>
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleImportChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
