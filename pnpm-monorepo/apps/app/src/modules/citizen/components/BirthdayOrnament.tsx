interface Props {
  /** Sizes the drawing, which fills the box */
  readonly className?: string;
}

/**
 * The birthday cake of the birthday banner: one tier with icing and three
 * candles.
 *
 * The drawing needs more than one tone, thus it carries fixed fills instead
 * of `currentColor`:
 * - `#f472b6` (pink 400) for the cake and `#fdf2f8` (pink 50) for the icing,
 *   the pink of the birthday surface;
 * - `#67e8f9` (cyan 300), `#c4b5fd` (violet 300) and `#fcd34d` (amber 300)
 *   for the candles, the other colours of the birthday surface;
 * - `#fbbf24` (amber 400) for the flames and `#fef3c7` (amber 100) for the
 *   plate, which stays light on the dark surface.
 *
 * The flames hold still: the cake stands next to the greeting, where a
 * flicker would draw the eye away from that text all the time.
 */
export const BirthdayOrnament = ({ className }: Props) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <rect x="2.5" y="20" width="19" height="1.6" rx="0.8" fill="#fef3c7" />
    <rect x="4.5" y="13" width="15" height="7.4" rx="1.2" fill="#f472b6" />
    {/* The icing runs down the side in six drops */}
    <path
      d="M4.5 14.2a1.2 1.2 0 0 1 1.2-1.2h12.6a1.2 1.2 0 0 1 1.2 1.2v1.3q-1.25 1.6-2.5 0q-1.25 1.6-2.5 0q-1.25 1.6-2.5 0q-1.25 1.6-2.5 0q-1.25 1.6-2.5 0q-1.25 1.6-2.5 0Z"
      fill="#fdf2f8"
    />

    <rect x="7.4" y="8.4" width="1.2" height="4.6" rx="0.4" fill="#67e8f9" />
    <rect x="11.4" y="7.4" width="1.2" height="5.6" rx="0.4" fill="#c4b5fd" />
    <rect x="15.4" y="8.4" width="1.2" height="4.6" rx="0.4" fill="#fcd34d" />

    <g fill="#fbbf24">
      <path d="M8 5.2q1.3 1.7 0 3q-1.3-1.3 0-3Z" />
      <path d="M12 4.2q1.3 1.7 0 3q-1.3-1.3 0-3Z" />
      <path d="M16 5.2q1.3 1.7 0 3q-1.3-1.3 0-3Z" />
    </g>
  </svg>
);
