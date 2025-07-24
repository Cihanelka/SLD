import { register } from '@antv/x6-react-shape'
import ADP from './sld_nodes/ADP'
import Inv from './sld_nodes/Inv'
import Meter from './sld_nodes/Meter'
import Busbar from './sld_nodes/Busbar'

// X6 custom React shape'lerini register eder
register({
  shape: 'adp-shape',
  component: (props) => <ADP {...props} />
});
register({
  shape: 'inv-shape',
  component: (props) => <Inv {...props} />
});
register({
  shape: 'meter-shape',
  component: (props) => <Meter {...props} />
});
register({
  shape: 'busbar-shape',
  component: (props) => <Busbar {...props} />
});

// Invisible (görünmez) portları tek bir yerde tanımla
const invisiblePorts = {
  groups: {
    top: {
      position: 'top',
      attrs: { circle: { r: 6, magnet: true, stroke: 'none', fill: 'transparent' } }
    },
    right: {
      position: 'right',
      attrs: { circle: { r: 6, magnet: true, stroke: 'none', fill: 'transparent' } }
    },
    bottom: {
      position: 'bottom',
      attrs: { circle: { r: 6, magnet: true, stroke: 'none', fill: 'transparent' } }
    },
    left: {
      position: 'left',
      attrs: { circle: { r: 6, magnet: true, stroke: 'none', fill: 'transparent' } }
    }
  },
  items: [
    { id: 'top', group: 'top' },
    { id: 'right', group: 'right' },
    { id: 'bottom', group: 'bottom' },
    { id: 'left', group: 'left' }
  ]
};

export const createNodeConfig = (type) => {
  const nodeId = `node-${Date.now()}`;
  const base = {
    id: nodeId,
    x: 100,
    y: 100,
    data: { label: type, type },
    nodeType: type,
    draggable: true,
  };

  switch (type) {
    case 'ADP':
      return {
        ...base,
        shape: 'adp-shape',
        width: 180,
        height: 140,
        data: { ...base.data, label: 'ADP' },
        attrs: { body: { magnet: false } },
        ports: invisiblePorts,
      };
    case 'Inv':
      return {
        ...base,
        shape: 'inv-shape',
        width: 36,
        height: 36,
        data: { ...base.data, label: 'INV' },
        attrs: { body: { magnet: false } },
        ports: invisiblePorts,
      };
    case 'Meter':
      return {
        ...base,
        shape: 'meter-shape',
        width: 80,
        height: 36,
        data: { ...base.data, label: 'Meter' },
        attrs: { body: { magnet: false } },
        ports: invisiblePorts,
      };
    case 'Busbar':
      return {
        ...base,
        shape: 'busbar-shape',
        width: 100,
        height: 4,
        data: { ...base.data },
        attrs: { body: { magnet: false } },
        ports: invisiblePorts,
      };
    case 'Group':
      return {
        ...base,
        shape: 'group',
        width: 400,
        height: 300,
        zIndex: -1,
        attrs: {
          body: {
            stroke: 'none',
            fill: '#none',
            magnet: false
          },
          border: {
            ref: 'body',
            refWidth: '100%',
            refHeight: '100%',
            stroke: '#b0b6be',
            strokeWidth: 4,
            magnet: true,
            fill: 'none',
          },
          label: { text: '' },
        },
      };
    default:
      return {
        ...base,
        shape: 'rect',
        width: 100,
        height: 40,
        attrs: {
          body: {
            fill: '#fff',
            stroke: '#999',
            magnet: false
          },
          border: {
            ref: 'body',
            refWidth: '100%',
            refHeight: '100%',
            stroke: '#b0b6be',
            strokeWidth: 4,
            magnet: true,
            fill: 'none',
          },
          label: {
            text: type,
            fill: '#333',
          },
        },
        ports: invisiblePorts,
      };
  }
};

export const addNode = (graphRef, type, setNodes) => {
  if (!graphRef.current) return;
  const nodeConfig = createNodeConfig(type);
  graphRef.current.addNode(nodeConfig);
  setNodes(prev => [...prev, { id: nodeConfig.id, type }]);
};

export const updateNodeOnServer = async (node_id, label, toml_id) => {
  return fetch(`http://localhost:8000/api/nodes-by-nodeid/${node_id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, toml_id })
  });
};
