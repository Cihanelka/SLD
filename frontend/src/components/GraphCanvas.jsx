
import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';

// Orphan tool SVG'lerini DOM'dan temizle
const cleanOrphanTools = () => {
  // X6 tool container'ları .x6-widget-tools class'ına sahip
  document.querySelectorAll('.x6-widget-tools').forEach(el => {
    // Eğer parent'ı bir node değilse veya parent'ı yoksa sil
    if (!el.closest('.x6-graph')) {
      el.remove();
    }
  });
};

export default function GraphCanvas({ graphRef, mode, setSelectedNode, onAddEdge }) {
  const [showModal, setShowModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTomlId, setNewTomlId] = useState('');
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null);

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
    if (selectedNodeForEdit && newLabel.trim()) {
      selectedNodeForEdit.setAttrByPath('label/text', newLabel.trim());
      selectedNodeForEdit.setData && selectedNodeForEdit.setData({ ...selectedNodeForEdit.getData?.(), toml_id: newTomlId });
      setShowModal(false);
      setSelectedNodeForEdit(null);
      setNewLabel('');
      setNewTomlId('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNodeForEdit(null);
    setNewLabel('');
    setNewTomlId('');
  };

  // İlk useEffect: Sadece ilk mount/unmount için
  useEffect(() => {
    if (!graphRef.current && document.getElementById('graph-container')) {
      graphRef.current = new Graph({
        container: document.getElementById('graph-container'),
        width: 800,
        height: 600,
        grid: true,
        interacting: getInteractingConfig(mode),
        translating: {
          restrict: true,
        },
        connecting: {
          anchor: 'center', // node'un merkezinden
          connectionPoint: 'boundary', // ama sınırına kadar uzat
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          snap: true,
          connector: 'normal', // düz çizgi (default)
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
      // Node'lara settings butonu ekle
      graphRef.current.on('node:added', ({ node }) => {
        cleanOrphanTools();
        const type = node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '';
        const offset = type === 'Inv' ? { x: -6, y: -8 } : { x: -16, y: 2 };
        node.removeTools();
        node.addTools([
          {
            name: 'button',
            args: {
              x: '100%',
              y: 0,
              offset,
              width: 20,
              height: 20,
              markup: [
                {
                  tagName: 'g',
                  children: [
                    {
                      tagName: 'path',
                      attrs: {
                        d: 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm6.32-2.16l1.43 1.11a1 1 0 0 1 .24 1.32l-1.36 2.36a1 1 0 0 1-1.28.44l-1.67-.67a7.03 7.03 0 0 1-1.5.87l-.25 1.8a1 1 0 0 1-.99.86h-2.72a1 1 0 0 1-.99-.86l-.25-1.8a7.03 7.03 0 0 1-1.5-.87l-1.67.67a1 1 0 0 1-1.28-.44l-1.36-2.36a1 1 0 0 1 .24-1.32l1.43-1.11a7.07 7.07 0 0 1 0-1.74l-1.43-1.11a1 1 0 0 1-.24-1.32l1.36-2.36a1 1 0 0 1 1.28-.44l1.67.67c.47-.34.97-.63 1.5-.87l.25-1.8A1 1 0 0 1 11.28 2h2.72a1 1 0 0 1 .99.86l.25 1.8c.53.24 1.03.53 1.5.87l1.67-.67a1 1 0 0 1 1.28.44l1.36 2.36a1 1 0 0 1-.24 1.32l-1.43 1.11c.07.29.11.59.11.89s-.04.6-.11.89z',
                        fill: 'none',
                        stroke: '#ff4d4f',
                        strokeWidth: 1.5,
                        transform: 'scale(0.8)',
                      },
                    },
                  ],
                },
              ],
              onClick: () => {
                const currentLabel = node.getAttrByPath('text/text') || node.getAttrByPath('label/text') || '';
                const currentTomlId = node.getData?.()?.toml_id || '';
                setSelectedNode({
                  id: node.id,
                  label: currentLabel,
                  type: node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '',
                  ...node.getData?.() // varsa custom data
                });
                setSelectedNodeForEdit(node);
                setNewLabel(currentLabel);
                setNewTomlId(currentTomlId);
                setShowModal(true);
              },
            },
          },
        ]);
      });
      // node hareket edince tool'u tekrar ekle
      graphRef.current.on('node:moved', ({ node }) => {
        cleanOrphanTools();
        const type = node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '';
        const offset = type === 'Inv' ? { x: -6, y: -8 } : { x: -16, y: 2 };
        node.removeTools();
        node.addTools([
          {
            name: 'button',
            args: {
              x: '100%',
              y: 0,
              offset,
              width: 20,
              height: 20,
              markup: [
                {
                  tagName: 'g',
                  children: [
                    {
                      tagName: 'path',
                      attrs: {
                        d: 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm6.32-2.16l1.43 1.11a1 1 0 0 1 .24 1.32l-1.36 2.36a1 1 0 0 1-1.28.44l-1.67-.67a7.03 7.03 0 0 1-1.5.87l-.25 1.8a1 1 0 0 1-.99.86h-2.72a1 1 0 0 1-.99-.86l-.25-1.8a7.03 7.03 0 0 1-1.5-.87l-1.67.67a1 1 0 0 1-1.28-.44l-1.36-2.36a1 1 0 0 1 .24-1.32l1.43-1.11a7.07 7.07 0 0 1 0-1.74l-1.43-1.11a1 1 0 0 1-.24-1.32l1.36-2.36a1 1 0 0 1 1.28-.44l1.67.67c.47-.34.97-.63 1.5-.87l.25-1.8A1 1 0 0 1 11.28 2h2.72a1 1 0 0 1 .99.86l.25 1.8c.53.24 1.03.53 1.5.87l1.67-.67a1 1 0 0 1 1.28.44l1.36 2.36a1 1 0 0 1-.24 1.32l-1.43 1.11c.07.29.11.59.11.89s-.04.6-.11.89z',
                        fill: 'none',
                        stroke: '#ff4d4f',
                        strokeWidth: 1.5,
                        transform: 'scale(0.8)',
                      },
                    },
                  ],
                },
              ],
              onClick: () => {
                const currentLabel = node.getAttrByPath('text/text') || node.getAttrByPath('label/text') || '';
                const currentTomlId = node.getData?.()?.toml_id || '';
                setSelectedNode({
                  id: node.id,
                  label: currentLabel,
                  type: node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '',
                  ...node.getData?.() // varsa custom data
                });
                setSelectedNodeForEdit(node);
                setNewLabel(currentLabel);
                setNewTomlId(currentTomlId);
                setShowModal(true);
              },
            },
          },
        ]);
      });
    }
    return () => {
      if (graphRef.current) {
        graphRef.current.dispose();
        graphRef.current = null;
      }
    };
  }, [graphRef, setSelectedNode]);

  // İkinci useEffect: Mode değişiminde sadece interacting güncelle
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.options.interacting = getInteractingConfig(mode);
    }
  }, [mode, graphRef]);

  useEffect(() => {
    if (!graphRef.current) return;
    // Node tıklama event'i
    const handler = ({ node }) => {
      setSelectedNode({
        id: node.id,
        label: node.getAttrByPath('label/text') || node.getAttrByPath('text/text') || node.getProp('label') || '',
        type: node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '',
        ...node.getData?.() // varsa custom data
      });
    };
    graphRef.current.on('node:click', handler);
    return () => {
      graphRef.current?.off('node:click', handler);
    };
  }, [graphRef, setSelectedNode]);

  // Kenardan kenara L şeklinde edge ekle
  const addEdgeBetweenNodes = (sourceId, targetId) => {
    if (!graphRef.current) return;
    
    const sourceNode = graphRef.current.getCellById(sourceId);
    const targetNode = graphRef.current.getCellById(targetId);
    
    if (!sourceNode || !targetNode) return;
    
    const sourcePos = sourceNode.getPosition();
    const targetPos = targetNode.getPosition();
    const sourceSize = sourceNode.getSize();
    const targetSize = targetNode.getSize();
    
    // Source'un sağ kenarı
    const sourcePoint = {
      x: sourcePos.x + sourceSize.width,
      y: sourcePos.y + sourceSize.height / 2
    };
    
    // Target'ın sol kenarı
    const targetPoint = {
      x: targetPos.x,
      y: targetPos.y + targetSize.height / 2
    };
    
    // L şekli için ara nokta: source'un x'i, target'ın y'si
    const middlePoint = {
      x: targetPoint.x,
      y: sourcePoint.y
    };
    
    graphRef.current.addEdge({
      source: { cell: sourceId },
      target: { cell: targetId },
      vertices: [middlePoint], // Ara nokta ekle
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
  };

  // onAddEdge prop'u varsa dışarıya fonksiyon ver
  useEffect(() => {
    if (onAddEdge) {
      onAddEdge.current = addEdgeBetweenNodes;
    }
  }, [onAddEdge, graphRef]);

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
            <input
              type="text"
              value={newTomlId}
              onChange={(e) => setNewTomlId(e.target.value)}
              placeholder="TOML ID girin..."
              style={{
                width: '100%',
                padding: '12px',
                margin: '0 0 16px 0',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseModal}
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