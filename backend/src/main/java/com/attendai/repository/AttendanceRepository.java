package com.attendai.repository;

import com.attendai.entity.AttendanceRecord;
import com.attendai.entity.AttendanceSession;
import com.attendai.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    boolean existsByStudentAndSession(Student student, AttendanceSession session);

    Optional<AttendanceRecord> findByStudentAndSession(Student student, AttendanceSession session);

    List<AttendanceRecord> findBySession(AttendanceSession session);

    @Query("SELECT r FROM AttendanceRecord r " +
           "JOIN FETCH r.student s JOIN FETCH r.session sess " +
           "WHERE (:className IS NULL OR s.className = :className) " +
           "AND (:sessionId IS NULL OR sess.id = :sessionId) " +
           "AND (:date IS NULL OR sess.date = :date) " +
           "ORDER BY r.timestamp DESC")
    List<AttendanceRecord> findFiltered(
        @Param("className") String className,
        @Param("sessionId") Long sessionId,
        @Param("date") LocalDate date
    );
}
