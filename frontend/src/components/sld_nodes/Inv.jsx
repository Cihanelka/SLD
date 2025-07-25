import React, { useState } from 'react';
import { Icon, Modal, Button, Input } from 'semantic-ui-react';

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
  const [state,setState] = useState({
    open:false,
    label:node?.getData?.()?.label || 'INV',
    tomlId:node?.getData?.()?.tomlId || '',
    loading:false,
})

  const handleSave = () => {
    setState(prev => ({...prev , loading:true}))    
      try {
      node.setData({ ...node.getData(), label:state.label, tomlId: state.tomlId });
      if (node.setAttrByPath) node.setAttrByPath('label/text', state.label);
    } catch (e) {
      alert('Node güncellenemedi: ' + e.message);
    }
    setState(prev => ({...prev, loading:false, open:false }));
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
          e.stopPropagation(); 
        }}       
      
      />
      <Icon
        name="settings"
        style={settingsIconStyle}
        size="small"
        onClick={e => {
          e.stopPropagation();
          setState(prev => ({...prev,open:true}));
        }}
      />
      {state.label}
      <Modal open={state.open} onClose={() =>setState(prev => ({...prev,open:false}))} size="tiny">
        <Modal.Header>
          <Icon name="settings" /> Ayarlar
        </Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="Label"
            value={state.label}
            onChange={e => setState(prev => ({...prev, label: e.target.value}))}
            style={{ marginBottom: 16 }}
          />
          <Input
            fluid
            label="TOML ID"
            value={state.tomlId}
            onChange={e => setState(prev => ({...prev, tomlId: e.target.value}))}
            style={{ marginBottom: 16 }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() =>setState(prev => ({...prev, open:false}))} color="grey" disabled={state.loading}>İptal</Button>
          <Button onClick={handleSave} color="red" loading={state.loading} disabled={state.loading}>Kaydet</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default Inv;
