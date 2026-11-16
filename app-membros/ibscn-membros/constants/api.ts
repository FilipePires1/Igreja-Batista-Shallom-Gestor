// URL da API
// Web em produção: mesma origem do app (Caddy protege e encaminha /api para a API)
// Nativo: IP da máquina na rede local (trocar se o IP mudar)
// Desenvolvimento local web: EXPO_PUBLIC_API_URL=http://localhost:3000/api

import { Platform } from 'react-native';

const LAN_IP = '192.168.1.77';
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_URL =
  ENV_API_URL && ENV_API_URL.length > 0
    ? ENV_API_URL
    : Platform.OS === 'web'
      ? '/api'
      : `http://${LAN_IP}:3000/api`;
