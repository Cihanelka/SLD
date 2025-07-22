import React, { useState } from 'react';
import { Icon, Modal, Button, Input } from 'semantic-ui-react';

const outerStyle = {
  border: '2px solid #b0b6be',
  borderRadius: 8,
  padding: 0,
  width: 180,
  height: 140,
  background: '#fff',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
};
const titleStyle = {
  background: '#f8fafc',
  borderBottom: '2px solid #b0b6be',
  fontWeight: 700,
  fontSize: 14,
  textAlign: 'center',
  padding: '4px 0',
  letterSpacing: 1,
};
const settingsIconStyle = {
  position: 'absolute',
  top: 6,
  right: 8,
  cursor: 'pointer',
  color: '#888',
  zIndex: 20,
};

const ADP = ({ node, width = 180, height = 140 }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(node?.getData?.()?.label || 'ADP');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    try {
      node.setData({ ...node.getData(), label });
      if (node.setAttrByPath) node.setAttrByPath('label/text', label);
    } catch (e) {
      alert('Node güncellenemedi: ' + e.message);
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <div data-cell-shape="body" style={{ ...outerStyle, width, height, position: 'relative', cursor: 'default' }}>
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
        }}
      
      />
      <Icon name="settings" style={settingsIconStyle} size="small" onClick={e => { e.stopPropagation(); setOpen(true); }} />
      <div style={titleStyle}>{label}</div>
      <Modal open={open} onClose={() => setOpen(false)} size="tiny">
        <Modal.Header>
          <Icon name="settings" /> Ayarlar
        </Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setOpen(false)} color="grey">İptal</Button>
          <Button onClick={handleSave} color="red" loading={loading}>Kaydet</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default ADP;
