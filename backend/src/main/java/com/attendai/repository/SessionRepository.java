package com.attendai.repository;

import com.attendai.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByClassName(String className);
    List<AttendanceSession> findByDate(LocalDate date);
    List<AttendanceSession> findByClassNameAndDate(String className, LocalDate date);
    List<AttendanceSession> findByOrderByDateDescIdDesc();
}
