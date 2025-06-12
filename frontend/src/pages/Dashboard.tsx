import React from 'react';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.clearAuthData();
    navigate('/auth/login');
  };

  const userEmail = AuthService.getStoredUserEmail();
  const token = AuthService.getStoredToken();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              The Larte - Dashboard
            </div>
            <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
              ¡Bienvenido!
            </h1>
            <p className="mt-2 text-gray-500">
              Has iniciado sesión correctamente.
            </p>
            
            {userEmail && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            )}
            
            {token && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Token:</strong> {token.substring(0, 20)}...
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
