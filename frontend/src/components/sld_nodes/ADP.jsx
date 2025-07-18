import React from 'react';

const ADP = ({ node }) => {
  const width = 180;
  const height = 140;
  const label = node?.getData?.()?.label || 'ADP';
  return (
    <svg width={width} height={height} style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.13))' }}>
      <defs>
        <linearGradient id="adp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e3e8ee" />
        </linearGradient>
      </defs>
      {/* Ana gövde */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="#b0b6be"
        strokeWidth={2}
        rx={22}
        ry={22}
        magnet="true"
      />
      {/* Başlık kutusu */}
      <rect
        x={0}
        y={0}
        width={width}
        height={24}
        fill="url(#adp-bg)"
        stroke="#b0b6be"
        strokeWidth={2}
        rx={4}
        ry={4}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.04))' }}
      />
      <text
        x={width / 2}
        y={18}
        textAnchor="middle"
        fontSize={13}
        fill="#222"
        fontWeight="700"
        fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
        letterSpacing={1}
      >
        {label}
      </text>
    </svg>
  );
};

export default ADP;
