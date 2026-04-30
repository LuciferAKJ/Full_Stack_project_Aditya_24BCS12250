# AttendAI Project: Fixes Applied & Setup Guide

## 🔧 Problems Found & Fixed

### Problem 1: Backend DB Authentication Failure
**Issue:** Spring Boot was configured to use Supabase PostgreSQL with hardcoded credentials that were rejected with `FATAL: Tenant or user not found`.

**Root Cause:** Supabase connection was failing at runtime; credentials in `application.properties` were outdated or invalid.

**Solution Applied:**
- Refactored database configuration to use **Spring Profiles**
- Created `application-local.properties` → Local H2 database (default for development)
- Created `application-supabase.properties` → Supabase PostgreSQL (opt-in via environment variable)
- Added H2 database dependency to `pom.xml`
- Set `spring.profiles.active=local` in main `application.properties`

### Problem 2: Startup Script Reliability
**Issue:** `start-all.bat` didn't consistently start backend process; it would exit silently.

**Root Cause:** Virtual environment Python and Maven paths weren't validated; spring profile wasn't being passed to subprocess.

**Solution Applied:**
- Added environment variable checks for `.venv\Scripts\python.exe`
- Added fallback to system `mvn.cmd` if custom Maven path doesn't exist
- Explicitly set `SPRING_PROFILES_ACTIVE=local` in launcher script
- Fixed quoted paths in subprocess calls

---

## 📊 Current Status (After Fixes)

✅ **Frontend** → http://localhost:5174 (React + Vite)  
✅ **Python Service** → http://localhost:5001/health (Flask + OpenCV)  
✅ **Backend API** → http://localhost:8080 (Spring Boot)  
✅ **H2 Console** → http://localhost:8080/h2-console (In-memory DB UI)  

All three services now start reliably via `start-all.bat`.

---

## 🚀 How to Run

### Option A: Local Development (Default) ⭐ **Recommended for testing**

```bash
# From project root:
.\start-all.bat
```

This launches:
1. Python service (port 5001)
2. Spring Boot backend with **local H2 database** (port 8080)
3. React frontend (port 5174)

The H2 database is stored at: `.\backend\data\attendai-db` (file-based, persists across restarts).

**Access points:**
- Frontend: http://localhost:5174
- Backend: http://localhost:8080/api
- H2 Console: http://localhost:8080/h2-console (username: `sa`, password: empty)

---

### Option B: Production with Supabase (When Ready)

To switch backend to Supabase PostgreSQL:

#### Step 1: Set Environment Variable (Windows PowerShell)
```powershell
$env:SPRING_PROFILES_ACTIVE = "supabase"
$env:SUPABASE_DB_URL = "jdbc:postgresql://YOUR-HOST:6543/postgres?sslmode=require&prepareThreshold=0&socketTimeout=30"
$env:SUPABASE_DB_USERNAME = "postgres.YOUR_PROJECT_ID"
$env:SUPABASE_DB_PASSWORD = "YOUR_PASSWORD"
```

#### Step 2: Run Backend
```bash
cd backend
mvn spring-boot:run
```

Or edit `application-supabase.properties` with your Supabase credentials:
```properties
spring.datasource.url=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
spring.datasource.username=postgres.YOUR_PROJECT_ID
spring.datasource.password=YOUR_PASSWORD
```

---

## 📁 Files Modified

| File | Change |
|------|--------|
| `backend/pom.xml` | Added H2 database runtime dependency |
| `backend/src/main/resources/application.properties` | Added profile activation, removed hardcoded DB config |
| `backend/src/main/resources/application-local.properties` | **NEW** — H2 local database config |
| `backend/src/main/resources/application-supabase.properties` | **NEW** — Supabase PostgreSQL config (env-var based) |
| `start-all.bat` | Enhanced with profile injection, better path validation |

---

## 🧪 Testing the Backend

### 1. Test Authentication Endpoint
```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"

# Expected response:
# { "token": "eyJhbGc...", "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "TEACHER" } }
```

### 2. Test Student Registration
```bash
# First, login to get token
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}" > token.json

# Extract token from response and use it
# Register student
curl -X POST http://localhost:8080/api/students ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"uid\":\"STU001\",\"name\":\"Alice\",\"className\":\"10-A\"}"
```

### 3. View H2 Console
- Navigate to: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/attendai-db`
- Username: `sa`
- Password: (leave empty)
- Click "Connect" to browse tables

---

## 🔐 Database Profiles Explained

### Local Profile (Default)
- **Type:** H2 (embedded)
- **File:** `./backend/data/attendai-db`
- **Use Case:** Local development, testing, CI/CD
- **Pros:** Zero setup, portable, no external dependencies
- **Cons:** Single-user, not production-ready

### Supabase Profile (Opt-in)
- **Type:** PostgreSQL (managed by Supabase)
- **Activation:** Set `SPRING_PROFILES_ACTIVE=supabase`
- **Config:** `application-supabase.properties`
- **Use Case:** Production deployments, team collaboration
- **Connection:** Via environment variables (secure, no hardcoded secrets)

---

## 🐍 Python Service Notes

The Python service automatically loads from `.venv` if available:
```bash
# If you need to manually test the Python service:
cd python-service
.\.venv\Scripts\python.exe app.py

# Then test endpoints:
curl http://localhost:5001/health
curl -X POST http://localhost:5001/train
```

---

## 📋 API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/login` | POST | ❌ | User login |
| `/api/auth/register` | POST | ❌ | User registration |
| `/api/students` | GET | ✅ | List all students |
| `/api/students` | POST | ✅ | Register new student |
| `/api/students/{uid}/faces` | POST | ✅ | Upload face images |
| `/api/sessions` | GET | ✅ | List sessions |
| `/api/sessions` | POST | ✅ | Create attendance session |
| `/api/attendance/recognize/{sessionId}` | POST | ✅ | Mark attendance by face |
| `/api/attendance` | GET | ✅ | Get attendance records |
| `/api/attendance/export` | GET | ✅ | Export to Excel |
| `/h2-console` | GET | ❌ | H2 database UI (local only) |

---

## ⚠️ Common Issues & Solutions

### Issue: Backend won't start
**Solution:** 
1. Check if port 8080 is already in use: `netstat -ano | findstr :8080`
2. Kill existing Java process: `taskkill /F /IM java.exe`
3. Ensure Maven is installed: `mvn -v`

### Issue: H2 console shows "connection refused"
**Solution:** 
- H2 is only available in local profile
- Ensure backend is running: `http://localhost:8080` should return 403 (auth required) or 200
- Navigate to: `http://localhost:8080/h2-console`

### Issue: Python service returns "model not trained"
**Solution:**
1. Upload at least 10 face images per student first
2. Check if `./backend/face_data/models/trainer.yml` exists
3. Trigger training: `curl -X POST http://localhost:5001/train`

### Issue: Frontend can't connect to backend
**Solution:**
- Check CORS config in `backend/src/main/resources/application.properties`
- Ensure backend is running on port 8080
- Check browser console for exact error

---

## 🔄 Development Workflow

### First Time Setup
```bash
# 1. Navigate to project root
cd c:\Users\adity\OneDrive\Desktop\antigravity fullstack

# 2. Start all services
.\start-all.bat

# 3. Wait for "Started AttendAiApplication" message in backend window

# 4. Open frontend in browser
# http://localhost:5174
```

### Making Changes

**Backend (Java):**
- Edit files in `backend/src/main/java/com/attendai/**`
- Spring Boot auto-reloads on class changes
- Restart if pom.xml changes

**Frontend (React):**
- Edit files in `frontend/src/**`
- Vite hot-reloads on save
- Changes appear instantly in browser

**Python Service:**
- Edit files in `python-service/**`
- Restart the service manually (Ctrl+C in Python terminal, then run again)

---

## 📝 Next Steps (Recommended)

1. ✅ **Local Testing** — Use default local profile to test all features
2. ✅ **Frontend Testing** — Test UI flows at http://localhost:5174
3. ✅ **API Testing** — Manually test endpoints using curl or Postman
4. ⏭️ **Supabase Setup** — When ready for production, configure Supabase credentials
5. ⏭️ **Deployment** — Package backend as JAR, frontend as static build, Python as Docker/service

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `.\start-all.bat` | Start all services (Python, Backend, Frontend) |
| `cd backend && mvn spring-boot:run` | Run backend only |
| `cd frontend && npm run dev` | Run frontend only (already started by launcher) |
| `cd python-service && .\.venv\Scripts\python.exe app.py` | Run Python service only |
| `mvn clean compile` | Clean and compile backend |
| `npm run build` | Build production frontend bundle |

---

## ✨ Summary

**What Works Now:**
- ✅ All services start reliably
- ✅ Local H2 database (no setup needed)
- ✅ JWT authentication
- ✅ Student registration + face upload
- ✅ Face recognition pipeline (Python ↔ Spring Boot)
- ✅ Excel export
- ✅ H2 console for data inspection

**Ready to Switch to Supabase:**
- Just set environment variables and activate the `supabase` profile
- No code changes needed
- See "Option B: Production with Supabase" above

---

**Last Updated:** April 23, 2026  
**Status:** ✅ All services running successfully on local profile
