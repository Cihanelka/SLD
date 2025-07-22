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
  const [tomlId, setTomlId] = useState(node?.getData?.()?.toml_id || '');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    try {
      node.setData({ ...node.getData(), label, toml_id: tomlId });
      if (node.setAttrByPath) node.setAttrByPath('label/text', label);
    } catch (e) {
      alert('Node güncellenemedi: ' + e.message);
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <div data-cell-shape="body" style={{ position: 'relative', display: 'inline-block', width, height, cursor: 'default' }}>
      {/* Sadece üstte drag handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 8,
          cursor: 'move',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
        onMouseDown={e => {
          e.stopPropagation(); // X6'nın drag'ini engellemek istemiyorsan, buraya event eklemene gerek yok
        } }
      />
      <Icon name="settings" style={settingsIconStyle} size="small" onClick={e => { e.stopPropagation(); setOpen(true); }} />
      <div style={{ ...lineStyle, width, height }} />
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
          <Input
            fluid
            label="TOML ID"
            value={tomlId}
            onChange={e => setTomlId(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setOpen(false)} color="grey" disabled={loading}>İptal</Button>
          <Button onClick={handleSave} color="red" loading={loading} disabled={loading}>Kaydet</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default Busbar;
