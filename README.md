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
| Painel | https://shallom.116-203-100-189.sslip.io | Basic Auth |
| App público | https://app.116-203-100-189.sslip.io | Aberto |
| App de membros | https://membros.116-203-100-189.sslip.io | Basic Auth + login |

Credenciais são entregues fora do repositório e nunca devem ser commitadas.

## Desenvolvimento local

### API

```bash
cd banco-de-dados/ibscn-api
npm ci
npx prisma generate --config prisma7.config.ts
npm run start:dev
```

A API usa SQLite em `DATABASE_URL` (veja `.env.example` em `deploy/`). As migrations rodam no start do container.

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
- **Deploy** (`.github/workflows/deploy.yml`): roda em push na `main` ou manualmente; builda as quatro imagens, publica no GHCR e atualiza o servidor de homologação via SSH.

Imagens publicadas:

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-app-membros
```

### Secrets necessários no GitHub

| Secret | Uso |
| --- | --- |
| `SSH_PRIVATE_KEY` | Chave privada SSH do usuário `filipe` no servidor |

O `GITHUB_TOKEN` é usado automaticamente para publicar e puxar as imagens do GHCR.

### Servidor

O stack fica em `/opt/nextep/shallom` (`compose.yml` + `.env`). O deploy não altera o `.env` nem o banco; apenas puxa as imagens da tag do commit e recria os containers.

## Segurança

- Este repositório é **público**: não commitar `.env`, banco, backups ou credenciais.
- A API ainda usa token temporário `temp-<id>` e não possui guards completos. O Basic Auth do Caddy é a proteção atual do painel e do app de membros.
- Antes de produção: implementar JWT/guards, revisar o seed (`admin123`) e trocar todos os padrões.
