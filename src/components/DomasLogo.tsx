import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export default function DomasLogo({ className = '', size = 'md', showSlogan = false }: LogoProps) {
  let width = 160;
  let height = 160;

  if (size === 'sm') { width = 48; height = 48; }
  else if (size === 'md') { width = 120; height = 120; }
  else if (size === 'lg') { width = 240; height = 240; }
  else if (size === 'xl') { width = 360; height = 360; }

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* SVG rendering Doma's Logo resembling watercolor blooms & golden hexagon */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Pastel watercolor radial gradient blobs */}
          <radialGradient id="waterColorSplash" cx="50%" cy="50%" r="48%">
            <stop offset="0%" stopColor="#CEECF5" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#E2F1F8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FCFAF7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD2D1" />
            <stop offset="100%" stopColor="#FFECEF" />
          </linearGradient>
          <linearGradient id="goldHex" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="#E5C158" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Outer pastel floral watercolor backdrop circle */}
        <circle cx="100" cy="100" r="95" fill="#FAF3F3" opacity="0.4" />
        
        {/* Soft blue-indigo artistic watercolor splash */}
        <ellipse cx="106" cy="103" rx="68" ry="48" fill="url(#waterColorSplash)" transform="rotate(-5, 106, 103)" />
        
        {/* Soft pink petal illustrations outside */}
        <circle cx="28" cy="40" r="14" fill="url(#roseGradient)" opacity="0.65" />
        <circle cx="34" cy="32" r="10" fill="#F9BEC7" opacity="0.5" />
        <circle cx="178" cy="155" r="11" fill="url(#roseGradient)" opacity="0.6" />

        {/* Golden Hexagon geometry outline */}
        <polygon
          points="100,26 164,62 164,136 100,172 36,136 36,62"
          fill="none"
          stroke="url(#goldHex)"
          strokeWidth="1.25"
          filter="url(#softShadow)"
        />
        <polygon
          points="100,29 161,64 161,134 100,169 39,134 39,64"
          fill="none"
          stroke="#C5A880"
          strokeWidth="0.5"
          strokeDasharray="1.5, 2.5"
          opacity="0.8"
        />

        {/* Hand-lettered stylized "Domas" typography */}
        <g id="domasSignature">
          {/* Accent flourish shadows behind navy signature */}
          <text
            x="98"
            y="112"
            fill="#CEECF5"
            fontSize="45"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="-1"
            opacity="0.5"
          >
            Doma&apos;s
          </text>
          
          {/* Main Brand text */}
          <text
            x="100"
            y="113"
            fill="#0F2C59"
            fontSize="44"
            fontFamily="'Brush Script MT', cursive, Georgia, serif"
            fontStyle="italic"
            textAnchor="middle"
            letterSpacing="-0.5"
          >
            Doma&apos;s
          </text>
        </g>

        {/* Subtitle "Resin Art" */}
        <rect x="110" y="117" width="60" height="15" rx="2" fill="#0F2C59" opacity="0.04" />
        <text
          x="140"
          y="126"
          fill="#1E3E62"
          fontSize="9.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          letterSpacing="1"
          textAnchor="middle"
        >
          RESIN ART
        </text>

        {/* Fine gold sparkle indicators */}
        <path d="M 50 63 Q 50 55 45 55 Q 50 55 50 47 Q 50 55 55 55 Q 50 55 50 63" fill="url(#goldHex)" />
        <circle cx="152" cy="74" r="1.5" fill="url(#goldHex)" />
        <circle cx="44" cy="120" r="1.2" fill="url(#goldHex)" />
      </svg>

      {/* Elegant slogan caption */}
      {showSlogan && (
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cyan-900 font-semibold max-w-xs leading-relaxed opacity-95">
          Infusing Art Into Every Resin Creation
        </p>
      )}
    </div>
  );
}
