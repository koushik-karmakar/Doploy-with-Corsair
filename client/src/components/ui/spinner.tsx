interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 24 }: SpinnerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex shrink-0 items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      {/* Outer ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ animationDuration: "750ms" }}
      >
        <circle cx="12" cy="12" r="9" stroke="#1e2636" strokeWidth="2.5" />
        <path
          d="M12 3 a9 9 0 0 1 9 9"
          stroke="url(#spin-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="spin-grad"
            x1="12"
            y1="3"
            x2="21"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3161F8" />
            <stop offset="100%" stopColor="#60C2FB" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center dot */}
      <span
        className="absolute rounded-full bg-[#60C2FB]"
        style={{ width: size * 0.2, height: size * 0.2 }}
        aria-hidden="true"
      />
    </div>
  );
}
