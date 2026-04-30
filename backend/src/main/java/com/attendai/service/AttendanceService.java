package com.attendai.service;

import com.attendai.dto.AttendanceDTO;
import com.attendai.entity.*;
import com.attendai.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final SessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final PythonServiceClient pythonClient;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             SessionRepository sessionRepository,
                             StudentRepository studentRepository,
                             PythonServiceClient pythonClient) {
        this.attendanceRepository = attendanceRepository;
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
        this.pythonClient = pythonClient;
    }

    public AttendanceDTO.RecognitionResult recognizeAndMark(Long sessionId, MultipartFile image) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        PythonServiceClient.RecognitionResponse rec;
        try {
            rec = pythonClient.recognize(image);
        } catch (Exception e) {
            log.warn("Python service unavailable: {}", e.getMessage());
            return AttendanceDTO.RecognitionResult.builder()
                    .type("unknown").message("Face recognition service unavailable").build();
        }

        if (!rec.isRecognized()) {
            return AttendanceDTO.RecognitionResult.builder()
                    .type("unknown").message("Face not recognized").build();
        }

        int targetLabel = rec.getLabel();
        Student student = studentRepository.findAll().stream()
                .filter(s -> s.getFaceLabel() != null && s.getFaceLabel() == targetLabel)
                .findFirst().orElse(null);

        if (student == null) {
            return AttendanceDTO.RecognitionResult.builder()
                    .type("unknown").message("No student matched label: " + targetLabel).build();
        }

        if (attendanceRepository.existsByStudentAndSession(student, session)) {
            return AttendanceDTO.RecognitionResult.builder()
                    .type("duplicate").name(student.getName()).uid(student.getUid())
                    .className(student.getClassName()).confidence(rec.getConfidence())
                    .message("Already marked for this session").build();
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .student(student).session(session)
                .timestamp(LocalDateTime.now()).confidenceScore(rec.getConfidence()).build();
        attendanceRepository.save(record);
        log.info("Marked present: {} ({}) in session {}", student.getName(), student.getUid(), sessionId);

        return AttendanceDTO.RecognitionResult.builder()
                .type("recognized").name(student.getName()).uid(student.getUid())
                .className(student.getClassName()).confidence(rec.getConfidence())
                .message("Attendance marked successfully").build();
    }

    public List<AttendanceDTO.RecordResponse> getRecords(String className, Long sessionId, String date) {
        LocalDate localDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : null;
        return attendanceRepository.findFiltered(
                        (className != null && !className.isBlank()) ? className : null,
                        sessionId, localDate)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public byte[] exportToExcel(String className, Long sessionId, String date) throws IOException {
        List<AttendanceDTO.RecordResponse> records = getRecords(className, sessionId, date);
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Attendance");
            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row header = sheet.createRow(0);
            String[] cols = {"#", "UID", "Student Name", "Class", "Session", "Date", "Time", "Confidence"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
            }
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("hh:mm a");
            int rowNum = 1;
            for (AttendanceDTO.RecordResponse r : records) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(r.getUid());
                row.createCell(2).setCellValue(r.getStudentName());
                row.createCell(3).setCellValue(r.getClassName());
                row.createCell(4).setCellValue(r.getSessionLabel());
                row.createCell(5).setCellValue(r.getDate() != null ? r.getDate().toString() : "");
                row.createCell(6).setCellValue(r.getTimestamp() != null ? r.getTimestamp().format(timeFmt) : "");
                row.createCell(7).setCellValue(r.getConfidenceScore() != null ? r.getConfidenceScore() : 0.0);
            }
            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    private AttendanceDTO.RecordResponse toDto(AttendanceRecord r) {
        String sessionLabel = r.getSession().getClassName() + " — " + r.getSession().getTimeSlot();
        return AttendanceDTO.RecordResponse.builder()
                .id(r.getId()).uid(r.getStudent().getUid()).studentName(r.getStudent().getName())
                .className(r.getStudent().getClassName()).sessionId(r.getSession().getId())
                .sessionLabel(sessionLabel).date(r.getSession().getDate())
                .timestamp(r.getTimestamp()).confidenceScore(r.getConfidenceScore()).build();
    }
}
