package com.attendai.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentDTO {

    public static class RegisterRequest {
        @NotBlank private String name;
        @NotBlank private String uid;
        @NotBlank private String className;

        public String getName() { return name; } public void setName(String n) { this.name = n; }
        public String getUid() { return uid; } public void setUid(String u) { this.uid = u; }
        public String getClassName() { return className; } public void setClassName(String c) { this.className = c; }
    }

    public static class Response {
        private Long id; private String uid; private String name;
        private String className; private Integer faceCount;
        private Boolean faceTrained; private Integer faceLabel;

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private Long id; private String uid; private String name;
            private String className; private Integer faceCount;
            private Boolean faceTrained; private Integer faceLabel;

            public Builder id(Long id) { this.id = id; return this; }
            public Builder uid(String uid) { this.uid = uid; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder className(String c) { this.className = c; return this; }
            public Builder faceCount(Integer fc) { this.faceCount = fc; return this; }
            public Builder faceTrained(Boolean ft) { this.faceTrained = ft; return this; }
            public Builder faceLabel(Integer fl) { this.faceLabel = fl; return this; }
            public Response build() {
                Response r = new Response();
                r.id = id; r.uid = uid; r.name = name; r.className = className;
                r.faceCount = faceCount; r.faceTrained = faceTrained; r.faceLabel = faceLabel;
                return r;
            }
        }

        public Long getId() { return id; }
        public String getUid() { return uid; }
        public String getName() { return name; }
        public String getClassName() { return className; }
        public Integer getFaceCount() { return faceCount; }
        public Boolean getFaceTrained() { return faceTrained; }
        public Integer getFaceLabel() { return faceLabel; }
    }
}
