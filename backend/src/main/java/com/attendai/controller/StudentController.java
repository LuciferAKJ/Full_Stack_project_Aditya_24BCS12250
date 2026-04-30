package com.attendai.controller;

import com.attendai.dto.StudentDTO;
import com.attendai.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    public StudentController(StudentService studentService) { this.studentService = studentService; }

    @GetMapping
    public ResponseEntity<List<StudentDTO.Response>> getAll(@RequestParam(required = false) String className) {
        return ResponseEntity.ok(studentService.getAllStudents(className));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<StudentDTO.Response> getByUid(@PathVariable String uid) {
        return ResponseEntity.ok(studentService.getStudent(uid));
    }

    @PostMapping
    public ResponseEntity<StudentDTO.Response> register(@Valid @RequestBody StudentDTO.RegisterRequest request) {
        return ResponseEntity.ok(studentService.registerStudent(request));
    }

    @PostMapping("/{uid}/faces")
    public ResponseEntity<StudentDTO.Response> uploadFaces(
            @PathVariable String uid,
            @RequestParam("images") MultipartFile[] images) throws IOException {
        return ResponseEntity.ok(studentService.uploadFaceImages(uid, images));
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> delete(@PathVariable String uid) {
        studentService.deleteStudent(uid);
        return ResponseEntity.noContent().build();
    }
}
