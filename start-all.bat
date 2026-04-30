@echo off
setlocal

set "ROOT=%~dp0"
set "MAVEN=%USERPROFILE%\maven\apache-maven-3.9.15\bin"
set "SPRING_PROFILES_ACTIVE=local"

if exist "%ROOT%.venv\Scripts\python.exe" (
	set "PYTHON_EXE=%ROOT%.venv\Scripts\python.exe"
) else (
	set "PYTHON_EXE=python"
)

if exist "%MAVEN%\mvn.cmd" (
	set "MVN_CMD=%MAVEN%\mvn.cmd"
) else (
	set "MVN_CMD=mvn.cmd"
)

echo.
echo  ============================================
echo   AttendAI - Face Recognition Attendance
echo  ============================================
echo.

:: 1. Python Service (port 5001)
echo  [1/3] Starting Python Face Recognition Service...
start "Python Service - Port 5001" cmd /k "cd /d ""%ROOT%python-service"" && ""%PYTHON_EXE%"" app.py"
timeout /t 3 /nobreak >nul

:: 2. Spring Boot Backend (port 8080)
echo  [2/3] Starting Spring Boot Backend...
start "Spring Boot - Port 8080" cmd /k "set ""SPRING_PROFILES_ACTIVE=%SPRING_PROFILES_ACTIVE%"" && cd /d ""%ROOT%backend"" && ""%MVN_CMD%"" spring-boot:run"
echo      Waiting 20s for Spring Boot to initialize...
timeout /t 20 /nobreak >nul

:: 3. React Frontend (port 5174)
echo  [3/3] Starting React Frontend...
start "React Frontend - Port 5174" cmd /k "cd /d ""%ROOT%frontend"" && npm run dev -- --port 5174"

echo.
echo  ============================================
echo   All services started!
echo.
echo   Frontend :  http://localhost:5174
echo   Backend  :  http://localhost:8080
echo   Python   :  http://localhost:5001/health
echo   H2 DB    :  http://localhost:8080/h2-console
echo  ============================================
echo.
echo  Note: Spring Boot takes ~15 seconds to fully start.
echo  Wait for "Started AttendAiApplication" before using.
echo.
pause
