@echo off
REM Outlook Mail Merge launcher for Windows: sets up a venv on first run,
REM starts the OAuth2 SMTP proxy in its own window, then starts the app.
cd /d "%~dp0"

if not exist .venv (
    echo First run: creating virtual environment...
    python -m venv .venv || (echo Python not found. Install Python 3.10+ from python.org and tick "Add to PATH". & pause & exit /b 1)
    .venv\Scripts\python -m pip install -r requirements.txt || (pause & exit /b 1)
)

if not exist emailproxy.config (
    echo.
    echo Missing emailproxy.config. Copy emailproxy.config.example to emailproxy.config
    echo and replace YOUR_LMU_EMAIL@lmu.edu with your address ^(also set it in lib\config.py^).
    pause
    exit /b 1
)

start "emailproxy" .venv\Scripts\python -m emailproxy --config-file emailproxy.config --no-gui --local-server-auth
timeout /t 2 /nobreak >nul
start "" http://localhost:5000
.venv\Scripts\python app.py
