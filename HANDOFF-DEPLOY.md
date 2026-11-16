# Handoff de Deploy — Igreja Batista Shallom

**Data:** 16/11/2026  
**Status:** homologação publicada, CI/CD ativo e primeiro deploy automatizado validado.

## 1. O que está no ar

| Ambiente | URL | Proteção |
| --- | --- | --- |
| Painel administrativo | https://shallom.116-203-100-189.sslip.io | Basic Auth |
| App público | https://app.116-203-100-189.sslip.io | Aberto |
| App de membros | https://membros.116-203-100-189.sslip.io | Basic Auth + login |

- TLS Let's Encrypt válido nos três domínios.
- Quatro containers `healthy`: `nextep-shallom-api`, `nextep-shallom-web`, `nextep-shallom-app-publico`, `nextep-shallom-app-membros`.
- Banco SQLite preservado no volume `nextep_shallom_data` (dados de teste intactos).
- API em produção de homologação responde `/api/health`, `/api/stats` e `/api/auth/login`.

## 2. Repositório e pipeline

- Repositório: https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor
- Branch de deploy: `main`
- Commit implantado no primeiro deploy: `cb65cb6` (`fix(ci): sincroniza package-lock do app publico`)
- Run validado: https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor/actions/runs/43920419812
- Workflows:
  - `.github/workflows/ci.yml` — compila API e exporta os apps web em PRs e pushes na `develop`.
  - `.github/workflows/deploy.yml` — em push na `main` ou execução manual: build das 4 imagens, push no GHCR, SSH no servidor, pull e `up -d`, healthcheck.

Imagens publicadas (tag do commit e `latest`):

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-app-membros
```

### Secret configurado no GitHub

| Secret | Valor |
| --- | --- |
| `SSH_PRIVATE_KEY` | chave privada do usuário `filipe` no servidor |

O `GITHUB_TOKEN` é usado automaticamente para o GHCR. Não há token de longo prazo
no repositório.

## 3. Como fazer deploy

Normal: fazer push/merge na `main`.

Manual: GitHub → Actions → **Deploy HOMOLOG - Igreja Batista Shallom** → Run workflow.

O workflow:

1. builda as 4 imagens em paralelo (matriz) com cache do GitHub Actions;
2. publica `:<sha>` e `:latest` no GHCR;
3. entra por SSH em `116.203.100.189` como `filipe`;
4. faz login no GHCR com o token efêmero do workflow;
5. roda `docker compose pull && docker compose up -d --remove-orphans`;
6. aguarda os 4 containers ficarem `healthy` e falha o job se algum não subir.

> **Atenção:** o pipeline NÃO copia `compose.yml`, `Caddyfile` nem `.env`. Mudanças
> nesses arquivos precisam ser aplicadas manualmente no servidor. O pipeline só
> troca as imagens.

## 4. Servidor

```text
/opt/nextep/shallom/
├── compose.yml       # stack com imagens ghcr.io/filipepires1/igreja-shallom-*:${IMAGE_TAG}
├── .env              # segredos reais (CORS, JWT, DATABASE_URL)
├── backup.sh
├── app/              # legado do primeiro deploy; NÃO é mais usado
└── apps/             # legado do primeiro deploy; NÃO é mais usado

/opt/nextep/edge/Caddyfile
/opt/nextep/backups/shallom/
```

- Deploy usa `IMAGE_TAG` = SHA do commit.
- A API roda `prisma migrate deploy` no start.
- Backup diário às 02:15, retenção de 7 dias.
- Caddy faz Basic Auth no painel e no app de membros; `/api/*` do domínio de
  membros vai direto para a API.

## 5. Credenciais

Não ficam neste arquivo nem no repositório. Filipe tem os valores atuais.

- Basic Auth: usuário `shallom`.
- Login administrativo: `pastor@ibscn.org` (SUPER_ADMIN/PASTOR).
- App de membros usa o mesmo login da tabela `User`.

## 6. O que foi validado após o deploy

- Painel: `200` com Basic Auth; login `201`.
- App público: `200` aberto; assets com hash novo.
- App de membros: `401` sem Basic Auth, `200` com Basic Auth; login `201`.
- `/api/stats`: `200` com dados preservados (1 membro, 8 escalas, 4 avisos).
- Containers: os quatro apontando para `ghcr.io/filipepires1/igreja-shallom-*:cb65cb6...` e `healthy`.
- Arquivos `_test.html`, `_t2.html`, `_t3.html` (bypass de login) removidos do
  painel e da imagem; guardados localmente em `referencia/test-backdoors/`
  (ignorado pelo Git e pelo Docker).

## 7. Pendências antes de produção

- [ ] Trocar token `temp-<id>` por JWT assinado.
- [ ] Aplicar guards reais nas rotas da API (hoje o Basic Auth do Caddy protege).
- [ ] Remover validação de sessão via `localStorage` no painel.
- [ ] Trocar o seed `admin123` e criar usuários reais.
- [ ] Avaliar tornar o repositório privado (hoje é público).
- [ ] Criar ambiente de produção separado com aprovação explícita.
- [ ] Testar notificações push do PWA no iPhone.
- [ ] Revogar o token Cloudflare exposto em conversa anterior, se ainda válido.

## 8. Rollback e troubleshooting

Rollback para um commit anterior:

```bash
cd /opt/nextep/shallom
export IMAGE_TAG=<sha-do-commit>
docker compose pull
docker compose up -d
```

Se o pull falhar por pacote privado, autenticar no GHCR com um PAT `read:packages`:

```bash
echo "<pat>" | docker login ghcr.io -u FilipePires1 --password-stdin
```

Diagnóstico:

```bash
docker ps --filter name=nextep-shallom
docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' nextep-shallom-api
docker logs -f nextep-shallom-api
docker compose -f /opt/nextep/shallom/compose.yml ps
```

Se o Caddy não rotear, validar antes de recarregar:

```bash
docker exec nextep-edge caddy validate --config /etc/caddy/Caddyfile
docker exec nextep-edge caddy reload --config /etc/caddy/Caddyfile
```

## 9. Arquivos-chave do repositório

- `deploy/compose.yml` — stack do servidor (imagens GHCR).
- `deploy/Dockerfile` — API.
- `deploy/web.Dockerfile` — painel.
- `deploy/app-publico.Dockerfile` e `deploy/app-membros.Dockerfile` — apps Expo.
- `deploy/nginx.conf` e `deploy/apps-nginx.conf` — Nginx.
- `deploy/caddy-shallom-apps.conf` — blocos dos subdomínios no Caddy.
- `deploy/README-DEPLOY.md` — documentação operacional detalhada.

## 10. Observações para o próximo chat

- O app público continua mock/estático; o de membros consome a API real.
- O repositório é público: nunca commitar `.env`, banco, backups ou credenciais.
- O primeiro push na `main` dispara deploy; use `[skip ci]` em commits apenas de
  documentação para evitar rebuild desnecessário.
- Se alterar `compose.yml`, aplique a versão nova em `/opt/nextep/shallom/compose.yml`
  antes do deploy.
