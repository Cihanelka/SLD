import React, { useState } from 'react';
import { Icon, Modal, Button, Input } from 'semantic-ui-react';
import { updateNodeOnServer } from '../nodeUtils';

const boxStyle = {
  width: 36,
  height: 36,
  border: '2px solid #b0b6be',
  borderRadius: 12,
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 13,
  color: '#333',
  margin: 0,
  boxSizing: 'border-box',
  position: 'relative',
};
const settingsIconStyle = {
  position: 'absolute',
  top: 2,
  right: 2,
  cursor: 'pointer',
  color: '#888',
  zIndex: 20,
};

const Inv = ({ node, width = 36, height = 36 }) => {
  console.log(node.getData())
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(node?.getData?.()?.label || 'INV');
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
    <div style={{ ...boxStyle, width, height, position: 'relative', cursor: 'default' }}>
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
          e.stopPropagation(); // X6'nın drag'ini engellemek istemiyorsan,} 
        }}        // X6'nın drag'ini engellemek istemiyorsan, buraya event eklemene gerek yok
        // Sadece bu alan drag için açık olacak
      />
      <Icon
        name="settings"
        style={settingsIconStyle}
        size="small"
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
      />
      {label}
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

export default Inv;
