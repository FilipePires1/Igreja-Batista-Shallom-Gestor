// URL da API
// Web: mesma origem do app (Caddy protege e encaminha /api para a API)
// Nativo: IP da máquina na rede local (trocar se o IP mudar)

import { Platform } from 'react-native';

const LAN_IP = '192.168.1.77';

export const API_URL =
  Platform.OS === 'web'
    ? '/api'
    : `http://${LAN_IP}:3000/api`;
