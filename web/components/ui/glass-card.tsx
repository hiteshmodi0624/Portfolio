import type { HTMLAttributes } from 'react'

export type GlassCardProps = HTMLAttributes<HTMLDivElement>

/** Soft glass card (spec §2 texture). Pure presentational wrapper — no hooks,
 * safe in server and client trees alike. */
export function GlassCard({ className = '', children, ...rest }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-ink/5 backdrop-blur ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
