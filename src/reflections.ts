// Occasional, non-judgmental reminders that this record is for the player's own benefit, not a
// score to game. There's no way to verify a self-reported task without treating the user like a
// suspect (photo proof, timers, etc.) — which would work against the whole point of a tool meant
// to help with ADHD/depression. The honest alternative: make the reward itself feel hollow to
// fake, by keeping the framing on "this is your own record" rather than "beat the number."
export const REFLECTIONS: string[] = [
  'This is your record, not a test — no one’s grading it.',
  'Showing up matters more than how it looks on paper.',
  'No one’s watching this but you — be honest with yourself, for yourself.',
  'A slow week is still a week you kept going.',
  'This works best when it’s true, even on the small days.',
  'Progress looks different every day, and that’s okay.',
]

export function randomReflection(): string {
  return REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]
}
