import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';

export default function GraphCanvas({ graphRef, mode }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [newLabel, setNewLabel] = useState('');

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

  const handleUpdateLabel = () => {
    if (selectedNode && newLabel.trim()) {
      // Label'ı güncelle
      selectedNode.setAttrByPath('label/text', newLabel.trim());
      // Node'u yeniden çiz
      selectedNode.attr('label/text', newLabel.trim());
      setShowModal(false);
      setSelectedNode(null);
      setNewLabel('');
    }
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
        // Node'ların ekran dışına taşmasını engelle
        translating: {
          restrict: true,
        },
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
    
      // Edit ve user modlarına göre tüm etkileşimi değiştir
      graphRef.current.options.interacting = getInteractingConfig(mode);

      // Node çift tıklama event'i ekle
      graphRef.current.on('node:dblclick', ({ cell }) => {
        const currentLabel = cell.getAttrByPath('text/text') || '';
        setSelectedNode(cell);
        setNewLabel(currentLabel);
        setShowModal(true);
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
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            minWidth: '320px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
              Node İsmi Değiştir
            </h3>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateLabel();
                }
              }}
              placeholder="Yeni isim girin..."
              style={{
                width: '100%',
                padding: '12px',
                margin: '0 0 16px 0',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#f8f9fa',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleUpdateLabel}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    <div
      id="graph-container"
      style={{ width: 800, height: 600, border: '1px solid #ccc', background: '#fff' }}
    />
    </>
  );
}
