package com.attendai.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "time_slot", nullable = false)
    private String timeSlot;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    public enum Status { ACTIVE, COMPLETED, CANCELLED }

    public AttendanceSession() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String className; private String timeSlot;
        private LocalDate date; private User createdBy; private Status status = Status.ACTIVE;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder className(String cn) { this.className = cn; return this; }
        public Builder timeSlot(String ts) { this.timeSlot = ts; return this; }
        public Builder date(LocalDate d) { this.date = d; return this; }
        public Builder createdBy(User u) { this.createdBy = u; return this; }
        public Builder status(Status s) { this.status = s; return this; }
        public AttendanceSession build() {
            AttendanceSession s = new AttendanceSession();
            s.id = id; s.className = className; s.timeSlot = timeSlot;
            s.date = date; s.createdBy = createdBy; s.status = status;
            return s;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
