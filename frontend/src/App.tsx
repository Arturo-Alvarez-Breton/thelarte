import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import { ProductoListPage } from "./pages/producto/ProductoListPage";
import { ProductoFormPage } from "./pages/producto/ProductoFormPage";
import ProductoDetailPage from './pages/producto/ProductoDetailPage';
import {ProductoEditPage} from './pages/producto/ProductoEditPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0D1C17',
              color: '#F7FCFA',
            },
          }}
        />
        
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route index element={<Navigate to="login" replace />} />
          </Route>

            {/* Rutas de productos */}
            <Route path="/productos">
                <Route path="/producto" element={<ProductoListPage />} />
                <Route path="/producto/nuevo" element={<ProductoFormPage />} />
                <Route path=":id" element={<ProductoDetailPage />} />
                <Route path=":id/editar" element={<ProductoEditPage />} />
            </Route>
          
          {/* Ruta del dashboard - será protegida más tarde */}
          <Route 
            path="/dashboard/*" 
            element={
              // Marcador de posición temporal hasta que se implemente el dashboard
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>Implementación del dashboard próximamente...</p>
              </div>
            } 
          />
          
          {/* Ruta por defecto redirige a login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          
          {/* Ruta comodín */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


