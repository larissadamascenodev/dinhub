import React from "react";
import { NEON } from "./shared";

interface Props {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

/**
 * Huby mascot built entirely in SVG/CSS.
 * Black rounded body, glowing green eyes, green smile, green side accents.
 * Float animation + pulsing ground glow.
 */
export const HubyMascot: React.FC<Props> = ({ size = 200, className = "", withGlow = true }) => {
  const uid = React.useId().replace(/:/g, "");
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size * 1.05 }}>
      <svg
        viewBox="0 0 200 210"
        width={size}
        height={size * 1.05}
        style={{ animation: "hubyFloat 4s ease-in-out infinite", display: "block" }}
      >
        <defs>
          <radialGradient id={`bodyGrad-${uid}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <radialGradient id={`eyeGrad-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b6ffd1" />
            <stop offset="40%" stopColor={NEON} />
            <stop offset="100%" stopColor="#008f44" />
          </radialGradient>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Side accent ears */}
        <ellipse cx="30" cy="95" rx="14" ry="22" fill={NEON} opacity="0.85" filter={`url(#glow-${uid})`} />
        <ellipse cx="170" cy="95" rx="14" ry="22" fill={NEON} opacity="0.85" filter={`url(#glow-${uid})`} />
        <ellipse cx="30" cy="95" rx="6" ry="12" fill="#003820" />
        <ellipse cx="170" cy="95" rx="6" ry="12" fill="#003820" />

        {/* Body (rounded squircle) */}
        <path
          d="M 100 20
             C 145 20 175 50 175 100
             C 175 150 145 180 100 180
             C 55 180 25 150 25 100
             C 25 50 55 20 100 20 Z"
          fill={`url(#bodyGrad-${uid})`}
          stroke={`${NEON}22`}
          strokeWidth="1"
        />

        {/* Subtle highlight on top */}
        <ellipse cx="100" cy="55" rx="55" ry="18" fill="#ffffff" opacity="0.04" />

        {/* Eyes */}
        <g filter={`url(#glow-${uid})`}>
          <circle cx="75" cy="92" r="11" fill={`url(#eyeGrad-${uid})`} />
          <circle cx="125" cy="92" r="11" fill={`url(#eyeGrad-${uid})`} />
        </g>
        {/* Eye shine */}
        <circle cx="78" cy="89" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="128" cy="89" r="3" fill="#ffffff" opacity="0.9" />

        {/* Smile */}
        <path
          d="M 75 125 Q 100 148 125 125"
          stroke={NEON}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${uid})`}
        />
        {/* Smile cheeks */}
        <circle cx="62" cy="128" r="3" fill={NEON} opacity="0.5" />
        <circle cx="138" cy="128" r="3" fill={NEON} opacity="0.5" />

        {/* Antenna */}
        <line x1="100" y1="20" x2="100" y2="6" stroke={NEON} strokeWidth="2" />
        <circle cx="100" cy="5" r="4" fill={NEON} filter={`url(#glow-${uid})`} />
      </svg>

      {withGlow && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -size * 0.04,
            width: size * 0.75,
            height: size * 0.12,
            background: `radial-gradient(ellipse, ${NEON}88 0%, transparent 70%)`,
            filter: "blur(12px)",
            animation: "hubyGroundGlow 4s ease-in-out infinite",
            borderRadius: "50%",
          }}
        />
      )}

      <style>{`
        @keyframes hubyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes hubyGroundGlow { 0%,100%{opacity:.55;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.18)} }
      `}</style>
    </div>
  );
};

export default HubyMascot;
