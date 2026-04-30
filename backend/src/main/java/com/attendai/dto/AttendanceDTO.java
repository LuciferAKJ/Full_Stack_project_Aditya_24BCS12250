package com.attendai.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceDTO {

    public static class RecordResponse {
        private Long id; private String uid; private String studentName;
        private String className; private Long sessionId; private String sessionLabel;
        private LocalDate date; private LocalDateTime timestamp; private Double confidenceScore;

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private Long id; private String uid; private String studentName;
            private String className; private Long sessionId; private String sessionLabel;
            private LocalDate date; private LocalDateTime timestamp; private Double confidenceScore;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder uid(String uid) { this.uid = uid; return this; }
            public Builder studentName(String sn) { this.studentName = sn; return this; }
            public Builder className(String cn) { this.className = cn; return this; }
            public Builder sessionId(Long sid) { this.sessionId = sid; return this; }
            public Builder sessionLabel(String sl) { this.sessionLabel = sl; return this; }
            public Builder date(LocalDate d) { this.date = d; return this; }
            public Builder timestamp(LocalDateTime ts) { this.timestamp = ts; return this; }
            public Builder confidenceScore(Double cs) { this.confidenceScore = cs; return this; }
            public RecordResponse build() {
                RecordResponse r = new RecordResponse();
                r.id = id; r.uid = uid; r.studentName = studentName; r.className = className;
                r.sessionId = sessionId; r.sessionLabel = sessionLabel;
                r.date = date; r.timestamp = timestamp; r.confidenceScore = confidenceScore;
                return r;
            }
        }

        public Long getId() { return id; }
        public String getUid() { return uid; }
        public String getStudentName() { return studentName; }
        public String getClassName() { return className; }
        public Long getSessionId() { return sessionId; }
        public String getSessionLabel() { return sessionLabel; }
        public LocalDate getDate() { return date; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public Double getConfidenceScore() { return confidenceScore; }
    }

    public static class RecognitionResult {
        private String type; private String name; private String uid;
        private String className; private Double confidence; private String message;

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String type; private String name; private String uid;
            private String className; private Double confidence; private String message;

            public Builder type(String t) { this.type = t; return this; }
            public Builder name(String n) { this.name = n; return this; }
            public Builder uid(String u) { this.uid = u; return this; }
            public Builder className(String c) { this.className = c; return this; }
            public Builder confidence(Double c) { this.confidence = c; return this; }
            public Builder message(String m) { this.message = m; return this; }
            public RecognitionResult build() {
                RecognitionResult r = new RecognitionResult();
                r.type = type; r.name = name; r.uid = uid; r.className = className;
                r.confidence = confidence; r.message = message;
                return r;
            }
        }

        public String getType() { return type; }
        public String getName() { return name; }
        public String getUid() { return uid; }
        public String getClassName() { return className; }
        public Double getConfidence() { return confidence; }
        public String getMessage() { return message; }
    }
}
