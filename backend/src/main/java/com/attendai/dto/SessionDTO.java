package com.attendai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class SessionDTO {

    public static class CreateRequest {
        @NotBlank private String className;
        @NotBlank private String timeSlot;
        @NotNull  private LocalDate date;

        public String getClassName() { return className; } public void setClassName(String c) { this.className = c; }
        public String getTimeSlot() { return timeSlot; } public void setTimeSlot(String t) { this.timeSlot = t; }
        public LocalDate getDate() { return date; } public void setDate(LocalDate d) { this.date = d; }
    }

    public static class Response {
        private Long id; private String className; private String timeSlot;
        private LocalDate date; private String status; private String createdBy;
        private int presentCount; private int totalStudents;

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private Long id; private String className; private String timeSlot;
            private LocalDate date; private String status; private String createdBy;
            private int presentCount; private int totalStudents;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder className(String cn) { this.className = cn; return this; }
            public Builder timeSlot(String ts) { this.timeSlot = ts; return this; }
            public Builder date(LocalDate d) { this.date = d; return this; }
            public Builder status(String s) { this.status = s; return this; }
            public Builder createdBy(String c) { this.createdBy = c; return this; }
            public Builder presentCount(int pc) { this.presentCount = pc; return this; }
            public Builder totalStudents(int ts) { this.totalStudents = ts; return this; }
            public Response build() {
                Response r = new Response();
                r.id = id; r.className = className; r.timeSlot = timeSlot;
                r.date = date; r.status = status; r.createdBy = createdBy;
                r.presentCount = presentCount; r.totalStudents = totalStudents;
                return r;
            }
        }

        public Long getId() { return id; }
        public String getClassName() { return className; }
        public String getTimeSlot() { return timeSlot; }
        public LocalDate getDate() { return date; }
        public String getStatus() { return status; }
        public String getCreatedBy() { return createdBy; }
        public int getPresentCount() { return presentCount; }
        public int getTotalStudents() { return totalStudents; }
    }
}
