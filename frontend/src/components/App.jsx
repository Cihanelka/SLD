import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SchemaSelector from './SchemaSelector';
import SchemaEditor from './SchemaEditor';
import './App.css';

function App() {
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);

  // Şemaları yükle
  useEffect(() => {
    fetch('http://localhost:8000/api/list-schemas/')
      .then(res => res.json())
      .then(setSchemas)
      .catch(err => console.error('Şema yükleme hatası:', err));
  }, []);

  // Yeni şema oluşturma fonksiyonu
  const createSchema = async (schemaName) => {
    try {
      const response = await fetch('http://localhost:8000/api/create-schema/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: schemaName, 
          station_id: `station_${Date.now()}` 
        })
      });
      const data = await response.json();
      setSchemas(prev => [data, ...prev]);
      setSelectedSchema(data);
    } catch (error) {
      alert(`Şema oluşturma hatası: ${error.message}`);
    }
  };

  const handleSchemaSelect = (schema) => {
    setSelectedSchema(schema);
  };

  const handleBackToSchemas = () => {
    setSelectedSchema(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            selectedSchema ? (
              <Navigate to={`/schema/${selectedSchema.schema_id}`} replace />
            ) : (
              <SchemaSelector 
                schemas={schemas}
                onSchemaSelect={handleSchemaSelect}
                onCreateSchema={createSchema}
              />
            )
          } 
        />
        <Route 
          path="/schema/:schemaId" 
          element={
            selectedSchema ? (
              <SchemaEditor 
                schemaInfo={selectedSchema}
                onBackToSchemas={handleBackToSchemas}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
