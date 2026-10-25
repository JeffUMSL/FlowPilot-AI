@echo off
cd /d "%~dp0"
echo === JavaScript demo calculations ===
call npm run check:demo
if errorlevel 1 echo JavaScript tests failed. && exit /b 1
echo.
echo === Python finance and agent tests ===
cd backend
python -m unittest discover -s tests -v
if errorlevel 1 echo Python tests failed. && exit /b 1
echo.
echo All automated demo tests passed.
pause
