@echo off
echo ========================================================
echo Starting StudySync Full-Stack Application
echo ========================================================
start "StudySync Backend (Flask :5000)" cmd /k "cd /d %~dp0backend && python run.py"
start "StudySync Frontend (Vite :5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both services launched in separate windows!
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:5173
pause
