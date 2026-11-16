# Deploy — Sistema da Igreja (Batista Shallom)

> Ambientes separados no servidor `116.203.100.189`.
>
> | Ambiente | URL | Proteção | Deploy |
> | --- | --- | --- | --- |
> | Teste | https://shallom.116-203-100-189.sslip.io | Basic Auth | push na `develop` |
> | Teste (app público) | https://app.116-203-100-189.sslip.io | Aberto | push na `develop` |
> | Teste (membros) | https://membros.116-203-100-189.sslip.io | Basic Auth + login | push na `develop` |
> | Produção | https://sistema.116-203-100-189.sslip.io | Basic Auth | manual + aprovação |
> | Produção (app público) | https://app-prod.116-203-100-189.sslip.io | Aberto | manual + aprovação |
> | Produção (membros) | https://membros-prod.116-203-100-189.sslip.io | Basic Auth + login | manual + aprovação |

## Arquitetura

```text
Internet
  -> Caddy (nextep-edge, 80/443)
     -> shallom.*       -> nextep-shallom-web / app-publico / app-membros
     -> app.*           -> nextep-shallom-app-publico
     -> membros.*       -> Basic Auth -> /api/* -> nextep-shallom-api
                                      -> demais  -> nextep-shallom-app-membros
     -> sistema.*       -> Basic Auth -> nextep-shallom-prod-web
     -> app-prod.*      -> nextep-shallom-prod-app-publico
     -> membros-prod.*  -> Basic Auth -> /api/* -> nextep-shallom-prod-api
                                      -> demais  -> nextep-shallom-prod-app-membros
```

- API: NestJS + Prisma 7 + SQLite.
- Painel: HTML/CSS/JS servido pelo Nginx (upstream da API via `API_UPSTREAM`).
- Apps: builds web do Expo servidos por Nginx.
- Cada ambiente tem rede, banco e containers próprios.
- Edge: Caddy com TLS automático e Basic Auth no painel/membros.

## CI/CD

- Repositório: https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor
- CI: `.github/workflows/ci.yml` (pull requests e `develop`).
- Teste: `.github/workflows/deploy-test.yml` (push na `develop` ou manual).
- Produção: `.github/workflows/deploy-prod.yml` (somente manual ou `repository_dispatch`).
  O job de deploy usa o environment `producao`, que exige aprovação do responsável
  e só aceita a branch `main`.

Imagens publicadas:

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-app-membros
```

- Teste publica `:test-<sha>` e `:test`.
- Produção publica `:<sha>` e `:latest`.
- O deploy sempre usa a tag do commit (`IMAGE_TAG`).

### Secrets e environments

| Item | Uso |
| --- | --- |
| `SSH_PRIVATE_KEY` | Chave privada SSH do usuário `filipe` |
| Environment `producao` | Aprovação obrigatória + branch `main` |

O `GITHUB_TOKEN` cuida do GHCR automaticamente. Para pull manual, use um PAT
com `read:packages`.

## Estrutura no servidor

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

Os containers de teste usam `nextep-shallom-*`; os de produção usam
`nextep-shallom-prod-*`. Os bancos são volumes separados:
`nextep_shallom_data` e `nextep_shallom_prod_data`.

## Deploy e rollback

### Teste

```bash
cd /opt/nextep/shallom
export IMAGE_TAG=<sha>
docker compose pull
docker compose up -d
```

### Produção

Disparar **Deploy PRODUCAO** no GitHub Actions, escolher a branch `main` e
aprovar no environment `producao`. O workflow faz o pull e o healthcheck.

Rollback manual:

```bash
cd /opt/nextep/shallom-prod
export IMAGE_TAG=<sha-anterior>
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d
```

### Logs e diagnóstico

```bash
docker ps --filter name=nextep-shallom
docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' nextep-shallom-api
docker logs -f nextep-shallom-api

docker ps --filter name=nextep-shallom-prod
docker inspect -f '{{.Config.Image}} {{.State.Health.Status}}' nextep-shallom-prod-api
docker logs -f nextep-shallom-prod-api
```

### Alterar variáveis de ambiente

```bash
cd /opt/nextep/shallom && vi .env && docker compose up -d api
cd /opt/nextep/shallom-prod && vi .env && docker compose -f compose.prod.yml up -d api
```

Nunca commitar os `.env`.

## Banco, seed e backup

O seed de teste (`prisma/seed.js`) cria dados demo e é destrutivo. O seed de
produção (`prisma/seed-prod.js`) cria apenas cargos, permissões, ministérios,
configurações e o admin, usando `SEED_ADMIN_PASSWORD`.

```bash
# produção: rodar somente no primeiro provisionamento
cd /opt/nextep/shallom-prod
docker compose -f compose.prod.yml exec -T \
  -e SEED_ADMIN_PASSWORD='<senha-forte>' \
  api node prisma/seed-prod.js
```

Backups:

```bash
/opt/nextep/shallom/backup.sh
/opt/nextep/shallom-prod/backup.sh
ls -lh /opt/nextep/backups/shallom/ /opt/nextep/backups/shallom-prod/
```

Restauração: pare a API, substitua o arquivo dentro do volume e suba de novo.
Nunca apague um volume sem backup e autorização.

## Acesso

- Cada ambiente tem seu próprio Basic Auth; as credenciais são entregues ao
  responsável e não ficam neste arquivo.
- O app público é aberto, sem login.
- O login do sistema e do app de membros usa a tabela `User` do banco.
- O admin de produção é criado pelo `seed-prod.js` com senha forte.

## Pendências de segurança

Este deploy é uma **pré-produção controlada** e o repositório é **público**.
Antes de abrir para a igreja:

- [ ] Substituir o token `temp-<id>` por JWT assinado.
- [ ] Aplicar guards nas rotas da API.
- [ ] Remover o `localStorage` como validação de sessão no frontend.
- [ ] Trocar o seed `admin123` (teste) e criar usuários reais.
- [ ] Avaliar tornar o repositório privado.
- [ ] Configurar domínio próprio da igreja e Cloudflare.
- [ ] Remover o Basic Auth quando houver autenticação real na API.

## Observações

- O app público é estático/mock: ainda não consome a API.
- O app de membros chama `/api` no próprio domínio.
- O Nginx do painel usa `API_UPSTREAM` para apontar para a API de cada ambiente.
- Os arquivos `_test.html`, `_t2.html` e `_t3.html` foram removidos do painel e
  guardados em `referencia/test-backdoors/` (fora do repositório e da imagem).
- O banco é SQLite; migrar para PostgreSQL se houver mais de uma instância da API.
- CI/CD ativado em 16/11/2026; separação teste/produção em 16/11/2026.
