// − n + quantity control. 44 px targets; the number rolls when it changes.
import { RollingNumber } from './RollingNumber'

type Props = { value: number; onChange: (n: number) => void; label: string; min?: number; tone?: 'ink' | 'icing' }

export function QtyStepper({ value, onChange, label, min = 0, tone = 'ink' }: Props) {
  const ring = tone === 'ink' ? 'border-ink/20 text-ink' : 'border-icing/30 text-icing'
  return (
    <div className={`stepper inline-flex h-11 items-center rounded-roundel border ${ring}`} role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))} aria-label={value - 1 <= 0 && min === 0 ? `Remove ${label}` : `One less ${label}`}>
        −
      </button>
      <span className="min-w-6 text-center font-display text-small font-bold" aria-live="polite">
        <RollingNumber value={value} />
      </span>
      <button type="button" className="stepper-btn" onClick={() => onChange(Math.min(99, value + 1))} aria-label={`One more ${label}`}>
        +
      </button>
    </div>
  )
}
