import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { TASK_CATEGORIES } from '../categories'
import type { TaskBucket, TaskCategory, TaskRecurrence } from '../types'
import { ClockIcon, RepeatIcon, TagIcon } from './icons'

interface Props {
  onAdd: (
    title: string,
    recurrence: TaskRecurrence,
    recurDays: number[],
    bucket: TaskBucket,
    category: TaskCategory | null,
  ) => void
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export function TaskInput({ onAdd }: Props) {
  const [value, setValue] = useState('')
  const [recurDays, setRecurDays] = useState<number[]>([])
  const [bucket, setBucket] = useState<TaskBucket>('today')
  const [category, setCategory] = useState<TaskCategory | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const categoryWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen && !categoryPickerOpen) return
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
      if (categoryWrapRef.current && !categoryWrapRef.current.contains(e.target as Node)) {
        setCategoryPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [pickerOpen, categoryPickerOpen])

  function toggleDay(day: number) {
    setBucket('today')
    setRecurDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  function toggleSomeday() {
    setBucket((prev) => (prev === 'someday' ? 'today' : 'someday'))
    setRecurDays([])
    setPickerOpen(false)
  }

  function pickCategory(id: TaskCategory) {
    setCategory((prev) => (prev === id ? null : id))
    setCategoryPickerOpen(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const recurrence: TaskRecurrence =
      recurDays.length === 0 ? 'none' : recurDays.length === 7 ? 'daily' : 'weekly'
    onAdd(value, recurrence, recurDays, bucket, category)
    setValue('')
    setRecurDays([])
    setBucket('today')
    setCategory(null)
    setPickerOpen(false)
    setCategoryPickerOpen(false)
  }

  const repeatLabel =
    recurDays.length === 0 ? 'Repeat' : recurDays.length === 7 ? 'Daily' : `${recurDays.length}x/wk`
  const categoryDef = category ? TASK_CATEGORIES.find((c) => c.id === category) : null

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What's one small thing you could do next?"
        aria-label="New task"
        autoFocus
      />
      {bucket !== 'someday' && (
        <div className="repeat-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`repeat-toggle${recurDays.length > 0 ? ' active' : ''}`}
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            title="Choose which days this repeats on"
          >
            <RepeatIcon />
            {repeatLabel}
          </button>
          {pickerOpen && (
            <div className="repeat-picker">
              <div className="repeat-days">
                {DAY_LABELS.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    className={`repeat-day${recurDays.includes(day) ? ' active' : ''}`}
                    aria-pressed={recurDays.includes(day)}
                    aria-label={`Repeat on ${label}`}
                    onClick={() => toggleDay(day)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="repeat-picker-actions">
                <button type="button" className="repeat-quick" onClick={() => setRecurDays(ALL_DAYS)}>
                  Every day
                </button>
                <button type="button" className="repeat-quick" onClick={() => setRecurDays([])}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {recurDays.length === 0 && (
        <button
          type="button"
          className={`repeat-toggle${bucket === 'someday' ? ' active' : ''}`}
          onClick={toggleSomeday}
          aria-pressed={bucket === 'someday'}
          title="Add to Someday instead of today's list"
        >
          <ClockIcon />
          Someday
        </button>
      )}
      <div className="repeat-wrap" ref={categoryWrapRef}>
        <button
          type="button"
          className={`repeat-toggle${categoryDef ? ' active' : ''}`}
          onClick={() => setCategoryPickerOpen((o) => !o)}
          aria-expanded={categoryPickerOpen}
          title="Tag this task with a category"
          style={categoryDef ? { color: categoryDef.color, borderColor: categoryDef.color } : undefined}
        >
          <TagIcon />
          {categoryDef ? categoryDef.label : 'Tag'}
        </button>
        {categoryPickerOpen && (
          <div className="repeat-picker category-picker">
            {TASK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-option${category === c.id ? ' active' : ''}`}
                aria-pressed={category === c.id}
                style={{ '--category-color': c.color } as CSSProperties}
                onClick={() => pickCategory(c.id)}
              >
                <span className="category-dot" />
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="submit" disabled={!value.trim()}>
        Add
      </button>
    </form>
  )
}
