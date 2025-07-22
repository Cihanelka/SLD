import React, { useRef, useState, useEffect } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import { addNode, createNodeConfig } from './nodeUtils'; 
import { saveSchema, loadSchemaData } from './SchemaService';
import { createEdgeConfig } from './sld_nodes/Edge';

// Şema editörü ana bileşeni, graph ve node yönetimini yapar
function SchemaEditor({ schemaInfo, onBackToSchemas }) {
  const graphRef = useRef(null);
  const addEdgeRef = useRef(null);
  const [mode, setMode] = useState('edit');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [realtimedata, setRealtimeData] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [suppressDirty, setSuppressDirty] = useState(false);

  useEffect(() => {
    fetch('/api/realtime-data/')
      .then(res => res.json())
      .then(data => setRealtimeData(data.realtimedata || []));
  }, []);

  // Yeni node ekler
  const handleAddNode = (type) => {
    addNode(graphRef, type, setNodes);
  };

  // Edge ile ilgili işlemler sadece Edge.jsx fonksiyonlarından çağrılacak.

  // Graph değiştiğinde dirty flag'i günceller
  const handleGraphChange = () => {
    if (!suppressDirty) setIsDirty(true);
  };

  // Şemayı kaydeder
  const handleSave = async () => {
    setSuppressDirty(true);
    await saveSchema(graphRef, schemaInfo);
    setSuppressDirty(false);
    setIsDirty(false);
  };

  useEffect(() => {
    if (!schemaInfo) return;

    const loadData = async () => {
      setSuppressDirty(true);
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

            // Parent-child embed ilişkisini tekrar kur
            if (data.nodes.some(n => n.parent)) {
              data.nodes.forEach(node => {
                if (node.parent) {
                  const parent = graphRef.current.getCellById(node.parent);
                  const child = graphRef.current.getCellById(node.id);
                  if (parent && child) parent.embed(child);
                }
              });
            }

            data.edges.forEach(edge => {
              graphRef.current.addEdge(createEdgeConfig(edge, graphRef.current));
            });

            setNodes(data.nodes);
            setEdges(data.edges);
            setIsDirty(false);
          } catch (error) {
            console.error('Backend hatası:', error);
            graphRef.current.clearCells();
            setNodes([]);
            setEdges([]);
            setIsDirty(false);
          }
        } else {
          graphRef.current.clearCells();
          setNodes([]);
          setEdges([]);
          setIsDirty(false);
        }
      } else {
        setTimeout(loadData, 100);
      }
      setSuppressDirty(false);
    };

    loadData();
  }, [schemaInfo]); // Sadece schemaInfo değişince çalışsın

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        schemaName={schemaInfo?.name || ''}
        mode={mode}
        onModeChange={setMode}
        onSave={handleSave}
        onChangeSchema={onBackToSchemas}
        canSave={isDirty}
      />

      <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        {mode === 'edit' && <Toolbar onAddNode={handleAddNode} onAddEdge={addEdgeRef} />}
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
            onGraphChange={handleGraphChange}
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
