# Igreja Batista Shallom — Gestor

Sistema de gestão da Igreja Batista Shallom (Cidade Nobre), com painel administrativo, API, app público e app de membros.

## Estrutura

```text
.
├── banco-de-dados/ibscn-api/   # API NestJS + Prisma + SQLite
├── sistema-web/                # Painel administrativo (HTML/CSS/JS)
├── app-publico/ibscn-publico/  # App Expo (público)
├── app-membros/ibscn-membros/  # App Expo (membros)
├── deploy/                     # Dockerfiles, compose, Nginx, Caddy e backup
└── .github/workflows/          # CI e deploy
```

## Ambientes publicados

| Ambiente | URL | Proteção |
| --- | --- | --- |
| Teste — painel | https://shallom-teste.116-203-100-189.sslip.io | Basic Auth |
| Teste — app público | https://app-teste.116-203-100-189.sslip.io | Aberto |
| Teste — app de membros | https://membros-teste.116-203-100-189.sslip.io | Basic Auth + login |
| Produção — painel | https://shallom.116-203-100-189.sslip.io | Basic Auth |
| Produção — app público | https://app.116-203-100-189.sslip.io | Aberto |
| Produção — app de membros | https://membros.116-203-100-189.sslip.io | Basic Auth + login |

Credenciais são entregues fora do repositório e nunca devem ser commitadas.

> Os domínios antigos `sistema.116...`, `app-prod.116...` e `membros-prod.116...`
> continuam ativos como aliases da produção.

## Desenvolvimento local

Guia completo: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).  
Rotas da API: [`docs/API.md`](docs/API.md).

### API

```bash
cd banco-de-dados/ibscn-api
cp .env.example .env
npm ci
npm run prisma:generate
npm run migrate:dev
npm run seed:dev
npm run start:dev
```

A API usa SQLite em `DATABASE_URL`/`DATABASE_PATH`. As migrations rodam no start do container de deploy; localmente use `npm run migrate:dev`.

### Painel

Arquivos estáticos em `sistema-web/`. Para servir localmente:

```bash
cd sistema-web
npx serve .
```

### Apps Expo

```bash
cd app-publico/ibscn-publico   # ou app-membros/ibscn-membros
npm ci
npx expo start
```

Build web:

```bash
npx expo export --platform web --output-dir dist
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`): roda em pull requests e pushes na `develop`; compila a API e exporta os dois apps web.
- **Teste** (`.github/workflows/deploy-test.yml`): push na `develop` ou manual; builda as quatro imagens, publica no GHCR e atualiza `/opt/nextep/shallom`.
- **Produção** (`.github/workflows/deploy-prod.yml`): somente manual ou `repository_dispatch`; exige aprovação no environment `producao` e branch `main`; atualiza `/opt/nextep/shallom-prod`.

Imagens publicadas:

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-app-membros
```

### Secrets e environments

| Item | Uso |
| --- | --- |
| `SSH_PRIVATE_KEY` | Chave privada SSH do usuário `filipe` no servidor |
| `producao` | Environment com aprovação obrigatória e branch `main` |

O `GITHUB_TOKEN` é usado automaticamente para publicar e puxar as imagens do GHCR.

### Servidor

- Teste: `/opt/nextep/shallom` (`compose.yml` + `.env`).
- Produção: `/opt/nextep/shallom-prod` (`compose.prod.yml` + `.env`).
- O deploy não altera `.env` nem banco; apenas puxa a imagem da tag do commit e recria os containers.

## Segurança

- Este repositório é **público**: não commitar `.env`, banco, backups ou credenciais.
- A API ainda usa token temporário `temp-<id>` e não possui guards completos. O Basic Auth do Caddy é a proteção atual do painel e do app de membros.
- Antes de produção: implementar JWT/guards, revisar o seed (`admin123`) e trocar todos os padrões.
