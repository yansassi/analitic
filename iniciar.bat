@echo off
title Iniciando o sistema...

REM ==========================================
REM Garante que o script rode na pasta atual
REM ==========================================
cd /d "%~dp0"

echo ===========================================
echo Instalando dependencias...
echo ===========================================
call npm install
if errorlevel 1 (
    echo Erro ao instalar dependencias!
    pause
    exit /b
)

echo.
echo ===========================================
echo Construindo o projeto...
echo ===========================================
call npm run build
if errorlevel 1 (
    echo Erro ao construir o projeto!
    pause
    exit /b
)

echo.
echo ===========================================
echo Iniciando o servidor de desenvolvimento...
echo ===========================================
start "" http://localhost:5173

echo Servidor em execucao. Pressione CTRL+C para parar.
echo ===========================================
call npm run dev

pause
