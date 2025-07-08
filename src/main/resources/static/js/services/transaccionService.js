import { makeAuthenticatedRequest } from './authService.js';

const BASE_URL = '/api/transacciones';

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response.json();
}

export async function createTransaccion(data) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return handleErrors(response);
}

export async function getTransacciones(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await makeAuthenticatedRequest(`${BASE_URL}${query ? `?${query}` : ''}`);
  return handleErrors(response);
}

export async function getTransaccionById(id) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}`);
  return handleErrors(response);
}

export async function updateTransaccion(id, data) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return handleErrors(response);
}

export async function cambiarEstado(id, estado) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}/estado?estado=${estado}`, {
    method: 'PUT'
  });
  return handleErrors(response);
}

export async function confirmarTransaccion(id) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}/confirmar`, { method: 'PUT' });
  return handleErrors(response);
}

export async function completarTransaccion(id) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}/completar`, { method: 'PUT' });
  return handleErrors(response);
}

export async function cancelarTransaccion(id) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}/cancelar`, { method: 'PUT' });
  return handleErrors(response);
}

export async function deleteTransaccion(id) {
  const response = await makeAuthenticatedRequest(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return true;
}

export async function getEstadisticasComprasTotal(fechaInicio, fechaFin) {
  const query = new URLSearchParams({ fechaInicio, fechaFin }).toString();
  const response = await makeAuthenticatedRequest(`${BASE_URL}/estadisticas/compras/total?${query}`);
  return handleErrors(response);
}

export async function countByTipoEstado(tipo, estado) {
  const query = new URLSearchParams({ tipo, estado }).toString();
  const response = await makeAuthenticatedRequest(`${BASE_URL}/estadisticas/contar?${query}`);
  return handleErrors(response);
}
