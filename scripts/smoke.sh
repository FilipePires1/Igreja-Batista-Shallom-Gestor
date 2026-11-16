#!/usr/bin/env bash
# Smoke test dos ambientes. Rodar da máquina local.
#
# Uso:
#   TEST_BASIC_AUTH='shallom:senha' \
#   PROD_BASIC_AUTH='shallomprod:senha' \
#   ./scripts/smoke.sh
set -euo pipefail

TEST_AUTH="${TEST_BASIC_AUTH:-}"
PROD_AUTH="${PROD_BASIC_AUTH:-}"

if [ -z "$TEST_AUTH" ] || [ -z "$PROD_AUTH" ]; then
  echo "Defina TEST_BASIC_AUTH e PROD_BASIC_AUTH (usuario:senha)." >&2
  exit 1
fi

fail=0

check() {
  local name="$1"
  local url="$2"
  local auth="$3"
  local expected="$4"
  local code

  if [ -n "$auth" ]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -u "$auth" "$url")
  else
    code=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  fi

  printf '%-42s %s (esperado %s)\n' "$name" "$code" "$expected"
  if [ "$code" != "$expected" ]; then
    fail=1
  fi
}

# Teste
check "teste / painel sem auth" "https://shallom.116-203-100-189.sslip.io/" "" "401"
check "teste / painel" "https://shallom.116-203-100-189.sslip.io/" "$TEST_AUTH" "200"
check "teste / app publico" "https://app.116-203-100-189.sslip.io/" "" "200"
check "teste / membros sem auth" "https://membros.116-203-100-189.sslip.io/" "" "401"
check "teste / membros" "https://membros.116-203-100-189.sslip.io/" "$TEST_AUTH" "200"
check "teste / api health" "https://membros.116-203-100-189.sslip.io/api/health" "$TEST_AUTH" "200"

# Produção
check "producao / painel sem auth" "https://sistema.116-203-100-189.sslip.io/" "" "401"
check "producao / painel" "https://sistema.116-203-100-189.sslip.io/" "$PROD_AUTH" "200"
check "producao / app publico" "https://app-prod.116-203-100-189.sslip.io/" "" "200"
check "producao / membros sem auth" "https://membros-prod.116-203-100-189.sslip.io/" "" "401"
check "producao / membros" "https://membros-prod.116-203-100-189.sslip.io/" "$PROD_AUTH" "200"
check "producao / api health" "https://membros-prod.116-203-100-189.sslip.io/api/health" "$PROD_AUTH" "200"

if [ "$fail" -ne 0 ]; then
  echo "FALHOU: algum check nao retornou o esperado." >&2
  exit 1
fi

echo "OK: todos os checks passaram."
