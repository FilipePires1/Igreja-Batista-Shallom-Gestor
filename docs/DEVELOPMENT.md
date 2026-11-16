# Desenvolvimento — Igreja Batista Shallom

Guia para trabalhar no sistema: ambientes, banco, migrations, seeds, branches e deploy.

## Ambientes

| Ambiente | Painel | App público | Membros | Deploy |
| --- | --- | --- | --- | --- |
| Local | http://localhost:8080 | Expo local | Expo local | manual |
| Teste | https://shallom.116-203-100-189.sslip.io | https://app.116-203-100-189.sslip.io | https://membros.116-203-100-189.sslip.io | push na `develop` |
| Produção | https://sistema.116-203-100-189.sslip.io | https://app-prod.116-203-100-189.sslip.io | https://membros-prod.116-203-100-189.sslip.io | manual + aprovação |

Credenciais de Basic Auth e admin são entregues pelo responsável. Não commitar.

## Pré-requisitos

- Node.js 22 e npm
- Git
- Docker (opcional; só para testar imagens)
- Expo Go no celular (opcional)

## Estrutura

```text
banco-de-dados/ibscn-api/   API NestJS + Prisma + SQLite
sistema-web/                Painel HTML/CSS/JS
app-publico/ibscn-publico/  App Expo público (mock/estático)
app-membros/ibscn-membros/  App Expo de membros (consome a API)
deploy/                     Docker, compose, Caddy, backups
scripts/                    db.sh e smoke.sh
docs/                       esta documentação e API.md
```

## Primeiro setup local

```bash
git clone https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor.git
cd Igreja-Batista-Shallom-Gestor
```

### API

```bash
cd banco-de-dados/ibscn-api
cp .env.example .env        # Windows: copy .env.example .env
npm ci
npm run prisma:generate
npm run migrate:dev
npm run seed:dev
npm run start:dev
```

- API: http://localhost:3000/api
- Health: http://localhost:3000/api/health
- O `seed:dev` é **destrutivo** e cria dados de demonstração. Use só no banco local.

### Painel

Com a API rodando:

```bash
npx serve sistema-web -l 8080
```

Abra http://localhost:8080. O painel detecta `localhost` e chama a API em
`http://localhost:3000/api`; em produção ele usa `/api` no mesmo domínio.

### App de membros

```bash
cd app-membros/ibscn-membros
npm ci
```

Web local, apontando para a API local:

```powershell
$env:EXPO_PUBLIC_API_URL='http://localhost:3000/api'
npx expo start --web
```

```bash
# bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api npx expo start --web
```

Nativo (celular na mesma rede): ajuste `LAN_IP` em `constants/api.ts` ou use
`EXPO_PUBLIC_API_URL=http://<ip-do-pc>:3000/api`.

### App público

```bash
cd app-publico/ibscn-publico
npm ci
npx expo start
```

Hoje o app público é mock/estático e não consome a API.

## Banco local

- Arquivo: `banco-de-dados/ibscn-api/dev.db` (ignorado pelo Git).
- Reset completo:

```bash
cd banco-de-dados/ibscn-api
rm dev.db
npm run migrate:dev
npm run seed:dev
```

No Windows, apague `dev.db` pelo Explorer ou `Remove-Item dev.db`.

## Banco dos ambientes

Os bancos ficam em volumes Docker, sem porta exposta:

- Teste: `nextep_shallom_data`, container `nextep-shallom-api`.
- Produção: `nextep_shallom_prod_data`, container `nextep-shallom-prod-api`.

Use o script `scripts/db.sh` **no servidor** (ou via ssh):

```bash
# consultas somente leitura
/opt/nextep/scripts/db.sh test info
/opt/nextep/scripts/db.sh test query "select count(*) from Person;"
/opt/nextep/scripts/db.sh prod info
/opt/nextep/scripts/db.sh prod query "select count(*) from Person;"

# shell interativo (produção abre somente leitura por padrão)
/opt/nextep/scripts/db.sh test shell
/opt/nextep/scripts/db.sh prod shell
ALLOW_PROD_WRITE=1 /opt/nextep/scripts/db.sh prod shell   # com autorização

# snapshot consistente para análise local
/opt/nextep/scripts/db.sh test dump
/opt/nextep/scripts/db.sh prod dump

# backup oficial
/opt/nextep/scripts/db.sh prod backup
```

Via ssh:

```bash
ssh filipe@116.203.100.189 "/opt/nextep/scripts/db.sh prod info"
```

Não exponha a porta do SQLite publicamente. Para análise local, use o `dump` e
baixe o arquivo com `scp`.

## Migrations

```bash
cd banco-de-dados/ibscn-api
npm run migrate:dev -- --name nome_da_migration
```

- O comando atualiza o banco local, gera o SQL em `prisma/migrations/` e roda o
  Prisma Client.
- Commite a pasta da migration.
- Nunca edite uma migration já aplicada em teste/produção; crie outra.
- No deploy, a API roda `prisma migrate deploy` no start do container.
- Produção só recebe migration no deploy aprovado.

## Seeds

| Script | Onde usar | O que faz |
| --- | --- | --- |
| `npm run seed:dev` | local | recria dados demo; **destrutivo** |
| `npm run seed:prod` | produção | cria só base + admin; exige `SEED_ADMIN_PASSWORD` |
| `npm run seed:dev` no teste | teste | recria dados demo; **destrutivo, com autorização** |

Seed de produção:

```bash
cd /opt/nextep/shallom-prod
docker compose -f compose.prod.yml exec -T \
  -e SEED_ADMIN_PASSWORD='<senha-forte>' \
  api node prisma/seed-prod.js
```

Não rode `seed.js` em produção.

## Branches e deploy

```text
develop  -> CI + deploy automático no TESTE
main     -> protegida: PR + 4 checks do CI; produção só manual com aprovação
```

Fluxo normal:

```bash
git checkout develop
git pull
# ... alterações ...
git add .
git commit -m "feat: ..."
git push origin develop
```

Para produção:

1. Abra PR de `develop` para `main`.
2. CI precisa passar.
3. Faça merge.
4. GitHub → Actions → **Deploy PRODUCAO** → Run workflow (`main`).
5. Aprove no environment `producao`.

Hotfix: branch a partir de `main`, PR para `main`, deploy aprovado; depois faça
merge de `main` em `develop`.

## CI

`.github/workflows/ci.yml` roda em PRs e na `develop`:

- build da API;
- `tsc` + export web dos dois apps;
- checagem dos arquivos do painel.

Rode localmente antes de abrir PR:

```bash
cd banco-de-dados/ibscn-api && npm run build
cd app-publico/ibscn-publico && npx tsc --noEmit && npx expo export --platform web --output-dir dist
cd app-membros/ibscn-membros && npx tsc --noEmit && npx expo export --platform web --output-dir dist
```

Smoke test dos ambientes:

```bash
TEST_BASIC_AUTH='shallom:senha' \
PROD_BASIC_AUTH='shallomprod:senha' \
./scripts/smoke.sh
```

No Windows:

```powershell
.\scripts\smoke.ps1 `
  -TestBasicAuth 'shallom:senha' `
  -ProdBasicAuth 'shallomprod:senha'
```

## Credenciais e segurança

- Credenciais não ficam no repositório.
- Basic Auth: teste `shallom`; produção `shallomprod`.
- Admin: `pastor@ibscn.org` nos dois ambientes, com senhas diferentes.
- A API ainda usa token `temp-<id>` e não tem guards completos. O Basic Auth do
  Caddy é a proteção atual. Não abra a API sem essa camada.
- O repositório é público. Nunca commite `.env`, banco, backup ou chave SSH.

## Troubleshooting

**Painel diz API offline**
- Confirme a API em http://localhost:3000/api/health.
- Confirme que o painel está em `localhost`/`127.0.0.1` (não `file://`).
- Veja o console do navegador para CORS.

**Expo web chama a API errada**
- Defina `EXPO_PUBLIC_API_URL` antes de `npx expo start`.
- No nativo, ajuste `LAN_IP` em `constants/api.ts`.

**Prisma Client não encontrado**
```bash
npm run prisma:generate
```

**Banco local bloqueado**
- Pare a API antes de rodar seed/reset.
- Backups usam `.backup`, que é seguro com o banco aberto.

**Porta 3000 ocupada**
- `PORT=3001 npm run start:dev` e ajuste a URL do painel/app.

## Documentos relacionados

- `docs/API.md` — rotas da API.
- `deploy/README-DEPLOY.md` — deploy, Caddy, backup e rollback.
- `HANDOFF-DEPLOY.md` — estado atual dos ambientes e pendências.
