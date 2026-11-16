#!/usr/bin/env bash
# Acesso ao banco SQLite dos ambientes. Executar NO SERVIDOR (ou via ssh).
#
# Uso:
#   ./db.sh test info
#   ./db.sh test readonly
#   ./db.sh test shell
#   ./db.sh test query "select count(*) from Person;"
#   ./db.sh test dump
#   ./db.sh test backup
#
#   ./db.sh prod info
#   ./db.sh prod readonly
#   ./db.sh prod query "select count(*) from Person;"
#   ./db.sh prod dump
#   ./db.sh prod backup
#   ALLOW_PROD_WRITE=1 ./db.sh prod shell   # somente com autorização
set -euo pipefail

ENV="${1:-}"
CMD="${2:-help}"
ARG="${3:-}"

case "$ENV" in
  test|teste)
    API="nextep-shallom-api"
    BACKUP="/opt/nextep/shallom/backup.sh"
    LABEL="TESTE"
    ;;
  prod|producao)
    API="nextep-shallom-prod-api"
    BACKUP="/opt/nextep/shallom-prod/backup.sh"
    LABEL="PRODUCAO"
    ;;
  *)
    echo "Uso: $0 {test|prod} {info|readonly|shell|query|dump|backup}" >&2
    exit 1
    ;;
esac

echo "== $LABEL / $CMD ==" >&2

case "$CMD" in
  info)
    docker exec -i "$API" sqlite3 -readonly /app/data/ibscn.db <<'SQL'
.headers on
.mode column
PRAGMA integrity_check;
SELECT 'Person' AS tabela, COUNT(*) AS linhas FROM Person
UNION ALL SELECT 'User', COUNT(*) FROM User
UNION ALL SELECT 'Sector', COUNT(*) FROM Sector
UNION ALL SELECT 'Schedule', COUNT(*) FROM Schedule
UNION ALL SELECT 'Announcement', COUNT(*) FROM Announcement
UNION ALL SELECT 'Event', COUNT(*) FROM Event
UNION ALL SELECT 'Order', COUNT(*) FROM "Order";
SQL
    ;;
  readonly|ro)
    exec docker exec -it "$API" sqlite3 -readonly /app/data/ibscn.db
    ;;
  shell)
    if [ "$LABEL" = "PRODUCAO" ] && [ "${ALLOW_PROD_WRITE:-0}" != "1" ]; then
      echo "PRODUCAO: abrindo shell SOMENTE LEITURA." >&2
      echo "Para liberar escrita: ALLOW_PROD_WRITE=1 $0 prod shell" >&2
      exec docker exec -it "$API" sqlite3 -readonly /app/data/ibscn.db
    fi
    exec docker exec -it "$API" sqlite3 /app/data/ibscn.db
    ;;
  query)
    if [ -z "$ARG" ]; then
      echo "Informe a SQL entre aspas." >&2
      exit 1
    fi
    docker exec -i "$API" sqlite3 -readonly /app/data/ibscn.db "$ARG"
    ;;
  dump)
    STAMP=$(date +%Y%m%d-%H%M%S)
    DEST="/opt/nextep/dumps/$ENV"
    mkdir -p "$DEST"
    docker exec "$API" sqlite3 /app/data/ibscn.db ".backup '/app/data/dump-$STAMP.db'"
    docker cp "$API:/app/data/dump-$STAMP.db" "$DEST/ibscn-$STAMP.db"
    docker exec "$API" rm -f "/app/data/dump-$STAMP.db"
    echo "$DEST/ibscn-$STAMP.db"
    ;;
  backup)
    "$BACKUP"
    ;;
  *)
    echo "Uso: $0 {test|prod} {info|readonly|shell|query|dump|backup}" >&2
    exit 1
    ;;
esac
