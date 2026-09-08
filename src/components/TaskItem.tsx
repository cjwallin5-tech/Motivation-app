import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { TASK_CATEGORIES_BY_ID } from '../categories'
import type { Task } from '../types'
import { CheckIcon, CloseIcon, RepeatIcon } from './icons'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function recurLabel(task: Task): string | null {
  if (task.recurrence === 'daily') return 'Repeats daily'
  if (task.recurrence === 'weekly' && task.recurDays.length > 0) {
    const days = [...task.recurDays].sort().map((d) => DAY_ABBR[d])
    return `Repeats ${days.join(', ')}`
  }
  return null
}

interface Props {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  /** When set, shows a small text action that moves the task to the other bucket. */
  onMoveBucket?: (id: string) => void
  moveBucketLabel?: string
}

export function TaskItem({ task, onToggle, onEdit, onDelete, onMoveBucket, moveBucketLabel }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  function commitEdit() {
    if (draft.trim()) {
      onEdit(task.id, draft)
    } else {
      setDraft(task.title)
    }
    setEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') {
      setDraft(task.title)
      setEditing(false)
    }
  }

  return (
    <li className={`task-item${task.done ? ' done' : ''}`}>
      <label className="task-checkbox">
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
        <span className="checkmark" aria-hidden="true">
          <CheckIcon />
        </span>
      </label>

      {editing ? (
        <input
          className="task-edit-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span
          className="task-title"
          onDoubleClick={() => task.source !== 'anchor' && setEditing(true)}
        >
          {task.source !== 'anchor' && recurLabel(task) && (
            <span className="recur-badge" title={recurLabel(task)!}>
              <RepeatIcon />
            </span>
          )}
          {task.title}
        </span>
      )}

      {task.category && !editing && (
        <span
          className="category-badge"
          style={{ color: TASK_CATEGORIES_BY_ID[task.category].color }}
          title={TASK_CATEGORIES_BY_ID[task.category].label}
        >
          <span className="category-dot" style={{ background: TASK_CATEGORIES_BY_ID[task.category].color }} />
          {TASK_CATEGORIES_BY_ID[task.category].label}
        </span>
      )}

      {task.source === 'auto' && !editing && <span className="auto-badge">Suggested</span>}
      {task.source === 'anchor' && !editing && (
        <span className="anchor-badge" title="Always here, every day — a guaranteed easy win">
          Anytime
        </span>
      )}

      {onMoveBucket && !editing && (
        <button type="button" className="task-move-bucket" onClick={() => onMoveBucket(task.id)}>
          {moveBucketLabel}
        </button>
      )}

      {task.source !== 'anchor' && (
        <button
          type="button"
          className="task-delete"
          aria-label={`Delete "${task.title}"`}
          onClick={() => onDelete(task.id)}
        >
          <CloseIcon />
        </button>
      )}
    </li>
  )
}
