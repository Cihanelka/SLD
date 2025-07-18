import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';
import { ReactShape } from '@antv/x6-react-shape';//GRAPHCANVAS
import Busbar from './sld_nodes/Busbar';
import ADP from './sld_nodes/ADP';
import Inv from './sld_nodes/Inv';
import Meter from './sld_nodes/Meter';
import GearSettingsIcon from './GearSettingsIcon';
import { Modal, Button, Input, Icon } from 'semantic-ui-react';

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

export default function GraphCanvas({ graphRef, mode, setSelectedNode, onAddEdge, nodes = [], setNodes }) {
  const [showModal, setShowModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTomlId, setNewTomlId] = useState('');
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null);

  const getInteractingConfig = () => true;

  const handleUpdateLabel = () => {
    if (selectedNodeForEdit && newLabel.trim()) {
      selectedNodeForEdit.setAttrByPath('label/text', newLabel.trim());
      selectedNodeForEdit.setData && selectedNodeForEdit.setData({ ...selectedNodeForEdit.getData?.(), toml_id: newTomlId });
      if (typeof setNodes === 'function') {
        setNodes(prevNodes => prevNodes.map(n => n.id === selectedNodeForEdit.id ? { ...n, label: newLabel.trim(), toml_id: newTomlId } : n));
      }
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
        interacting: getInteractingConfig(),
        translating: {
          restrict: true,
        },
        connecting: {
          allowNodeMove: true, // Node hareket edince edge'ler de hareket etsin
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          snap: true,
          connector: 'normal', // düz çizgi (default)
          allowNode: true,
          allowEdge: true,
          allowMulti: true,
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
          validateConnection({ sourceCell, targetCell }) {
            // Edge'den edge'e bağlantıyı engelle
            if (sourceCell && sourceCell.isEdge && sourceCell.isEdge()) return false;
            if (targetCell && targetCell.isEdge && targetCell.isEdge()) return false;
            return true;
          },
        },
      });
      // Node'lara settings butonu ekle
      graphRef.current.on('node:added', ({ node }) => {
        addSettingsToolToNode(node);
      });
      graphRef.current.on('node:moved', ({ node }) => {
        addSettingsToolToNode(node);
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
      graphRef.current.options.interacting = getInteractingConfig();
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

  const anchorNames = ['top', 'right', 'bottom', 'left'];
  const getRandomAnchor = () => anchorNames[Math.floor(Math.random() * 4)];

  const getRandomBoundaryAnchor = (size) => {
    const edge = Math.floor(Math.random() * 4);
    let args = {};
    switch (edge) {
      case 0: // üst
        args = { x: Math.random() * size.width, y: 0 };
        break;
      case 1: // sağ
        args = { x: size.width, y: Math.random() * size.height };
        break;
      case 2: // alt
        args = { x: Math.random() * size.width, y: size.height };
        break;
      case 3: // sol
        args = { x: 0, y: Math.random() * size.height };
        break;
      default:
        args = { x: 0, y: 0 };
    }
    return { name: 'boundary', args };
  };

  const addEdgeBetweenNodes = (sourceId, targetId) => {
    if (!graphRef.current) return;

    const sourceNode = graphRef.current.getCellById(sourceId);
    const targetNode = graphRef.current.getCellById(targetId);
    if (!sourceNode || !targetNode) return;
    // Magnet kontrolü
    const sourceMagnet = sourceNode.view && sourceNode.view.container && sourceNode.view.container.getAttribute('data-magnet');
    const targetMagnet = targetNode.view && targetNode.view.container && targetNode.view.container.getAttribute('data-magnet');
    if (sourceMagnet !== 'true' || targetMagnet !== 'true') {
      alert('Edge eklenemiyor: Node bileşenlerinde data-magnet="true" olmalı!');
      return;
    }

    graphRef.current.addEdge({
      shape: 'custom-edge',
      source: {
        cell: sourceId,
        anchor: 'center',
        connectionPoint: 'boundary',
      },
      target: {
        cell: targetId,
        anchor: 'center',
        connectionPoint: 'boundary',
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

  // Tool ekleme fonksiyonu
  const addSettingsToolToNode = (node) => {
    cleanOrphanTools();
    const type = node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '';
    const offset = type === 'Inv' ? { x: -6, y: -8 } : { x: -16, y: 2 };
    node.removeTools();
    const size = node.getSize ? node.getSize() : { width: 80, height: 40 };
    const btnSize = Math.max(12, Math.min(14, Math.round(size.width * 0.09)));
    const cx = Math.round(btnSize / 2);
    const cy = Math.round(btnSize / 2);
    const offsetX = -btnSize - 2;
    const offsetY = 4;
    const gearR = btnSize * 0.32;
    const gearLines = Array.from({length:6}).map((_,i)=>{
      const angle = (Math.PI*2/6)*i;
      const x1 = cx + Math.cos(angle)*gearR*0.7;
      const y1 = cy + Math.sin(angle)*gearR*0.7;
      const x2 = cx + Math.cos(angle)*gearR*1.1;
      const y2 = cy + Math.sin(angle)*gearR*1.1;
      return {tagName:'line',attrs:{x1,y1,x2,y2,stroke:'#fff',strokeWidth:1.1,strokeLinecap:'round'}};
    });
    node.addTools([
      {
        name: 'button',
        args: {
          x: '100%',
          y: 0,
          offset: { x: offsetX, y: offsetY },
          width: btnSize,
          height: btnSize,
          markup: [
            {
              tagName: 'circle',
              attrs: {
                cx,
                cy,
                r: btnSize / 2,
                fill: '#ff4d4f',
                stroke: 'none',
              },
            },
            {
              tagName: 'circle',
              attrs: {
                cx,
                cy,
                r: gearR,
                stroke: '#fff',
                strokeWidth: 1.1,
                fill: 'none',
              },
            },
            ...gearLines,
          ],
          onClick: () => {
            const currentLabel = node.getAttrByPath('text/text') || node.getAttrByPath('label/text') || '';
            const currentTomlId = node.getData?.()?.toml_id || '';
            setSelectedNode({
              id: node.id,
              label: currentLabel,
              type: node.getProp('nodeType') || node.getAttrByPath('nodeType') || node.getAttrByPath('type') || '',
              ...node.getData?.()
            });
            setSelectedNodeForEdit(node);
            setNewLabel(currentLabel);
            setNewTomlId(currentTomlId);
            setShowModal(true);
          },
        },
      },
    ]);
  };

  return (
    <>
      <style>{`
        @keyframes dash-animation {
          to {
            stroke-dashoffset: -10px;
          }
        }
      `}</style>
      {showModal && (
        <Modal open={showModal} onClose={handleCloseModal} size="tiny" closeIcon>
          <Modal.Header>
            <Icon name="settings" /> Node Ayarları
          </Modal.Header>
          <Modal.Content>
            <Input
              fluid
              label="Label"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter') handleUpdateLabel(); }}
              placeholder="Yeni isim girin..."
              style={{ marginBottom: 16 }}
              autoFocus
            />
            <Input
              fluid
              label="TOML ID"
              value={newTomlId}
              onChange={e => setNewTomlId(e.target.value)}
              placeholder="TOML ID girin..."
              style={{ marginBottom: 16 }}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={handleCloseModal} color="grey">İptal</Button>
            <Button onClick={handleUpdateLabel} color="red">Kaydet</Button>
          </Modal.Actions>
        </Modal>
      )}
      <div
        id="graph-container"
        style={{ width: 1200, height: 900, border: '1px solid #ccc', background: '#fff', position: 'relative' }}
      />
    </>
  );
}