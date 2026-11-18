@echo off
title IBSCN - Iniciar ambiente local
cd /d "%~dp0"

echo Iniciando API na porta 3001...
start "IBSCN API (3001)" cmd /k "cd /d "%~dp0banco-de-dados\ibscn-api" && set PORT=3001 && node dist\src\main.js"

timeout /t 4 >nul

echo Iniciando servidor web na porta 8080...
start "IBSCN Web (8080)" cmd /k "node "%~dp0servidor-local.js""

timeout /t 2 >nul

start "" "http://localhost:8080"

echo.
echo ============================================
echo  Sistema no ar: http://localhost:8080
echo  Login: admin@nextep.com / admin123
echo.
echo  Para encerrar: feche as duas janelas
echo  abertas (API e Web) ou rode parar-local.bat
echo ============================================
pause
