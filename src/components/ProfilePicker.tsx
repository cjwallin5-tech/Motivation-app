import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { Profile } from '../profiles'
import { CloseIcon } from './icons'

interface Props {
  profiles: Profile[]
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

function initial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

function ProfileRow({
  profile,
  onSelect,
  onRename,
  onDelete,
}: {
  profile: Profile
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile.name)

  function commitEdit() {
    if (draft.trim()) onRename(profile.id, draft)
    else setDraft(profile.name)
    setEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') {
      setDraft(profile.name)
      setEditing(false)
    }
  }

  return (
    <li className="profile-row">
      <div
        className="profile-row-main"
        role="button"
        tabIndex={0}
        onClick={() => !editing && onSelect(profile.id)}
        onKeyDown={(e) => {
          if (!editing && (e.key === 'Enter' || e.key === ' ')) onSelect(profile.id)
        }}
      >
        <span className="profile-avatar">{initial(profile.name)}</span>
        {editing ? (
          <input
            className="profile-name-edit"
            value={draft}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className="profile-row-name"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
          >
            {profile.name}
          </span>
        )}
      </div>
      <button
        type="button"
        className="profile-row-delete"
        aria-label={`Delete ${profile.name}`}
        onClick={() => {
          if (window.confirm(`Delete ${profile.name}'s tasks and companion? This can't be undone.`)) {
            onDelete(profile.id)
          }
        }}
      >
        <CloseIcon />
      </button>
    </li>
  )
}

export function ProfilePicker({ profiles, onSelect, onCreate, onRename, onDelete }: Props) {
  const [adding, setAdding] = useState(profiles.length === 0)
  const [name, setName] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name)
    setName('')
    setAdding(false)
  }

  return (
    <div className="starter-picker profile-picker">
      <div className="starter-picker-copy">
        <h1>Who's this for?</h1>
        <p>Each person gets their own tasks, companion, and progress on this device.</p>
      </div>

      {profiles.length > 0 && (
        <ul className="profile-list">
          {profiles.map((p) => (
            <ProfileRow key={p.id} profile={p} onSelect={onSelect} onRename={onRename} onDelete={onDelete} />
          ))}
        </ul>
      )}

      {adding ? (
        <form className="profile-add-form" onSubmit={handleSubmit}>
          <input
            className="starter-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name"
            maxLength={24}
            autoFocus
          />
          <div className="starter-name-actions">
            {profiles.length > 0 && (
              <button type="button" className="starter-back" onClick={() => setAdding(false)}>
                Back
              </button>
            )}
            <button type="submit" className="starter-confirm" disabled={!name.trim()}>
              Add
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="profile-add-btn" onClick={() => setAdding(true)}>
          + Add person
        </button>
      )}
    </div>
  )
}
