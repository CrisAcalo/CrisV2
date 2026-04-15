interface CaLogoProps {
  size?: number;
  className?: string;
  /** Color for both the diamond border and the letter. Defaults to var(--accent). */
  color?: string;
}

/**
 * C Diamond Logo
 * - overflow="visible" on the SVG prevents any clipping regardless of font size
 * - Diamond side calculated so diagonal fits inside the viewBox
 * - "C" perfectly centered via dominantBaseline + textAnchor
 * - Both elements use var(--accent) with CSS transition for smooth theme changes
 *
 * To adjust letter size: change the fontSize multiplier (currently 0.48)
 * To adjust corner rounding: change rx multiplier (currently 0.22)
 * To move letter up/down: change textY (currently `half`)
 */
export const CaLogo = ({ size = 40, className = '', color = 'var(--accent)' }: CaLogoProps) => {
  const half = size / 2;
  const strokeWidth = size * 0.045;

  // Diamond: side × √2 = size − strokeWidth  →  no clipping in viewBox
  const side = (size - strokeWidth) / Math.SQRT2;
  const rectOffset = (size - side) / 2;
  const rx = side * 0.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      overflow="visible"       /* ← prevents ALL corner/stroke clipping */
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="C Logo"
    >
      {/* Rounded diamond */}
      <rect
        x={rectOffset}
        y={rectOffset}
        width={side}
        height={side}
        rx={rx}
        transform={`rotate(45 ${half} ${half})`}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        style={{ transition: 'stroke 0.25s ease' }}
      />

      {/* "C" — centered both axes.
           x={half} + textAnchor="middle"  → horizontal center
           y={half} + dy="0.35em"          → vertical center (scales with fontSize, works in all browsers) */}
      <text
        x={half * 0.92}
        y={half}
        textAnchor="middle"
        dy="0.35em"
        fontSize={size * 0.6}
        fontWeight="700"
        fontFamily="inherit"
        style={{ fill: color, transition: 'fill 0.25s ease' }}
      >
        C
      </text>
    </svg>
  );
};
