import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import SchemaSelector from './SchemaSelector';
import SchemaEditor from './SchemaEditor';
import './App.css';

function App() {
  const [state, setState] = useState({ schemas: [], selectedSchema: null }) 

    useEffect(() => {
    fetch('http://localhost:8000/api/list-schemas/')
    .then(res => res.json() 
    .then(data => setState(prev => ({...prev,schemas:data}))))
    .catch(err => console.error('Şema Yükleme Hatası:', err));
     }, []);

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
      setState((prevState) => ({
        ...prevState,
        schemas: [...prevState.schemas, data],
        selectedSchema: data
      }))
    } catch (error) { alert(`Şema Oluşturma Hatası: ${error.message}`);}
  };

  const handleSchemaSelect = (schemas) => {
    setState((prevState) => ({
        ...prevState,
        selectedSchema: schemas
      }))
  };

  const handleBackToSchemas = () => {
    setState((prevState) => ({
        ...prevState,
        selectedSchema: null
      }))
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            state.selectedSchema ? (
              <Navigate to={`/schema/${state.selectedSchema.schema_id}`} replace />
            ) : (
              <SchemaSelector 
                schemas={state.schemas}
                onSchemaSelect={handleSchemaSelect}
                onCreateSchema={createSchema}
              />
            )
          } 
        />
        <Route 
          path="/schema/:schemaId" 
          element={
            state.selectedSchema ? (
              <SchemaEditor 
                schemaInfo={state.selectedSchema}
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
