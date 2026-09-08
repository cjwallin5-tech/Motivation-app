// A simple, known, low-pressure minigame played with your companion — unlocked at a level
// milestone independent of the species/outfit tracks (see companion/outfit memory for those).
export const MINIGAME_UNLOCK_LEVEL = 6

export const ROUND_SECONDS = 20
// How long a treat stays tappable before a new one takes its place. No penalty for missing —
// it just fades and another appears, matching the app's no-guilt design.
export const TREAT_VISIBLE_MS = 1100
export const TREAT_GAP_MS = 350

// Percent-of-room bounds a treat can appear in, matching PetRoom's own sprite bounds.
export const TREAT_BOUNDS = { min: 10, max: 80 }
