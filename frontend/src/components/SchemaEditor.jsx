import React, { useRef, useState, useEffect } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import { addNode, createNodeConfig } from './nodeUtils'; 
import { saveSchema, loadSchemaData } from './SchemaService';

function SchemaEditor({ schemaInfo, onBackToSchemas }) {
  const graphRef = useRef(null);
  const addEdgeRef = useRef(null);
  const [mode, setMode] = useState('edit');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [realtimedata, setRealtimeData] = useState([]);

  useEffect(() => {
    fetch('/api/realtime-data/')
      .then(res => res.json())
      .then(data => setRealtimeData(data.realtimedata || []));
  }, []);

  const handleAddNode = (type) => {
    addNode(graphRef, type, setNodes);
  };

  const handleAddEdge = () => {
    if (nodes.length >= 2 && addEdgeRef.current) {
      addEdgeRef.current(nodes[0].id, nodes[1].id);
    } else {
      alert('En az iki node ekleyin!');
    }
  };

  const handleSave = async () => {
    await saveSchema(graphRef, schemaInfo);
  };

  useEffect(() => {
    if (!schemaInfo) return;

    const loadData = async () => {
      if (graphRef.current) {
        if (schemaInfo.schema_id && schemaInfo.schema_id > 0) {
          try {
            const data = await loadSchemaData(schemaInfo.schema_id);
            graphRef.current.clearCells();
            setNodes([]);
            setEdges([]);

            data.nodes.forEach(node => {
              const nodeType = node.type || node.label || 'rect';
              // Backend'den gelen node ile createNodeConfig'un birleşimi
              const defaultConfig = createNodeConfig(nodeType);

              const mergedNodeConfig = {
                ...defaultConfig,
                id: node.id,
                x: node.x,
                y: node.y,
                width: node.width || defaultConfig.width,
                height: node.height || defaultConfig.height,
                data: { ...defaultConfig.data, label: (node.label || nodeType), type: nodeType },
                attrs: node.attrs || defaultConfig.attrs,
              };

              graphRef.current.addNode(mergedNodeConfig);
            });

            data.edges.forEach(edge => {
              graphRef.current.addEdge({
                ...edge,
                shape: 'edge',
                source: typeof edge.source === 'string' ? { cell: edge.source, anchor: 'center', connectionPoint: 'boundary' } : edge.source,
                target: typeof edge.target === 'string' ? { cell: edge.target, anchor: 'center', connectionPoint: 'boundary' } : edge.target,
                label: edge.label || edge.type || '', // label yoksa type kullan
                router: { name: 'manhattan' },
                connector: { name: 'jumpover' },
                connectionPoint: 'rect',
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
            });

            setNodes(data.nodes);
            setEdges(data.edges);
          } catch (error) {
            console.error('Backend hatası:', error);
            graphRef.current.clearCells();
            setNodes([]);
            setEdges([]);
          }
        } else {
          graphRef.current.clearCells();
          setNodes([]);
          setEdges([]);
        }
      } else {
        setTimeout(loadData, 100);
      }
    };

    loadData();
  }, [schemaInfo]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        schemaName={schemaInfo?.name || ''}
        mode={mode}
        onModeChange={setMode}
        onSave={handleSave}
        onChangeSchema={onBackToSchemas}
      />

      <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        {mode === 'edit' && <Toolbar onAddNode={handleAddNode} onAddEdge={handleAddEdge} />}
        <div
          style={{
            flex: 1,
            minHeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9f9f9',
            padding: 0,
            overflow: 'hidden'
          }}
        >
          <GraphCanvas
            key={schemaInfo?.schema_id}
            graphRef={graphRef}
            mode={mode}
            setSelectedNode={setSelectedNode}
            onAddEdge={addEdgeRef}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
          />
        </div>
        <Sidebar
          nodes={nodes}
          selectedNode={selectedNode}
          setNodes={setNodes}
          graphRef={graphRef}
          realtimedata={realtimedata}
        />
      </div>
    </div>
  );
}

export default SchemaEditor;
