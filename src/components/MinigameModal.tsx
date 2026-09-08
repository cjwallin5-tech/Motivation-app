import { useEffect, useRef, useState } from 'react'
import type { PetStage } from '../usePet'
import { spriteSrc } from '../petSprite'
import { ROUND_SECONDS, TREAT_BOUNDS, TREAT_GAP_MS, TREAT_VISIBLE_MS } from '../minigame'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  stage: PetStage
  speciesId: string
  variantId: string
  outfitId: string
  bestScore: number
  onFinish: (score: number) => void
}

type Phase = 'intro' | 'playing' | 'result'

const HAPPY_FRAME = 4
const FRAME_COUNT = 5

function randomTreatX(): number {
  return TREAT_BOUNDS.min + Math.random() * (TREAT_BOUNDS.max - TREAT_BOUNDS.min)
}

export function MinigameModal({ open, onClose, stage, speciesId, variantId, outfitId, bestScore, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [treatVisible, setTreatVisible] = useState(false)
  const [treatX, setTreatX] = useState(50)
  const [happy, setHappy] = useState(false)

  // A single pending timer for the treat show/hide cycle — catching a treat must cancel
  // whatever was already scheduled before scheduling the next step, or two cycles can run
  // in parallel and desync the game.
  const cycleTimer = useRef<number | null>(null)
  const happyTimer = useRef<number | null>(null)
  const scoreRef = useRef(0)
  // Snapshot of the best score *before* this round, since the `bestScore` prop updates (via
  // the parent) before the result screen renders — comparing against the live prop would call
  // a tied score a "new best" too.
  const roundStartBest = useRef(bestScore)

  function clearCycle() {
    if (cycleTimer.current !== null) {
      window.clearTimeout(cycleTimer.current)
      cycleTimer.current = null
    }
  }

  function scheduleHide() {
    clearCycle()
    cycleTimer.current = window.setTimeout(() => {
      setTreatVisible(false)
      scheduleSpawn(TREAT_GAP_MS)
    }, TREAT_VISIBLE_MS)
  }

  function scheduleSpawn(delay: number) {
    clearCycle()
    cycleTimer.current = window.setTimeout(() => {
      setTreatX(randomTreatX())
      setTreatVisible(true)
      scheduleHide()
    }, delay)
  }

  useEffect(() => {
    if (phase !== 'playing') return

    scheduleSpawn(0)

    const tick = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(tick)
          clearCycle()
          setTreatVisible(false)
          setPhase('result')
          onFinish(scoreRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(tick)
      clearCycle()
    }
    // Deliberately keyed on `phase` alone — scheduleSpawn/onFinish are recreated every render
    // and must not restart the treat cycle on state changes during play (score, treatX, ...).
  }, [phase])

  if (!open) return null

  function startRound() {
    setScore(0)
    scoreRef.current = 0
    roundStartBest.current = bestScore
    setTimeLeft(ROUND_SECONDS)
    setPhase('playing')
  }

  function handleCatch() {
    if (!treatVisible) return
    setTreatVisible(false)
    setScore((s) => {
      const next = s + 1
      scoreRef.current = next
      return next
    })
    setHappy(true)
    if (happyTimer.current !== null) window.clearTimeout(happyTimer.current)
    happyTimer.current = window.setTimeout(() => setHappy(false), 350)
    scheduleSpawn(TREAT_GAP_MS)
  }

  function handleClose() {
    clearCycle()
    if (happyTimer.current !== null) window.clearTimeout(happyTimer.current)
    setPhase('intro')
    onClose()
  }

  const frame = happy ? HAPPY_FRAME : 0
  const bgPositionX = (frame / (FRAME_COUNT - 1)) * 100

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1>Catch</h1>
          <button type="button" className="modal-close" aria-label="Close" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {phase === 'intro' && (
            <div className="minigame-intro">
              <span
                className="species-thumb big"
                style={{
                  backgroundImage: `url(${spriteSrc(stage, speciesId, variantId, outfitId)})`,
                  backgroundSize: '500% 100%',
                }}
              />
              <p className="starter-picker-copy">
                Tap the treats before they disappear. {ROUND_SECONDS} seconds, no wrong answers —
                a miss just fades and another shows up.
              </p>
              {bestScore > 0 && <p className="progress">Best so far: {bestScore}</p>}
              <button type="button" className="starter-confirm" onClick={startRound}>
                Start
              </button>
            </div>
          )}

          {phase === 'playing' && (
            <div className="minigame-field">
              <div className="minigame-hud">
                <span>Score: {score}</span>
                <span>{timeLeft}s</span>
              </div>
              <div className="minigame-stage">
                <div className={`pet-sprite-button minigame-pet${happy ? ' bouncing' : ''}`}>
                  <span
                    className="pet-sprite"
                    style={{
                      backgroundImage: `url(${spriteSrc(stage, speciesId, variantId, outfitId)})`,
                      backgroundSize: `${FRAME_COUNT * 100}% 100%`,
                      backgroundPositionX: `${bgPositionX}%`,
                    }}
                  />
                </div>
                {treatVisible && (
                  <button
                    type="button"
                    className="minigame-treat"
                    onClick={handleCatch}
                    style={{ left: `${treatX}%` }}
                    aria-label="Catch the treat"
                  >
                    <img src="/pet/treat.png" alt="" />
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className="minigame-intro">
              <span
                className="species-thumb big"
                style={{
                  backgroundImage: `url(${spriteSrc(stage, speciesId, variantId, outfitId)})`,
                  backgroundSize: '500% 100%',
                }}
              />
              <p className="starter-picker-copy">
                {score > roundStartBest.current
                  ? `New best! You caught ${score} treat${score === 1 ? '' : 's'}.`
                  : `You caught ${score} treat${score === 1 ? '' : 's'}.`}
              </p>
              <div className="starter-name-actions">
                <button type="button" className="starter-back" onClick={handleClose}>
                  Close
                </button>
                <button type="button" className="starter-confirm" onClick={startRound}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
