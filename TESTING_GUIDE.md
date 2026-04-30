# AttendAI: End-to-End Testing Guide

## Prerequisites
- All services running: `.\start-all.bat`
- Backend ready: See "Started AttendAiApplication" in backend console
- Frontend loaded: http://localhost:5174
- H2 Console available: http://localhost:8080/h2-console

---

## Test Flow 1: User Registration & Login

### Step 1A: Register via REST API (Postman/curl)

**Endpoint:** `POST http://localhost:8080/api/auth/register`

**Request Body:**
```json
{
  "name": "Ms. Priya Singh",
  "email": "priya@school.com",
  "password": "SecurePass@2026"
}
```

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Ms. Priya Singh",
    "email": "priya@school.com",
    "role": "TEACHER"
  }
}
```

**Save the token** for next requests.

---

### Step 1B: Login via Frontend (Browser)

1. Open http://localhost:5174
2. Click "Login" on landing page
3. Enter email: `priya@school.com`
4. Enter password: `SecurePass@2026`
5. Expected: Redirects to Dashboard
6. Open Browser DevTools → Application → Local Storage
7. Verify `attendai_token` and `attendai_user` are saved

---

## Test Flow 2: Student Registration & Face Upload

### Step 2A: Register Student via API

**Endpoint:** `POST http://localhost:8080/api/students`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "uid": "STU2024001",
  "name": "Aarav Patel",
  "className": "10-A"
}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "uid": "STU2024001",
  "name": "Aarav Patel",
  "className": "10-A",
  "faceLabel": 1,
  "faceCount": 0,
  "faceTrained": false
}
```

**Note:** `faceLabel=1` is auto-assigned. Each student gets unique label.

---

### Step 2B: Get All Students

**Endpoint:** `GET http://localhost:8080/api/students`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "uid": "STU2024001",
    "name": "Aarav Patel",
    "className": "10-A",
    "faceLabel": 1,
    "faceCount": 0,
    "faceTrained": false
  }
]
```

---

### Step 2C: Upload Face Images

**Endpoint:** `POST http://localhost:8080/api/students/{uid}/faces`

**URL:** `http://localhost:8080/api/students/STU2024001/faces`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
(Content-Type: multipart/form-data is auto-set by form submission)
```

**Body:** Form-data with key `images` = [image1.jpg, image2.jpg, ... image10.jpg]

**Using curl:**
```bash
curl -X POST "http://localhost:8080/api/students/STU2024001/faces" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@face1.jpg" \
  -F "images=@face2.jpg" \
  -F "images=@face3.jpg" \
  ... (upload 10 images minimum)
```

**After 10+ images:**
- Backend automatically calls Python `/train` endpoint
- Student's `faceTrained` field becomes `true`
- Model file appears at: `.\backend\face_data\models\trainer.yml`

---

## Test Flow 3: Attendance Session & Marking

### Step 3A: Create Attendance Session

**Endpoint:** `POST http://localhost:8080/api/sessions`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "className": "10-A",
  "timeSlot": "9:00 AM - 10:00 AM",
  "date": "2026-04-23"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "className": "10-A",
  "timeSlot": "9:00 AM - 10:00 AM",
  "date": "2026-04-23",
  "createdBy": "Ms. Priya Singh",
  "status": "ACTIVE"
}
```

**Save `id: 1` for next requests.**

---

### Step 3B: Get All Sessions

**Endpoint:** `GET http://localhost:8080/api/sessions`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response:** Array of all sessions.

---

### Step 3C: Mark Attendance by Face

**Endpoint:** `POST http://localhost:8080/api/attendance/recognize/{sessionId}`

**URL:** `http://localhost:8080/api/attendance/recognize/1`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
(Content-Type: multipart/form-data is auto-set)
```

**Body:** Form-data with key `image` = [student_face.jpg]

**Using curl:**
```bash
curl -X POST "http://localhost:8080/api/attendance/recognize/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@student_face.jpg"
```

**Possible Responses:**

**Case 1: Face Recognized & Marked**
```json
{
  "type": "recognized",
  "uid": "STU2024001",
  "name": "Aarav Patel",
  "className": "10-A",
  "confidence": 65.5,
  "message": "Attendance marked successfully"
}
```

**Case 2: Already Marked (Duplicate)**
```json
{
  "type": "duplicate",
  "uid": "STU2024001",
  "name": "Aarav Patel",
  "className": "10-A",
  "confidence": 68.2,
  "message": "Already marked for this session"
}
```

**Case 3: Face Not Recognized**
```json
{
  "type": "unknown",
  "message": "Face not recognized"
}
```

---

## Test Flow 4: Attendance Reporting

### Step 4A: Get Attendance Records

**Endpoint:** `GET http://localhost:8080/api/attendance`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Query Parameters (optional):**
- `className=10-A` — Filter by class
- `sessionId=1` — Filter by session
- `date=2026-04-23` — Filter by date

**Example URL:**
```
http://localhost:8080/api/attendance?className=10-A&date=2026-04-23
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "uid": "STU2024001",
    "studentName": "Aarav Patel",
    "className": "10-A",
    "sessionId": 1,
    "sessionLabel": "10-A — 9:00 AM - 10:00 AM",
    "date": "2026-04-23",
    "timestamp": "2026-04-23T09:15:30",
    "confidenceScore": 65.5
  }
]
```

---

### Step 4B: Export to Excel

**Endpoint:** `GET http://localhost:8080/api/attendance/export`

**Headers:**
```
Authorization: Bearer <YOUR_TOKEN>
```

**Query Parameters (optional):**
- `className=10-A`
- `sessionId=1`
- `date=2026-04-23`

**Example:**
```bash
curl -X GET "http://localhost:8080/api/attendance/export?className=10-A&date=2026-04-23" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output attendance_report.xlsx
```

**File:** `attendance_report.xlsx` with columns:
- # (Row number)
- UID
- Student Name
- Class
- Session
- Date
- Time
- Confidence

---

## Test Flow 5: Database Inspection (H2 Console)

### Step 5A: Open H2 Console

1. Navigate to: http://localhost:8080/h2-console
2. Default credentials:
   - JDBC URL: `jdbc:h2:file:./data/attendai-db`
   - Username: `sa`
   - Password: (empty)
3. Click "Connect"

### Step 5B: Inspect Tables

**Run these SQL queries:**

```sql
-- View all users
SELECT * FROM users;

-- View all students
SELECT * FROM students;

-- View all attendance sessions
SELECT * FROM attendance_sessions;

-- View all attendance records
SELECT * FROM attendance_records;

-- Count attendance by class
SELECT student_class, COUNT(*) as count FROM attendance_records 
GROUP BY student_class;
```

---

## Test Flow 6: Frontend UI Testing

### Step 6A: Dashboard Page
1. After login, verify dashboard shows:
   - Welcome message
   - Quick stats (students, sessions, today's attendance)
   - Navigation menu

### Step 6B: Students Page
1. Click "Students" in sidebar
2. Should see registered students in table
3. Try filter by class
4. Click on a student to view details

### Step 6C: Sessions Page
1. Click "Sessions" in sidebar
2. Should see all sessions
3. Click "Create Session" to add new session

### Step 6D: Attendance Page
1. Click "Attendance" in sidebar
2. Should see attendance records in table
3. Use filters: class, date range
4. Try "Export to Excel" button

### Step 6E: Camera Attendance (Face Recognition Live)
1. Click "Start Attendance" for a session
2. Browser requests camera access → Grant permission
3. Click "Open Camera" → Webcam feed appears
4. The frontend continuously sends frames to backend
5. When face recognized:
   - Green highlight + student name displayed
   - Attendance automatically marked
   - Feedback toast shown (success/duplicate/unknown)

---

## Data Validation Checklist

| Check | Expected Result | Status |
|-------|-----------------|--------|
| User registration creates user in DB | ✓ Can query `SELECT * FROM users` | ⬜ |
| Each student gets unique face label | ✓ Labels are 1, 2, 3... | ⬜ |
| 10 face images trigger training | ✓ Model file created | ⬜ |
| Attendance prevented duplicate per session | ✓ Only 1 record per student+session | ⬜ |
| Excel export has correct data | ✓ All attendance records exported | ⬜ |
| JWT token expires correctly | ✓ 401 after 24 hours | ⬜ |
| CORS allows frontend requests | ✓ No browser CORS errors | ⬜ |

---

## Performance Benchmarks (Target)

| Operation | Expected Time | Actual Time |
|-----------|----------------|------------|
| User login | < 500ms | ___ |
| Student registration | < 200ms | ___ |
| Face recognition (single frame) | < 1000ms | ___ |
| Attendance report query (100 records) | < 500ms | ___ |
| Excel export (1000 records) | < 2000ms | ___ |

---

## Troubleshooting During Testing

| Problem | Solution |
|---------|----------|
| 401 Unauthorized on API call | Token expired or not included in header; re-login |
| Face recognition returns "unknown" | Model not trained yet; upload 10+ face images first |
| CORS error in browser | Backend is running; check `cors.allowed-origins` in config |
| 500 error on attendance mark | Check Python service is running; verify face data directory exists |
| H2 console won't connect | Ensure backend is running; try refreshing page |
| Excel export is empty | Check filters; attendance records might not exist for those criteria |

---

## After Testing: Checklist for Production

- [ ] Supabase database configured and tested
- [ ] Environment variables set for secrets (no hardcoded credentials)
- [ ] JWT secret changed to secure random value
- [ ] CORS origins restricted to production frontend domain
- [ ] Rate limiting added to auth endpoints
- [ ] Error messages sanitized (no internal stack traces)
- [ ] Logging configured for audit trail
- [ ] Database backups configured
- [ ] SSL/TLS enabled on backend
- [ ] Frontend build optimized (`npm run build`)

---

**Total Expected Test Time:** ~30 minutes for complete workflow validation
