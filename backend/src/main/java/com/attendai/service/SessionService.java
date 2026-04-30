package com.attendai.service;

import com.attendai.dto.SessionDTO;
import com.attendai.entity.*;
import com.attendai.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, StudentRepository studentRepository,
                          AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    public SessionDTO.Response createSession(SessionDTO.CreateRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElse(null);
        AttendanceSession session = AttendanceSession.builder()
                .className(request.getClassName()).timeSlot(request.getTimeSlot())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .createdBy(creator).status(AttendanceSession.Status.ACTIVE).build();
        session = sessionRepository.save(session);
        return toDto(session);
    }

    public List<SessionDTO.Response> getAllSessions(String className) {
        List<AttendanceSession> sessions = (className != null && !className.isBlank())
                ? sessionRepository.findByClassName(className)
                : sessionRepository.findByOrderByDateDescIdDesc();
        return sessions.stream().map(this::toDto).collect(Collectors.toList());
    }

    public SessionDTO.Response getSession(Long id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + id));
        return toDto(session);
    }

    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) throw new IllegalArgumentException("Session not found: " + id);
        sessionRepository.deleteById(id);
    }

    private SessionDTO.Response toDto(AttendanceSession s) {
        int presentCount = attendanceRepository.findBySession(s).size();
        int totalStudents = studentRepository.findByClassName(s.getClassName()).size();
        return SessionDTO.Response.builder()
                .id(s.getId()).className(s.getClassName()).timeSlot(s.getTimeSlot())
                .date(s.getDate()).status(s.getStatus().name())
                .createdBy(s.getCreatedBy() != null ? s.getCreatedBy().getName() : "Unknown")
                .presentCount(presentCount).totalStudents(totalStudents).build();
    }
}
