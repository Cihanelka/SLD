import { register } from '@antv/x6-react-shape'
import ADP from './sld_nodes/ADP'
import Inv from './sld_nodes/Inv'
import Meter from './sld_nodes/Meter'
import Busbar from './sld_nodes/Busbar'

// Custom shape'leri tek yerde register et
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
      };
    case 'Inv':
      return {
        ...base,
        shape: 'inv-shape',
        width: 50,
        height: 45,
        data: { ...base.data, label: 'INV' },
      };
    case 'Meter':
      return {
        ...base,
        shape: 'meter-shape',
        width: 80,
        height: 40,
        data: { ...base.data, label: 'Meter' },
      };
    case 'Busbar':
      return {
        ...base,
        shape: 'busbar-shape',
        width: 200,
        height: 5,
        data: { ...base.data },
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
            magnet: true,
          },
          label: {
            text: type,
            fill: '#333',
          },
        },
      };
  }
};


export const addNode = (graphRef, type, setNodes) => {
  if (!graphRef.current) return;
  const nodeConfig = createNodeConfig(type);
  graphRef.current.addNode(nodeConfig);
  setNodes(prev => [...prev, { id: nodeConfig.id, type }]);
};
