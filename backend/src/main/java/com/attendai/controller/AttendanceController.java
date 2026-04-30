package com.attendai.controller;

import com.attendai.dto.AttendanceDTO;
import com.attendai.service.AttendanceService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    public AttendanceController(AttendanceService attendanceService) { this.attendanceService = attendanceService; }

    @GetMapping
    public ResponseEntity<List<AttendanceDTO.RecordResponse>> getRecords(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(attendanceService.getRecords(className, sessionId, date));
    }

    @PostMapping("/recognize/{sessionId}")
    public ResponseEntity<AttendanceDTO.RecognitionResult> recognize(
            @PathVariable Long sessionId,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(attendanceService.recognizeAndMark(sessionId, image));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String date) throws IOException {
        byte[] excelBytes = attendanceService.exportToExcel(className, sessionId, date);
        String filename = "attendance_" +
                (className != null ? className + "_" : "") +
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        return ResponseEntity.ok().headers(headers).body(excelBytes);
    }
}
