import React from 'react';

const Meter = ({ node }) => {
  const width = 80;
  const height = 40;
  const label = node?.getData?.()?.label || 'Meter';
  return (
    <svg width={width} height={height} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="#b0b6be"
        strokeWidth={2}
        rx={10}
        ry={10}
        magnet="true"
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
        fill="#222"
        fontWeight="600"
        fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
        letterSpacing={1}
      >
        {label}
      </text>
    </svg>
  );
};

export default Meter;
