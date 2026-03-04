@echo off
echo Installing Backend Dependencies...
pip install -r requirements.txt

echo Starting Python API Backend...
start cmd /k "python server.py"

echo Installing Frontend Dependencies...
cd frontend
call npm install

echo Starting React Frontend...
start cmd /k "npm run dev"

echo.
echo Both servers are starting!
echo The API runs on http://localhost:8000
echo The Frontend will open in your browser shortly.
pause
