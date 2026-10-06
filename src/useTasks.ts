import { useEffect, useState } from 'react'
import type { Task, TaskBucket, TaskCategory, TaskRecurrence } from './types'
import { dayOfWeek, todayKey } from './date'
import { profileKey } from './profiles'

type AutoCategory = 'movement' | 'mindfulness' | 'environment' | 'connection' | 'self-care' | 'creativity'

interface AutoTaskDef {
  title: string
  category: AutoCategory
}

// A wide, categorized pool so the daily picks can span different kinds of small wins rather
// than landing on two similar ones (e.g. two physical prompts back to back).
const AUTO_TASK_POOL: AutoTaskDef[] = [
  { title: 'Stretch for a minute', category: 'movement' },
  { title: 'Walk around your space for two minutes', category: 'movement' },
  { title: 'Roll your shoulders a few times', category: 'movement' },
  { title: 'Stand up and shake out your hands', category: 'movement' },
  { title: 'Step outside for a moment', category: 'movement' },
  { title: 'Do a few slow neck stretches', category: 'movement' },
  { title: 'Do ten jumping jacks', category: 'movement' },
  { title: 'Touch your toes and hold for a few seconds', category: 'movement' },
  { title: 'Climb a flight of stairs, or march in place for a minute', category: 'movement' },
  { title: 'Do a slow lap around the room', category: 'movement' },
  { title: 'Reach your arms overhead and hold the stretch', category: 'movement' },
  { title: 'Do a few slow squats', category: 'movement' },
  { title: 'Do a few gentle lunges', category: 'movement' },
  { title: 'Shake out your legs one at a time', category: 'movement' },
  { title: 'Do a short set of calf raises', category: 'movement' },
  { title: 'Hold a plank for ten seconds', category: 'movement' },
  { title: 'Twist side to side a few times', category: 'movement' },
  { title: 'Do a few slow arm circles', category: 'movement' },

  { title: 'Take three slow breaths', category: 'mindfulness' },
  { title: 'Name three things you can see, hear, and feel right now', category: 'mindfulness' },
  { title: 'Sit quietly for one minute, no phone', category: 'mindfulness' },
  { title: 'Write down one thing you’re grateful for', category: 'mindfulness' },
  { title: 'Write down whatever’s on your mind, then close the notebook', category: 'mindfulness' },
  { title: 'Close your eyes and just listen for ten seconds', category: 'mindfulness' },
  { title: 'Pick one worry and set it aside for later', category: 'mindfulness' },
  { title: 'Notice five things you can see without moving', category: 'mindfulness' },
  { title: 'Do a quick body scan from head to toe', category: 'mindfulness' },
  { title: 'Set one small intention for the next hour', category: 'mindfulness' },
  { title: 'Unclench your jaw and drop your shoulders', category: 'mindfulness' },
  { title: 'Take one long exhale, twice as slow as your inhale', category: 'mindfulness' },
  { title: 'Notice one thing you can smell right now', category: 'mindfulness' },
  { title: 'Picture a place that makes you feel calm', category: 'mindfulness' },
  { title: 'Say one kind thing to yourself', category: 'mindfulness' },
  { title: 'Let your mind wander for a minute, no goal', category: 'mindfulness' },

  { title: 'Clear off one surface — a desk, counter, or nightstand', category: 'environment' },
  { title: 'Open a window for fresh air', category: 'environment' },
  { title: 'Open the blinds or step near a window for natural light', category: 'environment' },
  { title: 'Put one stray item back where it belongs', category: 'environment' },
  { title: 'Pull up the blanket or straighten the bed', category: 'environment' },
  { title: 'Throw away one piece of trash near you', category: 'environment' },
  { title: 'Wipe down one surface', category: 'environment' },
  { title: 'Fluff or straighten a pillow', category: 'environment' },
  { title: 'Recycle one piece of paper you don’t need', category: 'environment' },
  { title: 'Give a plant some water', category: 'environment' },
  { title: 'Empty one small trash bin', category: 'environment' },
  { title: 'Line up your shoes by the door', category: 'environment' },
  { title: 'Fold or hang up one piece of clothing', category: 'environment' },
  { title: 'Wipe your phone or laptop screen clean', category: 'environment' },
  { title: 'Straighten the books or items on a shelf', category: 'environment' },
  { title: 'Take out the recycling', category: 'environment' },
  { title: 'Light a candle or freshen the air', category: 'environment' },
  { title: 'Untangle one cord or cable', category: 'environment' },

  { title: 'Text or call someone you like', category: 'connection' },
  { title: 'Send someone a meme or a “thinking of you”', category: 'connection' },
  { title: 'Say hello to someone nearby, even a pet', category: 'connection' },
  { title: 'Leave a kind comment for someone online', category: 'connection' },
  { title: 'Give someone a genuine compliment', category: 'connection' },
  { title: 'Reply to a message you’ve been putting off', category: 'connection' },
  { title: 'Share something that made you smile with a friend', category: 'connection' },
  { title: 'Check in on someone you haven’t talked to in a while', category: 'connection' },
  { title: 'Thank someone for something small', category: 'connection' },
  { title: 'Ask someone how their day is really going', category: 'connection' },
  { title: 'Share a fun fact with someone', category: 'connection' },
  { title: 'Tag a friend in something they’d like', category: 'connection' },
  { title: 'Write a short note to leave for someone', category: 'connection' },
  { title: 'Introduce yourself to someone new', category: 'connection' },
  { title: 'Tell someone what you appreciate about them', category: 'connection' },

  { title: 'Drink a glass of water', category: 'self-care' },
  { title: 'Wash your face or brush your teeth', category: 'self-care' },
  { title: 'Put on something comfortable', category: 'self-care' },
  { title: 'Eat something, even something small', category: 'self-care' },
  { title: 'Take any medication you have due', category: 'self-care' },
  { title: 'Set your phone down and rest your eyes for a minute', category: 'self-care' },
  { title: 'Apply lotion or chapstick', category: 'self-care' },
  { title: 'Fix your posture and take a breath', category: 'self-care' },
  { title: 'Step into some sunlight or bright light for a minute', category: 'self-care' },
  { title: 'Floss your teeth', category: 'self-care' },
  { title: 'Refill your water bottle', category: 'self-care' },
  { title: 'Change into a fresh shirt or socks', category: 'self-care' },
  { title: 'Brush or comb your hair', category: 'self-care' },
  { title: 'Check in on how you’re feeling right now', category: 'self-care' },
  { title: 'Put on deodorant or perfume', category: 'self-care' },
  { title: 'Stretch out a sore spot', category: 'self-care' },
  { title: 'Trim or clean your nails', category: 'self-care' },
  { title: 'Take your vitamins', category: 'self-care' },

  { title: 'Doodle for a minute — it doesn’t have to be good', category: 'creativity' },
  { title: 'Hum or sing along to one song', category: 'creativity' },
  { title: 'Rearrange one small thing to look nicer', category: 'creativity' },
  { title: 'Write one sentence about your day', category: 'creativity' },
  { title: 'Take a photo of something interesting nearby', category: 'creativity' },
  { title: 'Come up with a silly name for something in the room', category: 'creativity' },
  { title: 'Rewrite one sentence you wrote today so it reads better', category: 'creativity' },
  { title: 'Make up a tiny rhyme', category: 'creativity' },
  { title: 'Try sketching your own hand', category: 'creativity' },
  { title: 'Come up with an alternate title for your day', category: 'creativity' },
  { title: 'Try writing a sentence with your non-dominant hand', category: 'creativity' },
  { title: 'Invent a new word and its definition', category: 'creativity' },
  { title: 'Arrange a small still life with nearby objects', category: 'creativity' },
  { title: 'Write a two-line poem', category: 'creativity' },
  { title: 'Imagine a plot twist for your day', category: 'creativity' },
]
const AUTO_TASKS_PER_DAY = 2
// How many recent picks to remember and avoid repeating, roughly the last few days' worth.
const AUTO_HISTORY_LIMIT = AUTO_TASKS_PER_DAY * 5

// A single, stable, never-deletable task that always exists — a guaranteed win on days when
// nothing else feels possible. Unlike the rotating auto pool, its wording never changes.
const ANCHOR_TASK_ID = 'anchor-tiny-win'
const ANCHOR_TASK_TITLE = 'Take one slow breath'

function loadTasks(storageKey: string): Task[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<Task>[]
    return parsed.map((t) => ({
      recurrence: 'none',
      recurDays: [],
      bucket: 'today',
      category: null,
      lastResetDate: null,
      source: 'user',
      pointsAwarded: null,
      ...t,
    })) as Task[]
  } catch {
    return []
  }
}

/** Whether a recurring task is due today — 'daily' always is; 'weekly' only on its chosen days. */
export function isScheduledToday(task: Task): boolean {
  if (task.recurrence === 'daily') return true
  if (task.recurrence === 'weekly') return task.recurDays.includes(dayOfWeek(todayKey()))
  return false
}

function loadAutoHistory(autoHistoryKey: string): string[] {
  try {
    const raw = localStorage.getItem(autoHistoryKey)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveAutoHistory(autoHistoryKey: string, history: string[]) {
  try {
    localStorage.setItem(autoHistoryKey, JSON.stringify(history.slice(-AUTO_HISTORY_LIMIT)))
  } catch {
    // ignore — worst case a suggestion repeats sooner than intended
  }
}

/** Picks `n` auto tasks, preferring distinct categories and avoiding recently-shown titles. */
function pickAutoTasks(n: number, autoHistoryKey: string): AutoTaskDef[] {
  const history = loadAutoHistory(autoHistoryKey)
  const categories = [...new Set(AUTO_TASK_POOL.map((t) => t.category))].sort(() => Math.random() - 0.5)
  const picked: AutoTaskDef[] = []

  function pickFrom(pool: AutoTaskDef[]): AutoTaskDef | null {
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  for (const category of categories) {
    if (picked.length >= n) break
    const inCategory = AUTO_TASK_POOL.filter(
      (t) => t.category === category && !picked.some((p) => p.title === t.title),
    )
    const unseen = inCategory.filter((t) => !history.includes(t.title))
    const task = pickFrom(unseen.length > 0 ? unseen : inCategory)
    if (task) picked.push(task)
  }

  // Fallback for the unlikely case the pool can't cover `n` distinct categories.
  while (picked.length < n) {
    const remaining = AUTO_TASK_POOL.filter((t) => !picked.some((p) => p.title === t.title))
    const task = pickFrom(remaining)
    if (!task) break
    picked.push(task)
  }

  return picked
}

function makeAutoTask(title: string, today: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    done: false,
    createdAt: Date.now(),
    completedAt: null,
    recurrence: 'none',
    recurDays: [],
    bucket: 'today',
    category: null,
    lastResetDate: today,
    source: 'auto',
    pointsAwarded: null,
  }
}

function makeAnchorTask(today: string): Task {
  return {
    id: ANCHOR_TASK_ID,
    title: ANCHOR_TASK_TITLE,
    done: false,
    createdAt: Date.now(),
    completedAt: null,
    recurrence: 'daily',
    recurDays: [],
    bucket: 'today',
    category: null,
    lastResetDate: today,
    source: 'anchor',
    pointsAwarded: null,
  }
}

/** Resets stale user/anchor recurring tasks and swaps in a fresh batch of auto-suggested tasks for today. */
function rollover(tasks: Task[], autoHistoryKey: string): Task[] {
  const today = todayKey()
  let changed = false

  let next = tasks.map((t) => {
    if (
      (t.source === 'user' || t.source === 'anchor') &&
      t.recurrence !== 'none' &&
      t.lastResetDate !== today &&
      isScheduledToday(t)
    ) {
      changed = true
      return { ...t, done: false, completedAt: null, lastResetDate: today }
    }
    return t
  })

  const hasFreshAuto = next.some((t) => t.source === 'auto' && t.lastResetDate === today)
  if (!hasFreshAuto) {
    changed = true
    next = next.filter((t) => t.source !== 'auto')
    const picks = pickAutoTasks(AUTO_TASKS_PER_DAY, autoHistoryKey)
    const fresh = picks.map((p) => makeAutoTask(p.title, today))
    next = [...fresh, ...next]
    saveAutoHistory(autoHistoryKey, [...loadAutoHistory(autoHistoryKey), ...picks.map((p) => p.title)])
  }

  const hasAnchor = next.some((t) => t.id === ANCHOR_TASK_ID)
  if (!hasAnchor) {
    changed = true
    next = [...next, makeAnchorTask(today)]
  } else {
    // keep it pinned last so it doesn't drift up the list as fresh auto tasks get prepended,
    // and pick up any copy change to its wording for anyone who already has one saved
    let anchor = next.find((t) => t.id === ANCHOR_TASK_ID)!
    if (anchor.title !== ANCHOR_TASK_TITLE) {
      anchor = { ...anchor, title: ANCHOR_TASK_TITLE }
      changed = true
    }
    const rest = next.filter((t) => t.id !== ANCHOR_TASK_ID)
    if (next[next.length - 1]?.id !== ANCHOR_TASK_ID) changed = true
    next = [...rest, anchor]
  }

  return changed ? next : tasks
}

export function useTasks(profileId: string) {
  const [tasksKey] = useState(() => profileKey(profileId, 'tasks'))
  const [autoHistoryKey] = useState(() => profileKey(profileId, 'autoTaskHistory'))
  const [tasks, setTasks] = useState<Task[]>(() => rollover(loadTasks(tasksKey), autoHistoryKey))

  useEffect(() => {
    localStorage.setItem(tasksKey, JSON.stringify(tasks))
  }, [tasks, tasksKey])

  useEffect(() => {
    function checkRollover() {
      setTasks((prev) => rollover(prev, autoHistoryKey))
    }
    document.addEventListener('visibilitychange', checkRollover)
    window.addEventListener('focus', checkRollover)
    return () => {
      document.removeEventListener('visibilitychange', checkRollover)
      window.removeEventListener('focus', checkRollover)
    }
  }, [autoHistoryKey])

  function addTask(
    title: string,
    recurrence: TaskRecurrence = 'none',
    recurDays: number[] = [],
    bucket: TaskBucket = 'today',
    category: TaskCategory | null = null,
  ) {
    const trimmed = title.trim()
    if (!trimmed) return
    // Someday only makes sense for a plain, non-recurring task — a recurring task is by
    // definition scheduled, so it can't also be "not scheduled yet."
    const effectiveBucket: TaskBucket = recurrence === 'none' ? bucket : 'today'
    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
      completedAt: null,
      recurrence,
      recurDays: recurrence === 'weekly' ? recurDays : [],
      bucket: effectiveBucket,
      category,
      lastResetDate: recurrence === 'none' ? null : todayKey(),
      source: 'user',
      pointsAwarded: null,
    }
    setTasks((prev) => [task, ...prev])
  }

  function setBucket(id: string, bucket: TaskBucket) {
    setTasks((prev) => prev.map((t) => (t.id === id && t.recurrence === 'none' ? { ...t, bucket } : t)))
  }

  function setCategory(id: string, category: TaskCategory | null) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)))
  }

  /** `pointsAwarded` should be passed when marking a task done, so undo can refund the exact (possibly bonus) amount. */
  function toggleTask(id: string, pointsAwarded?: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const nowDone = !t.done
        return {
          ...t,
          done: nowDone,
          completedAt: nowDone ? Date.now() : null,
          lastResetDate: t.recurrence !== 'none' ? todayKey() : t.lastResetDate,
          pointsAwarded: nowDone ? (pointsAwarded ?? null) : null,
        }
      }),
    )
  }

  function editTask(id: string, title: string) {
    if (id === ANCHOR_TASK_ID) return
    const trimmed = title.trim()
    if (!trimmed) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)))
  }

  function deleteTask(id: string) {
    if (id === ANCHOR_TASK_ID) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !(t.done && t.recurrence === 'none' && t.source === 'user')))
  }

  return { tasks, addTask, toggleTask, editTask, deleteTask, clearCompleted, setBucket, setCategory }
}
