import React, { useRef, useState, useEffect } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import { addNode } from './NodeManager';
import { saveSchema, loadSchemaData } from './SchemaService';
import { getPortConfig } from './NodeManager';

function SchemaEditor({ schemaInfo, onBackToSchemas }) {
  const graphRef = useRef(null);
  const [mode, setMode] = useState('edit');
  const [nodes, setNodes] = useState([]);

  // Node ekleme fonksiyonu
  const handleAddNode = (type) => {
    addNode(graphRef, type, setNodes);
  };

  // Şemayı kaydetme fonksiyonu
  const handleSave = async () => {
    await saveSchema(graphRef, schemaInfo);
  };

  // Şema seçildiğinde node ve edge verilerini yükle
  useEffect(() => {
    if (!schemaInfo) return;

    const loadData = async () => {
      if (graphRef.current) {
        if (schemaInfo.schema_id && schemaInfo.schema_id > 0) {
          try {
            const data = await loadSchemaData(schemaInfo.schema_id);
            graphRef.current.clearCells();
            
            data.nodes.forEach(node => {
              const nodeType = node.type || node.label;
              const portConfig = getPortConfig(nodeType);

              graphRef.current.addNode({
                id: node.id,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
                label: node.label,
                nodeType: nodeType, // Type sabit kalacak
                attrs: {
                  body: { 
                    fill: nodeType === 'ADP' ? '#a3d5ff' : '#ffd59e', 
                    stroke: '#333',
                  },
                  label: { 
                    text: node.label,
                    fill: '#000' 
                  },
                },
                ports: portConfig,
              });
            });
            
            data.edges.forEach(edge => {
              graphRef.current.addEdge({ 
                ...edge, 
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
            });
            
            setNodes(data.nodes);
          } catch (error) {
            console.error('Backend hatası:', error);
            if (graphRef.current) graphRef.current.clearCells();
            setNodes([]);
          }
        } else {
          graphRef.current.clearCells();
          setNodes([]);
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
        {mode === 'edit' && <Toolbar onAddNode={handleAddNode} />}
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
          <GraphCanvas key={schemaInfo?.schema_id || 'new'} graphRef={graphRef} mode={mode} />
        </div>
        <Sidebar nodes={nodes} />
      </div>
    </div>
  );
}

export default SchemaEditor; 