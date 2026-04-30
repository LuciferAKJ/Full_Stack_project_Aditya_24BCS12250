package com.attendai.service;

import com.attendai.dto.StudentDTO;
import com.attendai.entity.Student;
import com.attendai.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;
    private final PythonServiceClient pythonClient;

    @Value("${face.data.path}")
    private String faceDataPath;

    public StudentService(StudentRepository studentRepository, PythonServiceClient pythonClient) {
        this.studentRepository = studentRepository;
        this.pythonClient = pythonClient;
    }

    public StudentDTO.Response registerStudent(StudentDTO.RegisterRequest request) {
        if (studentRepository.existsByUid(request.getUid())) {
            throw new IllegalArgumentException("Student UID already exists: " + request.getUid());
        }
        int nextLabel = studentRepository.findMaxFaceLabel().map(l -> l + 1).orElse(1);
        Student student = Student.builder()
                .uid(request.getUid()).name(request.getName())
                .className(request.getClassName()).faceLabel(nextLabel)
                .faceCount(0).faceTrained(false).build();
        student = studentRepository.save(student);
        log.info("Registered student: {} (UID: {}, Label: {})", student.getName(), student.getUid(), nextLabel);
        return toDto(student);
    }

    public List<StudentDTO.Response> getAllStudents(String className) {
        List<Student> students = (className != null && !className.isBlank())
                ? studentRepository.findByClassName(className)
                : studentRepository.findAll();
        return students.stream().map(this::toDto).collect(Collectors.toList());
    }

    public StudentDTO.Response getStudent(String uid) {
        Student s = studentRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + uid));
        return toDto(s);
    }

    public void deleteStudent(String uid) {
        Student s = studentRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + uid));
        Path dir = Paths.get(faceDataPath, "raw", uid);
        try { deleteDirectory(dir.toFile()); } catch (Exception ignored) {}
        studentRepository.delete(s);
        log.info("Deleted student: {}", uid);
    }

    public StudentDTO.Response uploadFaceImages(String uid, MultipartFile[] images) throws IOException {
        Student student = studentRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + uid));
        Path dir = Paths.get(faceDataPath, "raw", uid);
        Files.createDirectories(dir);
        int saved = 0;
        for (MultipartFile img : images) {
            if (img.isEmpty()) continue;
            String filename = "face_" + (student.getFaceCount() + saved + 1) + ".jpg";
            Files.copy(img.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            saved++;
        }
        student.setFaceCount(student.getFaceCount() + saved);
        student = studentRepository.save(student);
        if (student.getFaceCount() >= 10) {
            try {
                pythonClient.trainModel();
                student.setFaceTrained(true);
                studentRepository.save(student);
                log.info("Face model trained for: {}", student.getUid());
            } catch (Exception e) {
                log.warn("Python service unavailable — training skipped: {}", e.getMessage());
            }
        }
        return toDto(student);
    }

    private StudentDTO.Response toDto(Student s) {
        return StudentDTO.Response.builder()
                .id(s.getId()).uid(s.getUid()).name(s.getName())
                .className(s.getClassName()).faceCount(s.getFaceCount())
                .faceTrained(s.getFaceTrained()).faceLabel(s.getFaceLabel()).build();
    }

    private void deleteDirectory(File dir) {
        if (dir != null && dir.isDirectory()) {
            File[] children = dir.listFiles();
            if (children != null) for (File f : children) deleteDirectory(f);
        }
        if (dir != null) dir.delete();
    }
}
