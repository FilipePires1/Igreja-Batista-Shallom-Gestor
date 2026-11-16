#!/usr/bin/env bash
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
STAMP=$(date +%Y%m%d-%H%M%S)
DEST=/opt/nextep/backups/shallom
mkdir -p "$DEST"
docker exec nextep-shallom-api sqlite3 /app/data/ibscn.db ".backup '/app/data/ibscn-$STAMP.db'"
docker cp "nextep-shallom-api:/app/data/ibscn-$STAMP.db" "$DEST/ibscn-$STAMP.db"
docker exec nextep-shallom-api rm -f "/app/data/ibscn-$STAMP.db"
find "$DEST" -name 'ibscn-*.db' -mtime +7 -delete
echo "$(date -Is) backup ok: $DEST/ibscn-$STAMP.db"
