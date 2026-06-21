/** Bölümler arasında yumuşak dalga geçişi. `fill` ile alt bölümün rengini ver. */
export function WaveDivider({ fill = "rgb(var(--background))", flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <svg
      className="wave-divider"
      viewBox="0 0 1440 70"
      preserveAspectRatio="none"
      style={flip ? { transform: "rotate(180deg)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M0,32 C240,72 480,8 720,28 C960,48 1200,72 1440,40 L1440,70 L0,70 Z"
        fill={fill}
      />
    </svg>
  );
}
