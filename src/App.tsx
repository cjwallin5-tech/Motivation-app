import { useEffect, useMemo, useRef, useState } from 'react'
import { PetPanel } from './components/PetPanel'
import { PetRoom } from './components/PetRoom'
import { TasksModal } from './components/TasksModal'
import { AchievementsModal } from './components/AchievementsModal'
import { CompanionsModal } from './components/CompanionsModal'
import { MinigameModal } from './components/MinigameModal'
import { ShopModal } from './components/ShopModal'
import { StarterPicker } from './components/StarterPicker'
import { ZoneTabs } from './components/ZoneTabs'
import { ProfilePicker } from './components/ProfilePicker'
import { CalendarIcon, ListIcon, ShopIcon, TrophyIcon } from './components/icons'
import { isScheduledToday, useTasks } from './useTasks'
import { usePet } from './usePet'
import { ACHIEVEMENTS } from './achievements'
import { DEFAULT_VARIANT_ID } from './petSpecies'
import { NONE_OUTFIT_ID, OUTFITS_BY_ID } from './outfits'
import { TREATS_BY_ID } from './treats'
import { TOYS_BY_ID } from './toys'
import { dateKey, todayKey } from './date'
import { randomReflection } from './reflections'
import { computeWeekStats, weekStartKey, weeklyRecapMessage } from './weeklySummary'
import {
  clearActiveProfileId,
  createProfile,
  deleteProfile,
  loadActiveProfileId,
  loadProfiles,
  profileKey,
  renameProfile,
  setActiveProfileId,
} from './profiles'
import type { Profile } from './profiles'
import type { ZoneKey } from './zones'
import {
  cancelReminder,
  disableDailyReminder,
  isNotificationsSupported,
  loadReminderHour,
  loadRemindersEnabled,
  loadReminderTone,
  refreshReminder,
  requestReminderPermission,
  saveReminderHour,
  saveReminderTone,
} from './notifications'
import type { ReminderTone } from './notifications'
import { loadFocusModeEnabled, saveFocusModeEnabled } from './focusMode'
import './App.css'

const EMPTY_MESSAGES = [
  "Nothing on your plate right now. Add one small thing.",
  "A clear list. Pick one thing you can do in the next 5 minutes.",
  "Start small — even one task counts.",
]

interface TaskAppProps {
  profileId: string
  profileName: string
  onSwitchProfile: () => void
}

function TaskApp({ profileId, profileName, onSwitchProfile }: TaskAppProps) {
  const { tasks, addTask, toggleTask, editTask, deleteTask, clearCompleted, setBucket } = useTasks(profileId)
  const pet = usePet(profileId)
  const weeklySummaryKey = profileKey(profileId, 'lastWeeklySummaryShown')

  const [toastQueue, setToastQueue] = useState<string[]>([])
  const [tasksOpen, setTasksOpen] = useState(false)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [companionsOpen, setCompanionsOpen] = useState(false)
  const [minigameOpen, setMinigameOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [achievementsInitialTab, setAchievementsInitialTab] = useState<'achievements' | 'history'>(
    'achievements',
  )
  const [zone, setZone] = useState<ZoneKey>('room')
  const [remindersEnabled, setRemindersEnabled] = useState(() => loadRemindersEnabled(profileId))
  const [reminderHour, setReminderHour] = useState(() => loadReminderHour(profileId))
  const [reminderTone, setReminderTone] = useState<ReminderTone>(() => loadReminderTone(profileId))
  const [focusModeEnabled, setFocusModeEnabled] = useState(() => loadFocusModeEnabled(profileId))
  const prevLevel = useRef(pet.level)
  const prevGraceUsed = useRef(pet.state.lastGraceUsed)
  const prevAchievements = useRef(pet.state.unlockedAchievements)
  const prevPendingSpeciesChoice = useRef(pet.state.pendingSpeciesChoice)
  const prevUnlockedOutfits = useRef(pet.state.unlockedOutfits)
  const prevPrestigeLevel = useRef(pet.state.highestPrestigeLevel)
  const prevUnlockedTreats = useRef(pet.state.unlockedTreats)
  const prevUnlockedToys = useRef(pet.state.unlockedToys)
  const cappedToastDate = useRef<string | null>(null)

  function pushToast(text: string) {
    setToastQueue((q) => [...q, text])
  }

  useEffect(() => {
    if (toastQueue.length === 0) return
    const timer = setTimeout(() => setToastQueue((q) => q.slice(1)), 3000)
    return () => clearTimeout(timer)
  }, [toastQueue])

  useEffect(() => {
    if (pet.level > prevLevel.current) {
      pushToast(`${pet.state.name} leveled up to level ${pet.level}!`)
    }
    prevLevel.current = pet.level
  }, [pet.level])

  useEffect(() => {
    if (pet.state.lastGraceUsed && pet.state.lastGraceUsed !== prevGraceUsed.current) {
      pushToast('Streak freeze used — your streak continues.')
    }
    prevGraceUsed.current = pet.state.lastGraceUsed
  }, [pet.state.lastGraceUsed])

  useEffect(() => {
    const newlyUnlocked = pet.state.unlockedAchievements.filter(
      (id) => !prevAchievements.current.includes(id),
    )
    for (const id of newlyUnlocked) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id)
      if (achievement) pushToast(`Achievement unlocked: ${achievement.title}`)
    }
    prevAchievements.current = pet.state.unlockedAchievements
  }, [pet.state.unlockedAchievements])

  useEffect(() => {
    if (pet.state.pendingSpeciesChoice && !prevPendingSpeciesChoice.current) {
      pushToast('A new companion wants to join you!')
    }
    prevPendingSpeciesChoice.current = pet.state.pendingSpeciesChoice
  }, [pet.state.pendingSpeciesChoice])

  useEffect(() => {
    const newlyUnlocked = pet.state.unlockedOutfits.filter(
      (id) => !prevUnlockedOutfits.current.includes(id),
    )
    for (const id of newlyUnlocked) {
      const outfit = OUTFITS_BY_ID[id]
      if (outfit) pushToast(`New outfit unlocked: ${outfit.name}! Equip it from Companions.`)
    }
    prevUnlockedOutfits.current = pet.state.unlockedOutfits
  }, [pet.state.unlockedOutfits])

  useEffect(() => {
    const newlyUnlocked = pet.state.unlockedTreats.filter((id) => !prevUnlockedTreats.current.includes(id))
    for (const id of newlyUnlocked) {
      const treat = TREATS_BY_ID[id]
      if (treat) pushToast(`New treat unlocked: ${treat.name}! Pick it from Companions.`)
    }
    prevUnlockedTreats.current = pet.state.unlockedTreats
  }, [pet.state.unlockedTreats])

  useEffect(() => {
    const newlyUnlocked = pet.state.unlockedToys.filter((id) => !prevUnlockedToys.current.includes(id))
    for (const id of newlyUnlocked) {
      const toy = TOYS_BY_ID[id]
      if (toy) pushToast(`New toy unlocked: ${toy.name}! Pick it from Companions.`)
    }
    prevUnlockedToys.current = pet.state.unlockedToys
  }, [pet.state.unlockedToys])

  useEffect(() => {
    if (pet.state.highestPrestigeLevel > prevPrestigeLevel.current && pet.prestigeTier) {
      pushToast(`New prestige tier: ${pet.prestigeTier.name}!`)
    }
    prevPrestigeLevel.current = pet.state.highestPrestigeLevel
  }, [pet.state.highestPrestigeLevel, pet.prestigeTier])

  // A one-time nudge when a new week starts, recapping the week that just ended — never on the
  // very first week anyone has data for, since there's nothing real to recap yet.
  useEffect(() => {
    function checkWeeklyRecap() {
      const currentWeekStart = weekStartKey(new Date())
      let lastShown: string | null = null
      try {
        lastShown = localStorage.getItem(weeklySummaryKey)
      } catch {
        // ignore — worst case the recap shows again next open
      }
      if (lastShown === currentWeekStart) return

      const prevStart = new Date(`${currentWeekStart}T00:00:00`)
      prevStart.setDate(prevStart.getDate() - 7)
      const prevStartKey = dateKey(prevStart)
      const prevEnd = new Date(prevStart)
      prevEnd.setDate(prevEnd.getDate() + 6)
      const prevEndKey = dateKey(prevEnd)

      const hadActivityByThen = Object.keys(pet.state.dailyActivity).some((k) => k <= prevEndKey)

      try {
        localStorage.setItem(weeklySummaryKey, currentWeekStart)
      } catch {
        // ignore
      }

      if (hadActivityByThen) {
        const stats = computeWeekStats(pet.state.dailyActivity, prevStartKey, 7)
        pushToast(weeklyRecapMessage(stats, 7))
      }
    }
    checkWeeklyRecap()
    document.addEventListener('visibilitychange', checkWeeklyRecap)
    window.addEventListener('focus', checkWeeklyRecap)
    return () => {
      document.removeEventListener('visibilitychange', checkWeeklyRecap)
      window.removeEventListener('focus', checkWeeklyRecap)
    }
  }, [pet.state.dailyActivity, weeklySummaryKey])

  const routine = tasks.filter(
    (t) => t.source === 'auto' || t.recurrence === 'daily' || (t.recurrence === 'weekly' && isScheduledToday(t)),
  )
  const oneOff = tasks.filter((t) => t.recurrence === 'none' && t.source === 'user' && t.bucket === 'today')
  const someday = tasks.filter((t) => t.recurrence === 'none' && t.source === 'user' && t.bucket === 'someday')
  const active = oneOff.filter((t) => !t.done)
  const completed = oneOff.filter((t) => t.done)
  const pendingCount = active.length + routine.filter((t) => !t.done).length
  // What a check-in reminder should suggest: their own next task first, falling back to a
  // routine/wellness prompt (the always-available anchor task lives in `routine` too, so this
  // is never null in practice).
  const suggestedTask = active[0]?.title ?? routine.find((t) => !t.done)?.title ?? null

  const emptyMessage = useMemo(
    () => EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)],
    [],
  )

  // Keeps the check-in reminder in sync: schedules a personalized nudge for later today when
  // nothing's done yet, cancels it the moment something is, and re-evaluates on focus so a
  // catch-up nudge still lands if the app is reopened after the usual hour.
  useEffect(() => {
    if (!remindersEnabled) return
    function refresh() {
      refreshReminder(profileId, {
        petName: pet.state.name,
        hasCompletedToday: pet.activeToday,
        streak: pet.effectiveStreak,
        suggestedTask,
      })
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [
    profileId,
    remindersEnabled,
    reminderHour,
    reminderTone,
    pet.activeToday,
    pet.effectiveStreak,
    pet.state.name,
    suggestedTask,
  ])

  function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    if (task.done) {
      pet.undoTask(task.pointsAwarded ?? 10, task.category)
      toggleTask(id)
    } else {
      const result = pet.completeTask(task.category)
      toggleTask(id, result.points)
      if (result.capped && result.points === 0) {
        const today = todayKey()
        if (cappedToastDate.current !== today) {
          pushToast("You've hit today's XP limit — nice work! More tomorrow.")
          cappedToastDate.current = today
        }
      } else if (result.bonusTier === 'welcome') {
        pushToast(`Welcome back! +${result.points} XP — good to see you again.`)
      } else if (result.bonusTier === 'rare') {
        pushToast(`Big bonus! +${result.points} XP`)
      } else if (result.bonusTier === 'small') {
        pushToast(`Bonus! +${result.points} XP`)
      }
      if (result.showReflection) {
        pushToast(randomReflection())
      }
    }
  }

  function handleToggleFocusMode(next: boolean) {
    setFocusModeEnabled(next)
    saveFocusModeEnabled(profileId, next)
  }

  async function handleToggleReminders(next: boolean) {
    if (next) {
      setRemindersEnabled(await requestReminderPermission(profileId))
    } else {
      await disableDailyReminder(profileId)
      setRemindersEnabled(false)
    }
  }

  function handleReminderHourChange(hour: number) {
    saveReminderHour(profileId, hour)
    setReminderHour(hour)
  }

  function handleReminderToneChange(tone: ReminderTone) {
    saveReminderTone(profileId, tone)
    setReminderTone(tone)
  }

  if (!pet.state.speciesId) {
    return (
      <div className="app">
        <StarterPicker onChoose={pet.chooseStarterSpecies} />
      </div>
    )
  }

  return (
    <div className="app">
      {toastQueue[0] && <div className="toast-banner">{toastQueue[0]}</div>}

      <PetRoom
        key={zone}
        stage={pet.stage}
        zone={zone}
        speciesId={pet.state.speciesId}
        variantId={pet.state.speciesVariant[pet.state.speciesId] ?? DEFAULT_VARIANT_ID}
        outfitId={pet.state.outfitBySpecies[pet.state.speciesId] ?? NONE_OUTFIT_ID}
        placedDecor={pet.state.placedDecor}
        onMoveDecor={pet.moveDecor}
        onRemoveDecor={pet.removeDecorFromRoom}
        treatId={pet.state.equippedTreatId}
        toyId={pet.state.equippedToyId}
        mood={pet.mood}
      />

      <div className="hud-top">
        <ZoneTabs level={pet.level} active={zone} onChange={setZone} />
        <PetPanel
          name={pet.state.name}
          level={pet.level}
          progress={pet.progress}
          pointsToNext={pet.pointsToNext}
          effectiveStreak={pet.effectiveStreak}
          longestStreak={pet.longestStreak}
          activeToday={pet.activeToday}
          hasStarted={pet.hasStarted}
          graceTokens={pet.state.graceTokens}
          coins={pet.state.coins}
          prestigeTier={pet.prestigeTier}
          hasPendingCompanion={pet.state.pendingSpeciesChoice !== null}
          onRename={pet.rename}
          onOpenCompanions={() => setCompanionsOpen(true)}
          onOpenMinigame={() => setMinigameOpen(true)}
        />
      </div>

      <div className="fab-stack fab-stack-left">
        <div className="fab-item">
          <button
            type="button"
            className="fab fab-secondary"
            onClick={() => {
              setAchievementsInitialTab('history')
              setAchievementsOpen(true)
            }}
            aria-label="Open history"
          >
            <CalendarIcon />
          </button>
          <span className="fab-label">History</span>
        </div>
        <div className="fab-item">
          <button
            type="button"
            className="fab achievements-fab"
            onClick={() => {
              setAchievementsInitialTab('achievements')
              setAchievementsOpen(true)
            }}
            aria-label="Open achievements"
          >
            <TrophyIcon />
            {pet.state.unlockedAchievements.length > 0 && (
              <span className="fab-badge accent">{pet.state.unlockedAchievements.length}</span>
            )}
          </button>
          <span className="fab-label">Awards</span>
        </div>
      </div>

      <div className="fab-stack fab-stack-right">
        <div className="fab-item">
          <button type="button" className="fab fab-secondary" onClick={() => setShopOpen(true)} aria-label="Open shop">
            <ShopIcon />
          </button>
          <span className="fab-label">Shop</span>
        </div>
        <div className="fab-item">
          <button type="button" className="fab tasks-fab" onClick={() => setTasksOpen(true)} aria-label="Open tasks">
            <ListIcon />
            {pendingCount > 0 && <span className="fab-badge">{pendingCount}</span>}
          </button>
          <span className="fab-label">Tasks</span>
        </div>
      </div>

      <AchievementsModal
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        unlockedIds={pet.state.unlockedAchievements}
        dailyActivity={pet.state.dailyActivity}
        categoryActivity={pet.state.categoryActivity}
        initialTab={achievementsInitialTab}
      />

      <CompanionsModal
        open={companionsOpen}
        onClose={() => setCompanionsOpen(false)}
        unlockedSpecies={pet.state.unlockedSpecies}
        activeSpeciesId={pet.state.speciesId}
        speciesVariant={pet.state.speciesVariant}
        pendingChoice={pet.state.pendingSpeciesChoice}
        onSwitch={pet.switchSpecies}
        onResolveChoice={pet.resolveSpeciesChoice}
        onSetVariant={pet.setSpeciesVariant}
        unlockedOutfits={pet.state.unlockedOutfits}
        outfitBySpecies={pet.state.outfitBySpecies}
        onSetOutfit={pet.setOutfit}
        unlockedTreats={pet.state.unlockedTreats}
        equippedTreatId={pet.state.equippedTreatId}
        onSetTreat={pet.setTreat}
        unlockedToys={pet.state.unlockedToys}
        equippedToyId={pet.state.equippedToyId}
        onSetToy={pet.setToy}
      />

      <MinigameModal
        open={minigameOpen}
        onClose={() => setMinigameOpen(false)}
        stage={pet.stage}
        speciesId={pet.state.speciesId}
        variantId={pet.state.speciesVariant[pet.state.speciesId] ?? DEFAULT_VARIANT_ID}
        outfitId={pet.state.outfitBySpecies[pet.state.speciesId] ?? NONE_OUTFIT_ID}
        bestScore={pet.state.minigameBestScore}
        onFinish={pet.recordMinigameScore}
      />

      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        coins={pet.state.coins}
        unlockedDecor={pet.state.unlockedDecor}
        placedDecorIds={pet.state.placedDecor.map((d) => d.id)}
        onPurchase={pet.purchaseDecor}
        onAddToRoom={pet.addDecorToRoom}
        onRemoveFromRoom={pet.removeDecorFromRoom}
      />

      <TasksModal
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        routine={routine}
        active={active}
        completed={completed}
        someday={someday}
        oneOffCount={oneOff.length}
        emptyMessage={emptyMessage}
        onAdd={addTask}
        onToggle={handleToggle}
        onEdit={editTask}
        onDelete={deleteTask}
        onClearCompleted={clearCompleted}
        onMoveBucket={setBucket}
        remindersSupported={isNotificationsSupported()}
        remindersEnabled={remindersEnabled}
        onToggleReminders={handleToggleReminders}
        reminderHour={reminderHour}
        onReminderHourChange={handleReminderHourChange}
        reminderTone={reminderTone}
        onReminderToneChange={handleReminderToneChange}
        focusModeEnabled={focusModeEnabled}
        onToggleFocusMode={handleToggleFocusMode}
        profileName={profileName}
        onSwitchProfile={onSwitchProfile}
      />
    </div>
  )
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles)
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    const stored = loadActiveProfileId()
    if (stored) return stored
    // A fresh migration from a pre-profiles install lands here with exactly one profile and no
    // active id yet — auto-select it so an existing single user never has to see the picker.
    if (profiles.length === 1) {
      setActiveProfileId(profiles[0].id)
      return profiles[0].id
    }
    return null
  })
  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null

  function handleSelect(id: string) {
    setActiveProfileId(id)
    setActiveProfileIdState(id)
  }

  function handleCreate(name: string) {
    const profile = createProfile(name)
    setProfiles((prev) => [...prev, profile])
    setActiveProfileId(profile.id)
    setActiveProfileIdState(profile.id)
  }

  function handleRename(id: string, name: string) {
    renameProfile(id, name)
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)))
  }

  function handleDelete(id: string) {
    deleteProfile(id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (activeProfileId === id) setActiveProfileIdState(null)
  }

  function handleSwitchProfile() {
    // Cancel any pending OS notification for the profile we're leaving — it shouldn't fire for
    // a companion that isn't the active one anymore.
    void cancelReminder()
    clearActiveProfileId()
    setActiveProfileIdState(null)
  }

  if (!activeProfile) {
    return (
      <div className="app">
        <ProfilePicker
          profiles={profiles}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
    )
  }

  return (
    <TaskApp
      key={activeProfile.id}
      profileId={activeProfile.id}
      profileName={activeProfile.name}
      onSwitchProfile={handleSwitchProfile}
    />
  )
}

export default App
