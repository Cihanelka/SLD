import React, { useEffect } from 'react';
import { Graph } from '@antv/x6';

export default function GraphCanvas({ graphRef }) {
  useEffect(() => {
    if (!graphRef.current) {
      graphRef.current = new Graph({
        container: document.getElementById('graph-container'),
        width: 800,
        height: 600,
        grid: true,
      });
    }
  }, [graphRef]);

  return <div id="graph-container" className="canvas" />;
}
