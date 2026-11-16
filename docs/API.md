# API — rotas atuais

Base: `http://localhost:3000/api` (local) ou `/api` no mesmo domínio do painel/app de membros.

> **Segurança:** as rotas ainda **não têm guards**. O token retornado no login é
> `temp-<id>` e o Basic Auth do Caddy é a proteção dos ambientes. Não considerar
> este modelo pronto para produção sem JWT/guards.

## Autenticação

```http
POST /api/auth/login
Content-Type: application/json

{"email":"pastor@ibscn.org","password":"..."}
```

Resposta `201`:

```json
{
  "token": "temp-...",
  "user": {
    "id": "...",
    "email": "pastor@ibscn.org",
    "name": "Pr. Thiago Martins",
    "memberCode": "IBS2000",
    "roles": [{ "name": "SUPER_ADMIN", "label": "Super Admin", "level": 100 }]
  }
}
```

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/health` | Healthcheck da API |
| POST | `/api/auth/login` | Login por e-mail/senha |
| GET | `/api/people` | Lista pessoas (aceita filtros/limite) |
| GET | `/api/people/:id` | Detalhe de uma pessoa |
| POST | `/api/people` | Cria pessoa; `createLogin: true` cria usuário |
| POST | `/api/people/:id/update` | Atualiza pessoa |
| POST | `/api/people/:id/delete` | Remove pessoa |
| GET | `/api/roles` | Lista cargos |
| GET | `/api/permissions` | Lista permissões |
| POST | `/api/permissions/save` | Salva permissões por cargo |
| GET | `/api/sectors` | Lista ministérios/setores |
| POST | `/api/sectors` | Cria setor |
| POST | `/api/sectors/:id/update` | Atualiza setor |
| POST | `/api/sectors/:id/delete` | Remove setor |
| GET | `/api/schedules` | Lista escalas (`dateFrom`, `dateTo`) |
| GET | `/api/schedules/:id` | Detalhe da escala |
| POST | `/api/schedules` | Cria escala |
| POST | `/api/schedules/:id/update` | Atualiza escala |
| POST | `/api/schedules/:id/delete` | Remove escala |
| POST | `/api/schedules/:id/confirm` | Confirma presença |
| POST | `/api/schedules/:id/add-member` | Adiciona membro à escala |
| POST | `/api/schedules/:id/remove-member` | Remove membro da escala |
| GET | `/api/events` | Lista eventos |
| GET | `/api/announcements` | Lista avisos (`limit`) |
| GET | `/api/canteen/products` | Lista produtos da cantina |
| GET | `/api/canteen/settings` | Configurações da cantina |
| GET | `/api/canteen/orders` | Lista pedidos |
| GET | `/api/transactions` | Lista transações |
| POST | `/api/transactions` | Cria transação |
| POST | `/api/transactions/:id/delete` | Remove transação |
| GET | `/api/church` | Configurações da igreja |
| GET | `/api/stats` | Estatísticas do dashboard |

## Observações

- O painel e o app de membros usam os mesmos endpoints.
- Datas trafegam como string (`YYYY-MM-DD` ou ISO), conforme o controller.
- Para detalhes de payload e resposta, consulte
  `banco-de-dados/ibscn-api/src/data.controller.ts`.
- O app público ainda não consome a API.
