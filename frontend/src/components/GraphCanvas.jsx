import React, { useEffect } from 'react';
import { Graph } from '@antv/x6';

export default function GraphCanvas({ graphRef, mode }) {
  const getInteractingConfig = (mode) => {
    if (mode === 'edit') return true;

    // 'user' modunda tüm etkileşimleri kapat
    return {
      nodeMovable: false,
      edgeMovable: false,
      edgeLabelMovable: false,
      magnetConnectable: false,
      arrowheadMovable: false,
      vertexMovable: false,
      useEdgeTools: false,
    };
  };

  useEffect(() => {
    // Eğer container varsa ve graph yoksa yeni graph oluştur
    if (!graphRef.current && document.getElementById('graph-container')) {
      graphRef.current = new Graph({
        container: document.getElementById('graph-container'),
        width: 800,
        height: 600,
        grid: true,
        interacting: getInteractingConfig(mode),
        connecting: {
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          snap: true,
          connector: 'smooth',
          createEdge() {
            return graphRef.current.createEdge({
              shape: 'edge',
              attrs: {
                line: {
                  stroke: '#ff0000',
                  strokeWidth: 2,
                  strokeDasharray: '5 5',
                  targetMarker: {
                    name: 'classic',
                    size: 6,
                    fill: '#ff0000',
                    stroke: '#ff0000',
                  },
                  style: {
                    animation: 'dash-animation 1s linear infinite',
                  },
                },
              },
            });
          },
          validateConnection({ sourceCell, targetCell, sourcePort, targetPort }) {
            return sourceCell !== targetCell;
          },
        },
      });
    } else if (graphRef.current) {
      // Edit ve user modlarına göre tüm etkileşimi değiştir
      graphRef.current.options.interacting = getInteractingConfig(mode);
    }

    // Cleanup function
    return () => {
      if (graphRef.current) {
        graphRef.current.dispose();
        graphRef.current = null;
      }
    };
  }, [graphRef, mode]);

  // Graph'ı temizlemek istediğin yerde artık clearCells kullan
  // Örnek: graphRef.current.clearCells();

  return (
    <>
      <style>
        {`
          @keyframes dash-animation {
            to {
              stroke-dashoffset: -10px;
            }
          }
        `}
      </style>
    <div
      id="graph-container"
      style={{ width: 800, height: 600, border: '1px solid #ccc', background: '#fff' }}
    />
    </>
  );
}
