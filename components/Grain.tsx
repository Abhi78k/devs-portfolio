/** Film grain overlay, the same feTurbulence noise the reference site lays over its sections. */
export function Grain({ id, flavour }: { id: string; flavour: "hero" | "paper" }) {
  const hero = flavour === "hero";
  return (
    <svg aria-hidden="true" className={`grain grain--${flavour}`}>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={hero ? 0.9 : 0.85}
          numOctaves={hero ? 3 : 4}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <pattern id={`${id}-grain-tile`} width="300" height="300" patternUnits="userSpaceOnUse">
        <rect width="300" height="300" filter={`url(#${id}-grain)`} />
      </pattern>
      <rect width="100%" height="100%" fill={`url(#${id}-grain-tile)`} />
    </svg>
  );
}
