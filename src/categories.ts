import type { TaskCategory } from './types'

export interface CategoryDef {
  id: TaskCategory
  label: string
  color: string
}

export const TASK_CATEGORIES: CategoryDef[] = [
  { id: 'chores', label: 'Chores', color: '#8a7157' },
  { id: 'health', label: 'Health', color: '#4f9d69' },
  { id: 'work', label: 'Work', color: '#4a7fc9' },
  { id: 'social', label: 'Social', color: '#c96fa0' },
  { id: 'selfCare', label: 'Self-care', color: '#c98a4a' },
  { id: 'creative', label: 'Creative', color: '#9b6fc9' },
]

export const TASK_CATEGORIES_BY_ID: Record<TaskCategory, CategoryDef> = Object.fromEntries(
  TASK_CATEGORIES.map((c) => [c.id, c]),
) as Record<TaskCategory, CategoryDef>
