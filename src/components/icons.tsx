interface IconProps {
  className?: string
}

const base = { width: 16, height: 16, 'aria-hidden': true } as const

export function RepeatIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 6.5A6 6 0 1 0 16 10" />
      <path d="M16 3v4h-4" />
    </svg>
  )
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.2c.6 2.6-2.6 3.9-2.6 6.8a2.6 2.6 0 1 0 5.2 0c0-.8-.6-1.3-.8-2.1.9.6 1.7 2 1.7 4a4.1 4.1 0 1 1-8.2 0c0-3.4 2.2-4.6 3.3-6.4.5-.8.9-1.5 1.4-2.3z" />
    </svg>
  )
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 17.2s-6.2-4.4-8.2-8.6C.6 5.9 2 3 5 3c1.8 0 3.2 1 4 2.3C9.8 4 11.2 3 13 3c3 0 4.4 2.9 3.2 5.6-2 4.2-8.2 8.6-8.2 8.6z" />
    </svg>
  )
}

export function BoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <rect x="6" y="8.3" width="8" height="3.4" rx="1.7" />
      <circle cx="4.3" cy="7.3" r="2.3" />
      <circle cx="4.3" cy="12.7" r="2.3" />
      <circle cx="15.7" cy="7.3" r="2.3" />
      <circle cx="15.7" cy="12.7" r="2.3" />
    </svg>
  )
}

export function BallIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="7" fill="currentColor" fillOpacity="0.15" />
      <circle cx="10" cy="10" r="7" />
      <path d="M4 8h12M4 12h12" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      width={12}
      height={12}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4L16 6" />
    </svg>
  )
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3.5" width="4" height="4" rx="1" />
      <path d="M9.5 5.5h7" />
      <rect x="3" y="11" width="4" height="4" rx="1" />
      <path d="M9.5 13h7" />
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2.5l6 2.2v4.6c0 4-2.5 7-6 8.2-3.5-1.2-6-4.2-6-8.2V4.7z" />
      <path d="M7.3 10l1.9 1.9L12.9 8" />
    </svg>
  )
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h8v4a4 4 0 0 1-8 0z" />
      <path d="M6 4H3.5a2 2 0 0 0 0 4H6M14 4h2.5a2 2 0 0 1 0 4H14" />
      <path d="M10 11v3M7 17h6M8 14h4v3H8z" />
    </svg>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.5l2.5 5.4 5.9.6-4.4 4 1.2 5.8-5.2-3-5.2 3 1.2-5.8-4.4-4 5.9-.6z" />
    </svg>
  )
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    >
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.4" />
      <circle cx="10" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8a5 5 0 0 1 10 0c0 4 1.5 5 1.5 5h-13S5 12 5 8z" />
      <path d="M8.2 16.5a1.8 1.8 0 0 0 3.6 0" />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      width={12}
      height={12}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
    </svg>
  )
}

export function PawIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <circle cx="5.2" cy="6.4" r="1.7" />
      <circle cx="9.4" cy="4.6" r="1.7" />
      <circle cx="13.6" cy="6.4" r="1.7" />
      <circle cx="16.2" cy="10.2" r="1.6" />
      <path d="M10 9.2c2.6 0 4.7 2.1 4.7 4.3 0 1.6-1.3 2.8-3 2.8-.8 0-1.2-.4-1.7-.4s-.9.4-1.7.4c-1.7 0-3-1.2-3-2.8 0-2.2 2.1-4.3 4.7-4.3z" />
    </svg>
  )
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 1.5l1.3 4.2L14.5 7l-4.2 1.3L9 12.5l-1.3-4.2L3.5 7l4.2-1.3z" />
      <path d="M15.5 11l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
    </svg>
  )
}

export function ZzzIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5h6l-6 6h6" />
      <path d="M11 9h4.5l-4.5 4h4.5" opacity="0.7" />
      <path d="M15.5 3.5h3l-3 3h3" opacity="0.45" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 6v4.2l3 2" />
    </svg>
  )
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      width={14}
      height={14}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  )
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.5 3H4.5A1.5 1.5 0 0 0 3 4.5v6l7.4 7.4a1.5 1.5 0 0 0 2.1 0l5.4-5.4a1.5 1.5 0 0 0 0-2.1z" />
      <circle cx="7" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="6.5" r="3.5" />
      <path d="M3.5 17c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  )
}

export function GameIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 6.5h9a3 3 0 0 1 3 3.4l-.6 4a2 2 0 0 1-3.4 1.1L12 13.5H8l-1.5 1.5a2 2 0 0 1-3.4-1.1l-.6-4a3 3 0 0 1 3-3.4z" />
      <path d="M6.5 9v3M5 10.5h3" />
      <circle cx="14" cy="9.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CoinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="10" cy="10" r="7.2" fill="currentColor" fillOpacity="0.15" />
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 6.5v7M8 8.3c0-1 .9-1.6 2-1.6s2 .6 2 1.6-.9 1.4-2 1.4-2 .5-2 1.5.9 1.6 2 1.6 2-.6 2-1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ShopIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8l1-4h10l1 4" />
      <path d="M3.5 8h13v7a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 15z" />
      <path d="M7.5 8v1.5a2.5 2.5 0 0 0 5 0V8" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M7 3v3M13 3v3" />
    </svg>
  )
}

export function BackupIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12.5v2.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
      <path d="M10 2.5v9.5M6.5 8.5 10 12l3.5-3.5" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      {...base}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}
