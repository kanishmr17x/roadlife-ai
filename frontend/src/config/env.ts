export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  ML_SERVICE_URL: import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8001',
  MAP_TILE_LAYER: import.meta.env.VITE_MAP_TILE_LAYER || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};
