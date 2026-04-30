package com.attendai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "attendance_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "session_id"})
)
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    public AttendanceRecord() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private Student student; private AttendanceSession session;
        private LocalDateTime timestamp; private Double confidenceScore;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder student(Student s) { this.student = s; return this; }
        public Builder session(AttendanceSession s) { this.session = s; return this; }
        public Builder timestamp(LocalDateTime t) { this.timestamp = t; return this; }
        public Builder confidenceScore(Double c) { this.confidenceScore = c; return this; }
        public AttendanceRecord build() {
            AttendanceRecord r = new AttendanceRecord();
            r.id = id; r.student = student; r.session = session;
            r.timestamp = timestamp; r.confidenceScore = confidenceScore;
            return r;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
}
