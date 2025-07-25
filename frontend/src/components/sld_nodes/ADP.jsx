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
const[state , setState] = useState({
  open: false,
  label: node?.getData?.()?.label || 'ADP',
  loading: false,
})

  const handleSave = () => {
  setState(prev => ({...prev, loading: true}));
    try{
      node.setData({...node.getData(), label:state.label});
      if(node.setAttrByPath){
        node.setAttrByPath('label/text',state.label);
      }
    }catch(e){
      alert('Node Güncellenemedi: ' + e.message);
    }
    setState(prev => ({...prev, loading:false, open:false}));
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
      <Icon 
      name="settings" 
      style={settingsIconStyle} 
      size="small" 
      onClick={e => { e.stopPropagation(); 
       setState(prev => ({...prev , open:true})); }} 
      />
      <div style={titleStyle}>{state.label}</div>

      <Modal open={state.open} onClose={() => 
        setState(prev => ({...prev, open:false}))} size="tiny">
        <Modal.Header>
          <Icon name="settings" /> Ayarlar
        </Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="Label"
            value={state.label}
            onChange={e => setState(prev => ({...prev,label:e.target.value}))}
            style={{ marginBottom: 16 }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setState(prev => ({...prev,open:false}))}
          color="grey">İptal</Button>
          <Button onClick={handleSave} color="red" loading={state.loading}>Kaydet</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};
export default ADP;
