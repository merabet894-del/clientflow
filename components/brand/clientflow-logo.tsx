interface ClientFlowLogoProps {
  variant?: "full" | "compact" | "icon"
  className?: string
  height?: number
}

const iconPaths = (
  <>
    <path fill="#000000" d="M 217.902344 0.167969 L 0.097656 313.011719 L 226.375 313.011719 L 292.164062 218.511719 L 270.324219 183.457031 L 206.550781 275.054688 L 72.773438 275.054688 L 216.714844 68.300781 L 374.527344 313.011719 L 420.453125 313.011719 Z M 217.902344 0.167969" />
    <path fill="#000000" d="M 397.925781 0.167969 L 316.5 117.125 L 338.738281 151.613281 L 396.742188 68.300781 L 554.695312 313.011719 L 599.921875 313.011719 Z M 397.925781 0.167969" />
  </>
)

const wordmarkPaths = (
  <>
    <path fill="#000000" d="M 217.902344 637.832031 L 0.097656 324.984375 L 226.375 324.984375 L 292.164062 419.488281 L 270.324219 454.542969 L 206.550781 362.945312 L 72.773438 362.945312 L 216.714844 569.699219 L 374.527344 324.984375 L 420.453125 324.984375 Z M 217.902344 637.832031" />
    <path fill="#000000" d="M 397.925781 637.832031 L 316.5 520.875 L 338.738281 486.386719 L 396.742188 569.699219 L 554.695312 324.984375 L 599.921875 324.984375 Z M 397.925781 637.832031" />
  </>
)

export function ClientFlowLogo({ variant = "full", className, height }: ClientFlowLogoProps) {
  if (variant === "icon") {
    const h = height ?? 36
    return (
      <svg
        viewBox="0 0 600 313"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ height: h, width: "auto" }}
        aria-label="ClientFlow logo"
        role="img"
      >
        {iconPaths}
      </svg>
    )
  }

  if (variant === "compact") {
    const h = height ?? 32
    return (
      <div className={`flex items-center gap-3 ${className ?? ""}`}>
        <svg
          viewBox="0 0 600 313"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: h, width: "auto" }}
          aria-hidden="true"
        >
          {iconPaths}
        </svg>
        <span className="font-semibold tracking-tight text-[#111]">ClientFlow</span>
      </div>
    )
  }

  const h = height ?? 36
  return (
    <svg
      viewBox="0 0 600 638"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: h, width: "auto" }}
      aria-label="ClientFlow logo"
      role="img"
    >
      {iconPaths}
      {wordmarkPaths}
    </svg>
  )
}
