@echo off
echo ========================================================
echo Starting StudySync Flask Backend (Port 5000)...
echo ========================================================
cd /d "%~dp0"
python run.py
if errorlevel 1 (
    echo Python failed with standard command, attempting with local launcher...
    py run.py
)
pause
