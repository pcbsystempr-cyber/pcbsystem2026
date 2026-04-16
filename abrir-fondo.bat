@echo off
echo Abriendo fondo animado COMPUTEC...
echo.
echo Presiona F11 para pantalla completa
echo Presiona ALT+F4 para cerrar
echo.
timeout /t 3 /nobreak >nul

start "" "chrome.exe" --kiosk "%~dp0computec-background.html"

if errorlevel 1 (
    echo Chrome no encontrado, intentando con Microsoft Edge...
    start "" "msedge.exe" --kiosk "%~dp0computec-background.html"
)

if errorlevel 1 (
    echo Navegadores no encontrados, abriendo con navegador por defecto...
    start "" "%~dp0computec-background.html"
    echo Por favor presiona F11 manualmente para pantalla completa
)
