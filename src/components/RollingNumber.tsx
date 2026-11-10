// Odometer digits (S3: "the digits roll vertically"). Each digit is a column of 0–9 that
// slides to its value. Screen readers get the plain number.
type Props = { value: number; prefix?: string; className?: string }

export function RollingNumber({ value, prefix = '', className = '' }: Props) {
  const text = value.toLocaleString('en-LK')
  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      <span className="sr-only">
        {prefix}
        {text}
      </span>
      <span aria-hidden="true" className="inline-flex items-start leading-[1.15]">
        {prefix && <span className="whitespace-pre">{prefix}</span>}
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={text.length - i} className="roll-digit">
              <span className="roll-col" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
                {'0123456789'.split('').map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={`s${text.length - i}`}>{ch}</span>
          ),
        )}
      </span>
    </span>
  )
}
