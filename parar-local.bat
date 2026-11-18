@echo off
title IBSCN - Encerrar ambiente local

echo Encerrando servidores locais (portas 3001 e 8080)...
for %%P in (3001 8080) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    taskkill /PID %%A /F >nul 2>&1
  )
)

echo.
echo Servidores encerrados.
timeout /t 2 >nul
