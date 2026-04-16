@echo off
echo Instalando fondo COMPUTEC en Rainmeter...
echo.
echo Buscando carpeta de Rainmeter...

set "RAINMETER_PATH=%USERPROFILE%\Documents\Rainmeter\Skins\ComputecBackground"

echo Creando carpeta: %RAINMETER_PATH%
mkdir "%RAINMETER_PATH%" 2>nul

echo Copiando archivos...
copy "computec-background.html" "%RAINMETER_PATH%\" >nul
copy "ComputecBackground.ini" "%RAINMETER_PATH%\" >nul

if exist "%RAINMETER_PATH%\computec-background.html" (
    echo ¡Archivos copiados exitosamente!
    echo.
    echo AHORA:
    echo 1. Abre Rainmeter desde el menú Inicio
    echo 2. Haz clic derecho en el ícono de Rainmeter en la bandeja
    echo 3. Ve a Skins -> ComputecBackground -> ComputecBackground.ini
    echo 4. Selecciona "Load skin"
    echo.
    echo ¡Tu fondo COMPUTEC estará activo!
) else (
    echo Error al copiar archivos. Por favor copia manualmente:
    echo.
    echo Copia estos archivos a:
    echo %RAINMETER_PATH%
    echo - computec-background.html
    echo - ComputecBackground.ini
)

echo.
pause
