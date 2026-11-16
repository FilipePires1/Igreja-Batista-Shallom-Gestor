# Deploy — Sistema da Igreja (Batista Shallom)

> Ambiente publicado no servidor `116.203.100.189`.
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

## Estrutura no servidor

```text
/opt/nextep/shallom/
├── app/
│   ├── api/          # código da API (src, prisma, package.json)
│   └── web/          # index.html, dashboard.html, css, js, assets
├── apps/
│   ├── publico/      # build web do app público (Expo)
│   └── membros/      # build web do app de membros (Expo)
├── apps-nginx.conf   # configuração Nginx dos apps
├── Dockerfile
├── web.Dockerfile
├── compose.yml
├── nginx.conf
├── .env              # segredos reais (chmod 600, não versionar)
├── .env.example
└── backup.sh
```

## Atualizar o sistema

```bash
# 1. enviar os arquivos novos para /opt/nextep/shallom/app
# 2. reconstruir e subir
cd /opt/nextep/shallom
docker compose build
docker compose up -d
```

### Atualizar os apps

Os apps são arquivos estáticos; não precisam de build no servidor.

```bash
# local: gerar os builds
npx expo export --platform web --output-dir dist

# enviar o conteúdo de dist/ para a pasta correspondente
rsync -av --delete dist/ filipe@116.203.100.189:/opt/nextep/shallom/apps/publico/
rsync -av --delete dist/ filipe@116.203.100.189:/opt/nextep/shallom/apps/membros/
```

Os containers leem os arquivos diretamente do disco (volume read-only), então
basta recarregar a página. Se o `nginx` reiniciar, confira `apps-nginx.conf`
sem BOM UTF-8.

A API executa `prisma migrate deploy` no start. Em caso de falha de migration,
o container não sobe a versão nova.

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

Este deploy é uma **homologação controlada**. Antes de abrir para a igreja:

- [ ] Substituir o token `temp-<id>` por JWT assinado.
- [ ] Aplicar guards nas rotas da API (hoje o Basic Auth do Caddy é a proteção).
- [ ] Remover o `localStorage` como validação de sessão no frontend.
- [ ] Criar usuários reais e remover o usuário de seed.
- [ ] Configurar domínio próprio da igreja e Cloudflare, se desejado.

## Observações

- O app público é estático/mock: ainda não consome a API.
- O app de membros chama `/api` no próprio domínio (sem CORS e sem senha
  embutida no bundle).
- O banco é SQLite, adequado ao porte atual. Migrar para PostgreSQL se houver
  mais de uma instância da API ou necessidade de concorrência maior.
- O `Dockerfile` de build instala `python3`, `make` e `g++` porque o
  `better-sqlite3` compila módulo nativo.
- O migration inicial foi regenerado a partir do `schema.prisma` em 16/11/2026.
- Os apps foram publicados em 16/11/2026.
