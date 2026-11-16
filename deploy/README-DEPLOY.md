# Deploy — Sistema da Igreja (Batista Shallom)

> Ambiente de homologação publicado no servidor `116.203.100.189`.
>
> | O que | URL | Proteção |
> | --- | --- | --- |
> | Painel administrativo | https://shallom.116-203-100-189.sslip.io | Basic Auth |
> | App público | https://app.116-203-100-189.sslip.io | Aberto |
> | App de membros | https://membros.116-203-100-189.sslip.io | Basic Auth + login |

## Arquitetura

```text
Internet
  -> Caddy (nextep-edge, 80/443)
     -> shallom.*  -> Basic Auth -> nextep-shallom-web (Nginx)
     |                 -> /api/* -> nextep-shallom-api (NestJS, porta interna 3000)
     |                              -> SQLite (volume nextep_shallom_data)
     -> app.*      -> nextep-shallom-app-publico (Nginx, build Expo estático)
     -> membros.*  -> Basic Auth -> /api/* -> nextep-shallom-api
                                  -> demais  -> nextep-shallom-app-membros (Nginx)
```

- API: NestJS + Prisma 7 + SQLite.
- Painel: HTML/CSS/JS estático servido pelo Nginx.
- Apps: builds web do Expo (`expo export --platform web`) servidos por Nginx.
- Edge: Caddy com TLS automático; `basic_auth` no painel e no app de membros.
- Banco: volume Docker `nextep_shallom_data`; não publica porta.
- Backup: `/opt/nextep/shallom/backup.sh`, diário às 02:15, retenção de 7 dias em `/opt/nextep/backups/shallom/`.

## CI/CD

- Repositório: https://github.com/FilipePires1/Igreja-Batista-Shallom-Gestor
- CI: `.github/workflows/ci.yml` (pull requests e pushes na `develop`).
- Deploy: `.github/workflows/deploy.yml` (push na `main` ou manual).
- Imagens no GHCR:

```text
ghcr.io/filipepires1/igreja-shallom-api
ghcr.io/filipepires1/igreja-shallom-app-publico
ghcr.io/filipepires1/igreja-shallom-web
ghcr.io/filipepires1/igreja-shallom-app-membros
```

Cada execução publica a tag do commit (`${{ github.sha }}`) e `latest`. O deploy
faz login no GHCR, `docker compose pull`, `docker compose up -d` e aguarda os
quatro containers ficarem `healthy`.

### Secret necessário

| Secret | Uso |
| --- | --- |
| `SSH_PRIVATE_KEY` | Chave privada SSH do usuário `filipe` no servidor |

O `GITHUB_TOKEN` cuida do GHCR automaticamente. Para puxar imagens manualmente
no servidor, use um PAT com `read:packages`.

### Fluxo

```text
push na main
  -> build das 4 imagens (matriz)
  -> push para ghcr.io
  -> SSH no servidor
  -> docker compose pull + up -d
  -> healthcheck dos 4 containers
```

A API executa `prisma migrate deploy` no start. Em caso de falha de migration,
o container não sobe a versão nova.

## Estrutura no servidor

```text
/opt/nextep/shallom/
├── compose.yml       # stack baseada nas imagens do GHCR
├── .env              # segredos reais (não versionar)
├── .env.example
├── backup.sh
├── app/              # legado do primeiro deploy (não é mais usado)
├── apps/             # legado do primeiro deploy (não é mais usado)
├── apps-nginx.conf   # usado apenas para build local das imagens
├── Dockerfile
├── web.Dockerfile
├── app-publico.Dockerfile
├── app-membros.Dockerfile
├── nginx.conf
└── README-DEPLOY.md
```

O Caddy fica separado em `/opt/nextep/edge/Caddyfile`.

## Deploy e rollback

Deploy normal: push na `main` ou rodar o workflow manualmente no GitHub.

```bash
# conferir containers e imagem em uso
docker ps --filter name=nextep-shallom
docker inspect -f '{{.Config.Image}}' nextep-shallom-api

# logs
docker logs -f nextep-shallom-api
```

Rollback para um commit anterior:

```bash
cd /opt/nextep/shallom
export IMAGE_TAG=<sha-do-commit>
docker compose pull
docker compose up -d
```

As tags antigas permanecem no GHCR. O `docker image prune -f` do workflow remove
apenas imagens sem tag.

### Alterar variáveis de ambiente

```bash
cd /opt/nextep/shallom
vi .env
docker compose up -d api   # recria somente a API
```

Nunca commitar o `.env`.

## Banco e backup

```bash
# backup manual
/opt/nextep/shallom/backup.sh

# conferir backups
ls -lh /opt/nextep/backups/shallom/
```

Restauração: pare a API, substitua o arquivo dentro do volume e suba de novo.
Nunca apague o volume sem backup e autorização.

## Acesso

- O painel e o app de membros têm uma camada de Basic Auth (Caddy). As
  credenciais são entregues ao responsável e não ficam neste arquivo.
- O app público é aberto, sem login.
- O login do sistema e do app de membros usa a tabela `User` do banco.
- O usuário inicial é `pastor@ibscn.org` (SUPER_ADMIN/PASTOR), com senha forte
  definida no primeiro deploy. Troque no cadastro antes de entregar à igreja.

## Pendências de segurança

Este deploy é uma **homologação controlada** e o repositório é **público**.
Antes de abrir para a igreja:

- [ ] Substituir o token `temp-<id>` por JWT assinado.
- [ ] Aplicar guards nas rotas da API (hoje o Basic Auth do Caddy é a proteção).
- [ ] Remover o `localStorage` como validação de sessão no frontend.
- [ ] Trocar o seed `admin123` e criar usuários reais.
- [ ] Avaliar tornar o repositório privado.
- [ ] Configurar domínio próprio da igreja e Cloudflare, se desejado.
- [ ] Criar ambiente de produção separado, com aprovação explícita.

## Observações

- O app público é estático/mock: ainda não consome a API.
- O app de membros chama `/api` no próprio domínio (sem CORS e sem senha
  embutida no bundle).
- Os arquivos `_test.html`, `_t2.html` e `_t3.html`, que faziam bypass de login
  via `localStorage`, foram removidos do painel e guardados em
  `referencia/test-backdoors/` (fora do repositório e da imagem).
- O banco é SQLite, adequado ao porte atual. Migrar para PostgreSQL se houver
  mais de uma instância da API ou necessidade de concorrência maior.
- O `Dockerfile` de build instala `python3`, `make` e `g++` porque o
  `better-sqlite3` compila módulo nativo.
- O migration inicial foi regenerado a partir do `schema.prisma` em 16/11/2026.
- CI/CD ativado em 16/11/2026; primeiro deploy automatizado no commit `cb65cb6`.
