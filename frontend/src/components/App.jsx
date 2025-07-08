import React, { useRef } from 'react';
import Topbar from './TopBar';
import Sidebar from './SideBar';
import Toolbar from './ToolBar';
import GraphCanvas from './GraphCanvas';
import './App.css';

function App() {
  const graphRef = useRef(null);

  const addNode = (type) => {
    if (!graphRef.current) return;

    let nodeConfig = {
      id: `node-${Date.now()}`,
      x: 100,
      y: 100,
      width: 120,
      height: 40,
      label: type,
      attrs: {
        body: { fill: '#fff', stroke: '#333' },
        label: { fill: '#000' },
      },
    };

    if (type === 'ADP') {
      nodeConfig.attrs.body.fill = '#a3d5ff';
    } else if (type === 'Invertör') {
      nodeConfig.attrs.body.fill = '#ffd59e';
      nodeConfig.x = 300;
    }

    graphRef.current.addNode(nodeConfig);
  };

  return (
    <div className="app-layout">
      <Topbar />
      <div className="main-row">
        <Toolbar onAddNode={addNode} />
        <div className="canvas-area">
          <GraphCanvas graphRef={graphRef} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}

export default App;
