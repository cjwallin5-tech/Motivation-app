import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { PetMood, PetStage } from '../usePet'
import type { PlacedDecor } from '../types'
import type { ZoneKey } from '../zones'
import { spriteSrc } from '../petSprite'
import { CLASSIC_TREAT_ID } from '../treats'
import { CLASSIC_TOY_ID } from '../toys'
import { BallIcon, BoneIcon, CloseIcon, HeartIcon, SparkleIcon, ZzzIcon } from './icons'

interface Props {
  stage: PetStage
  zone: ZoneKey
  speciesId: string
  variantId: string
  outfitId: string
  placedDecor: PlacedDecor[]
  onMoveDecor: (id: string, x: number, y: number) => void
  onRemoveDecor: (id: string) => void
  treatId: string
  toyId: string
  mood: PetMood
}

// Keeps dragged decor clear of the top HUD overlay and the bottom feed/play action row.
const DECOR_BOUNDS = { xMin: 6, xMax: 94, yMin: 20, yMax: 82 }

type PropKind = 'treat' | 'toy'
type Command = { type: 'feed' | 'play' } | null

function propSrc(kind: PropKind, treatId: string, toyId: string): string {
  if (kind === 'treat') return treatId === CLASSIC_TREAT_ID ? '/pet/treat.png' : `/pet/treat-${treatId}.png`
  return toyId === CLASSIC_TOY_ID ? '/pet/toy.png' : `/pet/toy-${toyId}.png`
}

const FRAME_COUNT: Record<PetStage, number> = {
  egg: 2,
  hatchling: 5,
  dragon: 5,
}

const REACTION_FRAME = 4
const BOUNDS = { min: 6, max: 76 } // percent, left edge of a 20%-wide sprite
const WALK_SPEED = 9 // percent per second
const PROP_X: Record<PropKind, number> = { treat: 22, toy: 56 }

type Accent = 'heart' | 'sparkle' | 'zzz'

// Purely cosmetic idle pacing per mood — never surfaced as a labeled stat, just a vibe. 'cozy'
// lingers longer between wanders and never implies anything's wrong, just a quieter day.
const MOOD_CONFIG: Record<PetMood, { pauseMin: number; pauseMax: number; accent: Accent | null }> = {
  excited: { pauseMin: 900, pauseMax: 2000, accent: 'sparkle' },
  content: { pauseMin: 1800, pauseMax: 4000, accent: null },
  cozy: { pauseMin: 2800, pauseMax: 5400, accent: 'zzz' },
}
const AMBIENT_ACCENT_CHANCE = 0.4

export function PetRoom({
  stage,
  zone,
  speciesId,
  variantId,
  outfitId,
  placedDecor,
  onMoveDecor,
  onRemoveDecor,
  treatId,
  toyId,
  mood,
}: Props) {
  const [x, setX] = useState(40)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [frame, setFrame] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const [accent, setAccent] = useState<Accent | null>(null)
  const [command, setCommand] = useState<Command>(null)
  const [activeProp, setActiveProp] = useState<PropKind | null>(null)
  const [bouncing, setBouncing] = useState(false)
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null)

  const timers = useRef<number[]>([])
  const interval = useRef<number | null>(null)
  const roomRef = useRef<HTMLDivElement>(null)

  const canInteract = stage !== 'egg'
  const busy = command !== null

  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (interval.current) {
      window.clearInterval(interval.current)
      interval.current = null
    }
    setFrame(0)
    setTransitionMs(0)

    if (stage === 'egg') {
      function blinkLoop() {
        setFrame(1)
        const closeFor = window.setTimeout(() => {
          setFrame(0)
          const nextBlink = window.setTimeout(blinkLoop, 2200 + Math.random() * 1800)
          timers.current.push(nextBlink)
        }, 220)
        timers.current.push(closeFor)
      }
      const first = window.setTimeout(blinkLoop, 1500)
      timers.current.push(first)
      return () => timers.current.forEach((t) => window.clearTimeout(t))
    }

    function walkTo(target: number, onArrive: () => void) {
      setX((current) => {
        const distance = Math.abs(target - current)
        const duration = Math.max(500, (distance / WALK_SPEED) * 1000)
        setFacing(target >= current ? 1 : -1)
        setTransitionMs(duration)
        setFrame(2)

        let toggled = false
        interval.current = window.setInterval(() => {
          toggled = !toggled
          setFrame(toggled ? 3 : 2)
        }, 260)

        const arrive = window.setTimeout(() => {
          if (interval.current) {
            window.clearInterval(interval.current)
            interval.current = null
          }
          onArrive()
        }, duration)
        timers.current.push(arrive)

        return target
      })
    }

    function idleLoop() {
      setFrame(0)
      const { pauseMin, pauseMax, accent: moodAccent } = MOOD_CONFIG[mood]
      const pauseFor = pauseMin + Math.random() * (pauseMax - pauseMin)
      if (moodAccent && Math.random() < AMBIENT_ACCENT_CHANCE) {
        const showAt = window.setTimeout(() => {
          setAccent(moodAccent)
          const hide = window.setTimeout(() => setAccent(null), 900)
          timers.current.push(hide)
        }, 250)
        timers.current.push(showAt)
      }
      const t = window.setTimeout(() => {
        setFrame(1)
        const t2 = window.setTimeout(() => {
          const target = BOUNDS.min + Math.random() * (BOUNDS.max - BOUNDS.min)
          walkTo(target, idleLoop)
        }, 200)
        timers.current.push(t2)
      }, pauseFor)
      timers.current.push(t)
    }

    if (command) {
      const propKind: PropKind = command.type === 'feed' ? 'treat' : 'toy'
      setActiveProp(propKind)
      walkTo(PROP_X[propKind], () => {
        let toggled = false
        setFrame(REACTION_FRAME)
        setBouncing(true)
        interval.current = window.setInterval(() => {
          toggled = !toggled
          setFrame(toggled ? 0 : REACTION_FRAME)
        }, 220)
        const reactTimer = window.setTimeout(() => {
          if (interval.current) {
            window.clearInterval(interval.current)
            interval.current = null
          }
          setBouncing(false)
          setActiveProp(null)
          setCommand(null)
        }, 1400)
        timers.current.push(reactTimer)
      })
      return () => {
        timers.current.forEach((t) => window.clearTimeout(t))
        if (interval.current) window.clearInterval(interval.current)
      }
    }

    const kickoff = window.setTimeout(idleLoop, 600)
    timers.current.push(kickoff)

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (interval.current) window.clearInterval(interval.current)
    }
  }, [stage, command, mood])

  function handlePoke() {
    setAccent('heart')
    const t = window.setTimeout(() => setAccent(null), 700)
    timers.current.push(t)
  }

  function handleFeed() {
    if (!canInteract || busy) return
    setCommand({ type: 'feed' })
  }

  function handlePlay() {
    if (!canInteract || busy) return
    setCommand({ type: 'play' })
  }

  function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v))
  }

  function posFromEvent(e: ReactPointerEvent): { x: number; y: number } | null {
    const rect = roomRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    return {
      x: clamp(xPct, DECOR_BOUNDS.xMin, DECOR_BOUNDS.xMax),
      y: clamp(yPct, DECOR_BOUNDS.yMin, DECOR_BOUNDS.yMax),
    }
  }

  function handleDecorPointerDown(id: string, e: ReactPointerEvent<HTMLDivElement>) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = posFromEvent(e)
    setDragging({ id, x: pos?.x ?? 50, y: pos?.y ?? 50 })
  }

  function handleDecorPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const pos = posFromEvent(e)
    if (pos) setDragging({ id: dragging.id, ...pos })
  }

  function handleDecorPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const pos = posFromEvent(e)
    onMoveDecor(dragging.id, pos?.x ?? dragging.x, pos?.y ?? dragging.y)
    setDragging(null)
  }

  const frameCount = FRAME_COUNT[stage]
  const bgPositionX = frameCount > 1 ? (frame / (frameCount - 1)) * 100 : 0

  return (
    <div ref={roomRef} className="pet-room" style={{ backgroundImage: `url(/pet/zone-${zone}.png)` }}>
      {placedDecor.map((d) => {
        const pos = dragging && dragging.id === d.id ? dragging : d
        return (
          <div
            key={d.id}
            className={`room-decor-wrap${dragging?.id === d.id ? ' dragging' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onPointerDown={(e) => handleDecorPointerDown(d.id, e)}
            onPointerMove={handleDecorPointerMove}
            onPointerUp={handleDecorPointerUp}
            onPointerCancel={handleDecorPointerUp}
          >
            <img className="room-decor" src={`/pet/decor-${d.id}.png`} alt="" draggable={false} />
            <button
              type="button"
              className="room-decor-remove"
              aria-label="Remove from room"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onRemoveDecor(d.id)
              }}
            >
              <CloseIcon />
            </button>
          </div>
        )
      })}
      {activeProp && (
        <img
          className="room-prop"
          src={propSrc(activeProp, treatId, toyId)}
          alt=""
          style={{ left: `${PROP_X[activeProp]}%` }}
        />
      )}
      <button
        type="button"
        className={`pet-sprite-button${bouncing ? ' bouncing' : ''}`}
        style={{ left: `${x}%`, transition: `left ${transitionMs}ms linear` }}
        onClick={handlePoke}
        aria-label="Pet your companion"
      >
        <span
          className="pet-sprite"
          style={{
            backgroundImage: `url(${spriteSrc(stage, speciesId, variantId, outfitId)})`,
            backgroundSize: `${frameCount * 100}% 100%`,
            backgroundPositionX: `${bgPositionX}%`,
            transform: `scaleX(${facing})`,
          }}
        />
        {accent && (
          <span className={`pet-accent pet-accent-${accent}`}>
            {accent === 'heart' && <HeartIcon />}
            {accent === 'sparkle' && <SparkleIcon />}
            {accent === 'zzz' && <ZzzIcon />}
          </span>
        )}
      </button>

      {canInteract ? (
        <div className="pet-actions">
          <div className="pet-action">
            <button type="button" onClick={handleFeed} disabled={busy} aria-label="Feed your companion">
              <BoneIcon />
            </button>
            <span className="pet-action-label">Feed</span>
          </div>
          <div className="pet-action">
            <button type="button" onClick={handlePlay} disabled={busy} aria-label="Play with your companion">
              <BallIcon />
            </button>
            <span className="pet-action-label">Play</span>
          </div>
        </div>
      ) : (
        <p className="pet-room-hint">Your egg is cozy for now — level up to unlock feeding and play.</p>
      )}
    </div>
  )
}
