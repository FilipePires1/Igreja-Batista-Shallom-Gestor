# Handoff de Deploy — Igreja Batista Shallom

**Data:** 16/11/2026  
**Status:** dois ambientes ativos (teste e produção), CI/CD separado e aprovação obrigatória para produção.

## 1. Ambientes

| Ambiente | Painel | App público | App de membros | Deploy |
| --- | --- | --- | --- | --- |
| Teste | https://shallom.116-203-100-189.sslip.io | https://app.116-203-100-189.sslip.io | https://membros.116-203-100-189.sslip.io | push na `develop` |
| Produção | https://sistema.116-203-100-189.sslip.io | https://app-prod.116-203-100-189.sslip.io | https://membros-prod.116-203-100-189.sslip.io | manual + aprovação |

- Teste: Basic Auth + banco com dados de teste preservados.
- Produção: Basic Auth + banco novo, apenas base (cargos, ministérios, configurações e admin).
- TLS Let's Encrypt válido nos seis domínios.
- Produção é uma **pré-produção controlada**; o domínio próprio da igreja ainda não foi configurado.

## 2. Repositório e CI/CD

- Repositório: https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor
- Branches: `main` (produção) e `develop` (teste).
- Teste implantado: `22bd3ff` — run https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor/actions/runs/43922417291
- Produção implantada: `c78d0a3` — run https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor/actions/runs/43923250512

Workflows:

| Arquivo | Gatilho | Destino |
| --- | --- | --- |
| `.github/workflows/ci.yml` | PRs e push na `develop` | build da API e apps |
| `.github/workflows/deploy-test.yml` | push na `develop` ou manual | `/opt/nextep/shallom` |
| `.github/workflows/deploy-prod.yml` | manual ou `repository_dispatch` | `/opt/nextep/shallom-prod` |

Produção usa o environment `producao` no GitHub, com:

- reviewer obrigatório: `FilipePires1`;
- branch policy: somente `main`;
- nenhum deploy automático por push.

Imagens no GHCR:

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-app-membros
```

- Teste: `:<sha>` e `:test`.
- Produção: `:<sha>` e `:latest`.
- O deploy sempre usa `IMAGE_TAG=<sha>`.

### Como fazer deploy

Teste:

```bash
git checkout develop
git merge main
git push origin develop
```

Produção:

1. GitHub → Actions → **Deploy PRODUCAO - Igreja Batista Shallom** → Run workflow.
2. Escolher a branch `main`.
3. Aprovar no environment `producao`.
4. O workflow builda, publica no GHCR, puxa no servidor e valida os healthchecks.

## 3. Servidor

```text
/opt/nextep/shallom/          # TESTE
├── compose.yml
├── .env
├── backup.sh
└── ...

/opt/nextep/shallom-prod/     # PRODUÇÃO
├── compose.prod.yml
├── .env
├── backup.sh
└── ...

/opt/nextep/edge/Caddyfile
/opt/nextep/backups/shallom/
/opt/nextep/backups/shallom-prod/
```

- Teste: containers `nextep-shallom-*`, volume `nextep_shallom_data`.
- Produção: containers `nextep-shallom-prod-*`, volume `nextep_shallom_prod_data`.
- Redes internas separadas; ambas conectadas à `nextep_edge`.
- O Nginx do painel usa `API_UPSTREAM` para apontar para a API do ambiente correto.

## 4. Estado validado

Teste:

- Quatro containers `healthy` na tag `22bd3ff`.
- Painel `200` com Basic Auth; login `201`.
- App público `200`.
- App de membros `401` sem auth e `200` com auth; login `201`.
- `/api/stats` preservado com os dados de teste.

Produção:

- Quatro containers `healthy` na tag `c78d0a3`.
- Seed `seed-prod.js` executado: 6 cargos, 17 ministérios, permissões, seções do app, configurações e admin.
- Painel `200` com Basic Auth; login `201`.
- App público `200`.
- App de membros `401` sem auth e `200` com auth; login `201`.
- `/api/stats` limpo: 1 membro (admin), 0 escalas, 0 avisos.

Backups:

- Teste: diário às 02:15, retenção de 7 dias.
- Produção: diário às 02:30, retenção de 7 dias.
- Backup manual de produção validado em `/opt/nextep/backups/shallom-prod/`.

## 5. Credenciais

Não ficam neste arquivo nem no repositório. Filipe tem os valores atuais.

- Teste — Basic Auth: usuário `shallom`; admin `pastor@ibscn.org`.
- Produção — Basic Auth: usuário `shallomprod`; admin `pastor@ibscn.org`.
- As senhas de produção foram geradas aleatoriamente no provisionamento.

## 6. O que foi configurado nesta etapa

- Separação de stack, rede, volume, `.env`, containers e domínios.
- Workflow de teste na `develop` e workflow de produção manual com aprovação.
- Environment `producao` no GitHub com reviewer e branch policy.
- `seed-prod.js` não destrutivo, sem dados demo, com senha de admin via env.
- Nginx do painel parametrizado por `API_UPSTREAM`.
- Backup próprio de produção + cron.
- Blocos de produção no Caddy, com Basic Auth separado.
- Remoção dos arquivos `_test.html`, `_t2.html` e `_t3.html` do painel/imagem.

## 7. Pendências antes de produção real

- [ ] Trocar token `temp-<id>` por JWT assinado.
- [ ] Aplicar guards reais nas rotas da API.
- [ ] Remover validação de sessão via `localStorage` no painel.
- [ ] Trocar o seed `admin123` do ambiente de teste.
- [ ] Avaliar tornar o repositório privado.
- [ ] Configurar domínio próprio da igreja e Cloudflare.
- [ ] Remover o Basic Auth quando a autenticação real estiver pronta.
- [ ] Testar notificações push do PWA no iPhone.
- [ ] Revogar o token Cloudflare exposto em conversa anterior, se ainda válido.

## 8. Rollback e troubleshooting

Rollback de teste:

```bash
cd /opt/nextep/shallom
export IMAGE_TAG=<sha>
docker compose pull
docker compose up -d
```

Rollback de produção:

```bash
cd /opt/nextep/shallom-prod
export IMAGE_TAG=<sha>
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d
```

Se o pull falhar por pacote privado:

```bash
echo "<pat-read-packages>" | docker login ghcr.io -u FilipePires1 --password-stdin
```

Diagnóstico:

```bash
docker ps --filter name=nextep-shallom
docker ps --filter name=nextep-shallom-prod
docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' nextep-shallom-api
docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' nextep-shallom-prod-api
docker logs -f nextep-shallom-prod-api
```

Caddy:

```bash
docker exec nextep-edge caddy validate --config /etc/caddy/Caddyfile
docker exec nextep-edge caddy reload --config /etc/caddy/Caddyfile
```

## 9. Arquivos-chave

- `deploy/compose.yml` — stack de teste.
- `deploy/compose.prod.yml` — stack de produção.
- `deploy/Dockerfile` — API.
- `deploy/web.Dockerfile` + `deploy/nginx.conf.template` — painel.
- `deploy/app-publico.Dockerfile` e `deploy/app-membros.Dockerfile` — apps.
- `deploy/caddy-shallom-apps.conf` e `deploy/caddy-shallom-prod.conf` — Caddy (hash como placeholder).
- `deploy/backup.sh` e `deploy/backup-prod.sh` — backups.
- `banco-de-dados/ibscn-api/prisma/seed-prod.js` — seed de produção.
- `deploy/README-DEPLOY.md` — documentação operacional completa.

## 10. Observações para o próximo chat

- O app público continua mock/estático; o de membros consome a API real.
- O repositório é público: nunca commitar `.env`, banco, backups ou credenciais.
- Mudanças em `compose.yml`, `Caddyfile` ou `.env` **não** são aplicadas pelo pipeline;
  precisam ser copiadas para o servidor manualmente.
- Use `[skip ci]` em commits apenas de documentação para evitar rebuild.
- O gate de produção está ativo; o primeiro deploy foi aprovado manualmente no provisionamento.
