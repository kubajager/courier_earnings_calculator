"use client";

import { motion } from "motion/react";
import React, { useId } from "react";

function Float({
  children,
  amp = 7,
  dur = 3.8,
  delay = 0,
}: {
  children: React.ReactNode;
  amp?: number;
  dur?: number;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amp, 0] }}
      transition={{ repeat: Infinity, duration: dur, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function DollarCoin({ size = 88, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  return (
    <svg width={size} height={Math.round(size * 1.04)} viewBox="0 0 88 92" fill="none">
      <defs>
        <radialGradient id={`dcFace-${uid}`} cx="38%" cy="33%" r="63%">
          <stop offset="0%" stopColor="#7DF5B8" />
          <stop offset="45%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0D7A42" />
        </radialGradient>
        <linearGradient id={`dcEdge-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#073D22" />
        </linearGradient>
        <radialGradient id={`dcSheen-${uid}`} cx="28%" cy="20%" r="55%">
          <stop offset="0%" stopColor="#CCFFEA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#CCFFEA" stopOpacity="0" />
        </radialGradient>
        <filter id={`dcDrop-${uid}`} x="-20%" y="-15%" width="140%" height="145%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#063520" floodOpacity="0.65" />
        </filter>
      </defs>
      <g filter={`url(#dcDrop-${uid})`}>
        <ellipse cx="44" cy="82" rx="31" ry="5.5" fill={`url(#dcEdge-${uid})`} />
        <rect x="13" y="44" width="62" height="38" fill={`url(#dcEdge-${uid})`} />
        <circle cx="44" cy="44" r="31" fill={`url(#dcFace-${uid})`} />
        <circle cx="44" cy="44" r="31" fill={`url(#dcSheen-${uid})`} />
        <circle cx="44" cy="44" r="31" fill="none" stroke="#073D22" strokeWidth="1.5" strokeOpacity="0.45" />
        {Array.from({ length: 22 }).map((_, i) => {
          const a = (i / 22) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={44 + 28.5 * Math.cos(a)}
              y1={44 + 28.5 * Math.sin(a)}
              x2={44 + 31 * Math.cos(a)}
              y2={44 + 31 * Math.sin(a)}
              stroke="#073D22"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
          );
        })}
        <circle cx="44" cy="44" r="23" fill="none" stroke="#7DF5B8" strokeWidth="0.9" strokeOpacity="0.3" />
        <text x="44" y="55" textAnchor="middle" fontSize="31" fontFamily="Georgia,serif" fontWeight="bold" fill="white" opacity="0.96">
          $
        </text>
        <path d="M 22 32 Q 30 20 46 19" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.27" fill="none" />
        <circle cx="27" cy="28" r="3.5" fill="white" opacity="0.16" />
      </g>
    </svg>
  );
}

function DeliveryVan({ size = 130, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  const h = Math.round(size * 0.73);
  const rWx = 30,
    rWy = 76;
  const fWx = 108,
    fWy = 76;
  const spokeStyle = { transformBox: "view-box", transformOrigin: "" } as React.CSSProperties;

  return (
    <svg width={size} height={h} viewBox="0 0 142 104" fill="none">
      <defs>
        <linearGradient id={`vBody-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4CF090" />
          <stop offset="55%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0F7A3C" />
        </linearGradient>
        <linearGradient id={`vCab-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60F5A8" />
          <stop offset="100%" stopColor="#1FC16B" />
        </linearGradient>
        <linearGradient id={`vPanel-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0B3D22" />
          <stop offset="100%" stopColor="#072916" />
        </linearGradient>
        <radialGradient id={`vWheel-${uid}`} cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#28374A" />
          <stop offset="100%" stopColor="#111820" />
        </radialGradient>
        <filter id={`vDrop-${uid}`} x="-10%" y="-10%" width="120%" height="135%">
          <feDropShadow dx="0" dy="7" stdDeviation="9" floodColor="#063520" floodOpacity="0.65" />
        </filter>
      </defs>
      <g filter={`url(#vDrop-${uid})`}>
        <rect x="4" y="28" width="94" height="47" rx="4" fill={`url(#vBody-${uid})`} />
        <path d="M 98 28 L 98 17 Q 98 11 104 11 L 128 11 Q 138 11 138 22 L 138 28 Z" fill={`url(#vCab-${uid})`} />
        <path d="M 102 27 L 102 16 Q 102 14 104 14 L 126 14 Q 134 14 134 21 L 134 27 Z" fill="#C0FFE0" opacity="0.74" />
        <path d="M 104 15 L 116 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.38" fill="none" />
        <line x1="102" y1="14" x2="102" y2="27" stroke="#0B3D22" strokeWidth="2" opacity="0.5" />
        <line x1="98" y1="28" x2="98" y2="75" stroke="#0B3D22" strokeWidth="2" />
        <rect x="8" y="32" width="84" height="37" rx="3" fill={`url(#vPanel-${uid})`} opacity="0.4" />
        <rect x="12" y="38" width="66" height="23" rx="3" fill="#0D5C32" opacity="0.6" />
        <circle cx="26" cy="49" r="4.5" fill="#1FC16B" opacity="0.9" />
        <circle cx="38" cy="49" r="4.5" fill="#3EE589" opacity="0.8" />
        <circle cx="50" cy="49" r="4.5" fill="#1FC16B" opacity="0.9" />
        <rect x="133" y="23" width="7" height="5.5" rx="2" fill="#FFFCCC" opacity="0.95" />
        <ellipse cx="136.5" cy="29" rx="5" ry="2" fill="#FFFF80" opacity="0.25" />
        <rect x="4" y="38" width="5" height="9" rx="1.5" fill="#FF6868" opacity="0.75" />
        <rect x="6" y="71" width="126" height="4" rx="2" fill="#0B3D22" opacity="0.55" />
        <circle cx={rWx} cy={rWy} r="16" fill={`url(#vWheel-${uid})`} />
        <circle cx={rWx} cy={rWy} r="11.5" fill="#1C2838" />
        <circle cx={rWx} cy={rWy} r="5" fill="#263545" />
        <circle cx={rWx} cy={rWy} r="2.5" fill="#3EE589" />
        <motion.g
          style={{ ...spokeStyle, transformOrigin: `${rWx}px ${rWy}px` }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
        >
          {[0, 45, 90, 135].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={rWx + 5 * Math.cos(rad)}
                y1={rWy + 5 * Math.sin(rad)}
                x2={rWx + 11 * Math.cos(rad)}
                y2={rWy + 11 * Math.sin(rad)}
                stroke="#3D5470"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>
        <circle cx={rWx} cy={rWy} r="11.5" fill="none" stroke="#263545" strokeWidth="1.5" />
        <circle cx={fWx} cy={fWy} r="16" fill={`url(#vWheel-${uid})`} />
        <circle cx={fWx} cy={fWy} r="11.5" fill="#1C2838" />
        <circle cx={fWx} cy={fWy} r="5" fill="#263545" />
        <circle cx={fWx} cy={fWy} r="2.5" fill="#3EE589" />
        <motion.g
          style={{ ...spokeStyle, transformOrigin: `${fWx}px ${fWy}px` }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
        >
          {[0, 45, 90, 135].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={fWx + 5 * Math.cos(rad)}
                y1={fWy + 5 * Math.sin(rad)}
                x2={fWx + 11 * Math.cos(rad)}
                y2={fWy + 11 * Math.sin(rad)}
                stroke="#3D5470"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>
        <circle cx={fWx} cy={fWy} r="11.5" fill="none" stroke="#263545" strokeWidth="1.5" />
        <path d="M 8 30 L 60 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.1" fill="none" />
        <path d="M 104 13 Q 116 10 128 12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" fill="none" />
      </g>
    </svg>
  );
}

function PackageClosed({ size = 80, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" fill="none">
      <defs>
        <linearGradient id={`pcTop-${uid}`} x1="15%" y1="100%" x2="95%" y2="0%">
          <stop offset="0%" stopColor="#3EE589" />
          <stop offset="100%" stopColor="#80F9C0" />
        </linearGradient>
        <linearGradient id={`pcLeft-${uid}`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0F6E3A" />
        </linearGradient>
        <linearGradient id={`pcRight-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#178D4E" />
          <stop offset="100%" stopColor="#085030" />
        </linearGradient>
        <filter id={`pcDrop-${uid}`} x="-15%" y="-10%" width="135%" height="140%">
          <feDropShadow dx="2" dy="6" stdDeviation="6" floodColor="#063520" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter={`url(#pcDrop-${uid})`}>
        <path d="M 42 11 L 71 25 L 42 39 L 13 25 Z" fill={`url(#pcTop-${uid})`} />
        <path d="M 13 25 L 42 39 L 42 70 L 13 56 Z" fill={`url(#pcLeft-${uid})`} />
        <path d="M 42 39 L 71 25 L 71 56 L 42 70 Z" fill={`url(#pcRight-${uid})`} />
        <path d="M 27.5 18 L 42 11 L 56.5 18" stroke="#CCFFE8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
        <line x1="42" y1="11" x2="42" y2="39" stroke="#CCFFE8" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <line x1="27.5" y1="39" x2="27.5" y2="59" stroke="#7DF5B8" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <line x1="56.5" y1="39" x2="56.5" y2="59" stroke="#7DF5B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        <path d="M 17 22 L 31 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.28" fill="none" />
        <line x1="15" y1="28" x2="15" y2="42" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.14" />
      </g>
    </svg>
  );
}

function PackageOpen({ size = 88, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  return (
    <svg width={size} height={size} viewBox="0 0 92 94" fill="none">
      <defs>
        <linearGradient id={`poLeft-${uid}`} x1="0%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0F6E3A" />
        </linearGradient>
        <linearGradient id={`poRight-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#178D4E" />
          <stop offset="100%" stopColor="#075030" />
        </linearGradient>
        <linearGradient id={`poInner-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0C3322" />
          <stop offset="100%" stopColor="#071510" />
        </linearGradient>
        <linearGradient id={`poFlapL-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#50F0A0" />
          <stop offset="100%" stopColor="#1FC16B" />
        </linearGradient>
        <linearGradient id={`poFlapR-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3EE589" />
          <stop offset="100%" stopColor="#158C4D" />
        </linearGradient>
        <filter id={`poDrop-${uid}`} x="-15%" y="-10%" width="135%" height="140%">
          <feDropShadow dx="2" dy="7" stdDeviation="7" floodColor="#063520" floodOpacity="0.58" />
        </filter>
      </defs>
      <g filter={`url(#poDrop-${uid})`}>
        <path d="M 14 42 L 46 55 L 46 80 L 14 67 Z" fill={`url(#poLeft-${uid})`} />
        <path d="M 46 55 L 78 42 L 78 67 L 46 80 Z" fill={`url(#poRight-${uid})`} />
        <path d="M 14 42 L 46 29 L 78 42 L 46 55 Z" fill={`url(#poInner-${uid})`} />
        <path d="M 14 42 L 46 29 L 46 13 L 14 26 Z" fill={`url(#poFlapL-${uid})`} opacity="0.92" />
        <path d="M 46 29 L 78 42 L 78 26 L 46 13 Z" fill={`url(#poFlapR-${uid})`} opacity="0.88" />
        <line x1="46" y1="13" x2="46" y2="29" stroke="#AFFFCF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <rect x="26" y="43" width="32" height="20" rx="2.5" fill="#163826" opacity="0.95" />
        <path d="M 26 43 L 42 54 L 58 43" stroke="#3EE589" strokeWidth="1.8" fill="none" opacity="0.7" />
        <rect x="50" y="45" width="6" height="5" rx="1" fill="#1FC16B" opacity="0.5" />
        <line x1="30" y1="55" x2="30" y2="69" stroke="#7DF5B8" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
        <path d="M 17 26 L 32 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.26" fill="none" />
        <line x1="16" y1="44" x2="16" y2="56" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.13" />
      </g>
    </svg>
  );
}

function PackageTiny({ size = 60, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  return (
    <svg width={size} height={Math.round(size * 1.08)} viewBox="0 0 60 65" fill="none">
      <defs>
        <linearGradient id={`ptTop-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2EDB7C" />
          <stop offset="100%" stopColor="#70F5B8" />
        </linearGradient>
        <linearGradient id={`ptLeft-${uid}`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0D6636" />
        </linearGradient>
        <linearGradient id={`ptRight-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15964A" />
          <stop offset="100%" stopColor="#094530" />
        </linearGradient>
        <filter id={`ptDrop-${uid}`} x="-18%" y="-15%" width="136%" height="145%">
          <feDropShadow dx="1" dy="5" stdDeviation="5" floodColor="#063520" floodOpacity="0.5" />
        </filter>
      </defs>
      <g filter={`url(#ptDrop-${uid})`}>
        <path d="M 30 10 L 50 19 L 30 28 L 10 19 Z" fill={`url(#ptTop-${uid})`} />
        <path d="M 10 19 L 30 28 L 30 52 L 10 43 Z" fill={`url(#ptLeft-${uid})`} />
        <path d="M 30 28 L 50 19 L 50 43 L 30 52 Z" fill={`url(#ptRight-${uid})`} />
        <line x1="30" y1="10" x2="30" y2="28" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M 20 14 L 30 10 L 40 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" fill="none" />
        <line x1="20" y1="28" x2="20" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.32" />
        <line x1="40" y1="28" x2="40" y2="44" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.26" />
        <path d="M 26 9 Q 22 4 28 8 Q 30 6 30 10 Q 30 6 32 8 Q 38 4 34 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
        <path d="M 13 18 L 22 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" fill="none" />
      </g>
    </svg>
  );
}

function ClockSticker({ size = 82, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  const cx = 42,
    cy = 42;
  const spokeStyle = { transformBox: "view-box", transformOrigin: "" } as React.CSSProperties;

  return (
    <svg width={size} height={size} viewBox="0 0 84 84" fill="none">
      <defs>
        <radialGradient id={`clBezel-${uid}`} cx="38%" cy="32%" r="66%">
          <stop offset="0%" stopColor="#3EE589" />
          <stop offset="55%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0D7A42" />
        </radialGradient>
        <radialGradient id={`clFace-${uid}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#162B1E" />
          <stop offset="100%" stopColor="#0A1810" />
        </radialGradient>
        <filter id={`clDrop-${uid}`} x="-18%" y="-15%" width="136%" height="145%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#063520" floodOpacity="0.62" />
        </filter>
      </defs>
      <g filter={`url(#clDrop-${uid})`}>
        <circle cx={cx} cy={cy} r="36" fill={`url(#clBezel-${uid})`} />
        <path d={`M 18 30 Q 24 17 ${cx} 16`} stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.2" fill="none" />
        <circle cx={cx} cy={cy} r="33" fill="none" stroke="#7DF5B8" strokeWidth="0.8" strokeOpacity="0.22" />
        <circle cx={cx} cy={cy} r="28" fill={`url(#clFace-${uid})`} />
        {Array.from({ length: 12 }).map((_, i) => {
          const rad = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const isQuarter = i % 3 === 0;
          const r1 = isQuarter ? 19.5 : 22;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + 26 * Math.cos(rad)}
              y2={cy + 26 * Math.sin(rad)}
              stroke={isQuarter ? "#5DECA0" : "#2A4A38"}
              strokeWidth={isQuarter ? 2.2 : 1}
              strokeLinecap="round"
            />
          );
        })}
        <line x1={cx} y1={cy} x2={cx - 8} y2={cy - 14} stroke="#5DECA0" strokeWidth="3.5" strokeLinecap="round" />
        <motion.line
          x1={cx}
          y1={cy}
          x2={cx + 2}
          y2={cy - 21}
          style={{ ...spokeStyle, transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          stroke="#AFFFCF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <motion.line
          x1={cx}
          y1={cy + 7}
          x2={cx + 1}
          y2={cy - 22}
          style={{ ...spokeStyle, transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          stroke="#FF7A7A"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={0.85}
        />
        <circle cx={cx} cy={cy} r="3.8" fill="#1FC16B" />
        <circle cx={cx} cy={cy} r="1.8" fill="#AFFFCF" />
      </g>
    </svg>
  );
}

function MapPinSticker({ size = 78, idSuffix }: { size?: number; idSuffix?: string }) {
  const uid = idSuffix ?? useId().replace(/:/g, "x");
  return (
    <svg width={size} height={size} viewBox="0 0 78 78" fill="none">
      <defs>
        <radialGradient id={`mpBg-${uid}`} cx="38%" cy="33%" r="65%">
          <stop offset="0%" stopColor="#3EE589" />
          <stop offset="55%" stopColor="#1FC16B" />
          <stop offset="100%" stopColor="#0D7A42" />
        </radialGradient>
        <radialGradient id={`mpSheen-${uid}`} cx="28%" cy="22%" r="54%">
          <stop offset="0%" stopColor="#CCFFEA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CCFFEA" stopOpacity="0" />
        </radialGradient>
        <filter id={`mpDrop-${uid}`} x="-18%" y="-15%" width="136%" height="145%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#063520" floodOpacity="0.58" />
        </filter>
      </defs>
      <g filter={`url(#mpDrop-${uid})`}>
        <circle cx="39" cy="39" r="33" fill={`url(#mpBg-${uid})`} />
        <circle cx="39" cy="39" r="33" fill={`url(#mpSheen-${uid})`} />
        <path
          d="M 39 16 C 27 16 18 24.5 18 35 C 18 49.5 39 64 39 64 C 39 64 60 49.5 60 35 C 60 24.5 51 16 39 16 Z"
          fill="white"
          opacity="0.92"
        />
        <circle cx="39" cy="34.5" r="9" fill={`url(#mpBg-${uid})`} />
        <circle cx="36.5" cy="32" r="3.5" fill="white" opacity="0.42" />
        <path d="M 20 30 Q 26 18 39 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.22" fill="none" />
      </g>
    </svg>
  );
}

type StickerEntry = {
  id: string;
  el: React.ReactNode;
  left: string;
  top: string;
  rotate: number;
  entranceDelay: number;
  floatAmp: number;
  floatDur: number;
  floatDelay: number;
};

const STICKERS: StickerEntry[] = [
  {
    id: "van",
    el: <DeliveryVan size={130} />,
    left: "1%",
    top: "7%",
    rotate: -8,
    entranceDelay: 0.1,
    floatAmp: 4,
    floatDur: 5.0,
    floatDelay: 0,
  },
  {
    id: "pkg-open",
    el: <PackageOpen size={88} />,
    left: "3%",
    top: "42%",
    rotate: 11,
    entranceDelay: 0.25,
    floatAmp: 7,
    floatDur: 3.9,
    floatDelay: 0.6,
  },
  {
    id: "pkg-tiny-l",
    el: <PackageTiny size={60} />,
    left: "2%",
    top: "68%",
    rotate: -7,
    entranceDelay: 0.4,
    floatAmp: 6,
    floatDur: 3.4,
    floatDelay: 1.2,
  },
  {
    id: "dollar-sm",
    el: <DollarCoin size={76} />,
    left: "6%",
    top: "84%",
    rotate: 13,
    entranceDelay: 0.55,
    floatAmp: 8,
    floatDur: 3.6,
    floatDelay: 0.3,
  },
  {
    id: "dollar-lg",
    el: <DollarCoin size={94} />,
    left: "84%",
    top: "5%",
    rotate: -14,
    entranceDelay: 0.15,
    floatAmp: 6,
    floatDur: 4.2,
    floatDelay: 0.4,
  },
  {
    id: "dollar-md",
    el: <DollarCoin size={80} />,
    left: "89%",
    top: "25%",
    rotate: 9,
    entranceDelay: 0.3,
    floatAmp: 9,
    floatDur: 3.5,
    floatDelay: 1.0,
  },
  {
    id: "clock",
    el: <ClockSticker size={82} />,
    left: "83%",
    top: "47%",
    rotate: -6,
    entranceDelay: 0.45,
    floatAmp: 5,
    floatDur: 4.5,
    floatDelay: 0.8,
  },
  {
    id: "mappin",
    el: <MapPinSticker size={76} />,
    left: "88%",
    top: "68%",
    rotate: 8,
    entranceDelay: 0.6,
    floatAmp: 7,
    floatDur: 3.7,
    floatDelay: 1.5,
  },
  {
    id: "pkg-closed",
    el: <PackageClosed size={78} />,
    left: "83%",
    top: "84%",
    rotate: -12,
    entranceDelay: 0.72,
    floatAmp: 6,
    floatDur: 4.1,
    floatDelay: 0.2,
  },
];

export function Stickers() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden hidden xl:block" aria-hidden="true">
      {STICKERS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: s.left, top: s.top }}
          initial={{ opacity: 0, scale: 0.55, rotate: s.rotate - 15 }}
          animate={{ opacity: 1, scale: 1, rotate: s.rotate }}
          transition={{
            duration: 0.7,
            delay: s.entranceDelay,
            type: "spring",
            bounce: 0.45,
          }}
        >
          <Float amp={s.floatAmp} dur={s.floatDur} delay={s.floatDelay}>
            {React.cloneElement(s.el as React.ReactElement<{ idSuffix?: string }>, {
              idSuffix: s.id,
            })}
          </Float>
        </motion.div>
      ))}
    </div>
  );
}
