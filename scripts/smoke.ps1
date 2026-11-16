param(
  [Parameter(Mandatory = $true)][string]$TestBasicAuth,
  [Parameter(Mandatory = $true)][string]$ProdBasicAuth
)

$script:fail = 0

function Check-Env {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Auth,
    [int]$Expected
  )

  if ($Auth) {
    $code = curl.exe -s -o NUL -w "%{http_code}" -u $Auth $Url
  }
  else {
    $code = curl.exe -s -o NUL -w "%{http_code}" $Url
  }

  "{0,-42} {1} (esperado {2})" -f $Name, $code, $Expected
  if ($code -ne $Expected) { $script:fail = 1 }
}

Check-Env "teste / painel sem auth" "https://shallom.116-203-100-189.sslip.io/" "" 401
Check-Env "teste / painel" "https://shallom.116-203-100-189.sslip.io/" $TestBasicAuth 200
Check-Env "teste / app publico" "https://app.116-203-100-189.sslip.io/" "" 200
Check-Env "teste / membros sem auth" "https://membros.116-203-100-189.sslip.io/" "" 401
Check-Env "teste / membros" "https://membros.116-203-100-189.sslip.io/" $TestBasicAuth 200
Check-Env "teste / api health" "https://membros.116-203-100-189.sslip.io/api/health" $TestBasicAuth 200

Check-Env "producao / painel sem auth" "https://sistema.116-203-100-189.sslip.io/" "" 401
Check-Env "producao / painel" "https://sistema.116-203-100-189.sslip.io/" $ProdBasicAuth 200
Check-Env "producao / app publico" "https://app-prod.116-203-100-189.sslip.io/" "" 200
Check-Env "producao / membros sem auth" "https://membros-prod.116-203-100-189.sslip.io/" "" 401
Check-Env "producao / membros" "https://membros-prod.116-203-100-189.sslip.io/" $ProdBasicAuth 200
Check-Env "producao / api health" "https://membros-prod.116-203-100-189.sslip.io/api/health" $ProdBasicAuth 200

if ($script:fail -ne 0) {
  Write-Error "FALHOU: algum check nao retornou o esperado."
  exit 1
}

Write-Host "OK: todos os checks passaram."
