import React from 'react';

const Busbar = ({ node }) => {
  const width = node?.size?.width || 200;
  const height = node?.size?.height || 5;
  return (
    <svg width={width} height={height}>
      <rect
        width={width}
        height={height}
        fill="transparent"
        stroke="#333"
        rx={2}
        magnet="true"
      />
    </svg>
  );
};

export default Busbar;
