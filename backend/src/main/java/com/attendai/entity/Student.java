package com.attendai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    @Column(nullable = false)
    private String name;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "face_label")
    private Integer faceLabel;

    @Column(name = "face_count")
    private Integer faceCount = 0;

    @Column(name = "face_trained")
    private Boolean faceTrained = false;

    public Student() {}

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String uid; private String name;
        private String className; private Integer faceLabel;
        private Integer faceCount = 0; private Boolean faceTrained = false;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder uid(String uid) { this.uid = uid; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder className(String className) { this.className = className; return this; }
        public Builder faceLabel(Integer faceLabel) { this.faceLabel = faceLabel; return this; }
        public Builder faceCount(Integer faceCount) { this.faceCount = faceCount; return this; }
        public Builder faceTrained(Boolean faceTrained) { this.faceTrained = faceTrained; return this; }
        public Student build() {
            Student s = new Student();
            s.id = id; s.uid = uid; s.name = name; s.className = className;
            s.faceLabel = faceLabel; s.faceCount = faceCount; s.faceTrained = faceTrained;
            return s;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public Integer getFaceLabel() { return faceLabel; }
    public void setFaceLabel(Integer faceLabel) { this.faceLabel = faceLabel; }
    public Integer getFaceCount() { return faceCount; }
    public void setFaceCount(Integer faceCount) { this.faceCount = faceCount; }
    public Boolean getFaceTrained() { return faceTrained; }
    public void setFaceTrained(Boolean faceTrained) { this.faceTrained = faceTrained; }
}
