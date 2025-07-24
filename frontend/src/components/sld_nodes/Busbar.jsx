import React, { useState } from 'react';
import { Icon, Modal, Button, Input } from 'semantic-ui-react';
import { updateNodeOnServer } from '../nodeUtils';

const lineStyle = {
  width: 100,
  height: 4,
  background: '#333',
  borderRadius: 2,
  margin: 0,
  position: 'relative',
  boxSizing: 'border-box',
};
const settingsIconStyle = {
  position: 'absolute',
  top: 2,
  right: 2,
  cursor: 'pointer',
  color: '#888',
  zIndex: 20, // YÜKSEK ZINDEX
};

const Busbar = ({ node, width = 100, height = 4 }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(node?.getData?.()?.label || 'Busbar');
  const [tomlId, setTomlId] = useState(node?.getData?.()?.tomlId || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    try {
      node.setData({ ...node.getData(), label, tomlId: tomlId });
      if (node.setAttrByPath) node.setAttrByPath('label/text', label);
    } catch (e) {
      alert('Node güncellenemedi: ' + e.message);
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <div data-cell-shape="body" style={{ position: 'absolute', top: 0, left: 0, width, height, cursor: 'move' }}>
      {/* Sadece üstte drag handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 12,
          cursor: 'move',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        } }
      />
      <div
        style={{
          ...lineStyle,
          width,
          height: 4,
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  );
};

export default Busbar;
