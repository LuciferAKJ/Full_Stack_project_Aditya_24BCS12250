package com.attendai.repository;

import com.attendai.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUid(String uid);
    boolean existsByUid(String uid);
    List<Student> findByClassName(String className);
    List<Student> findByFaceTrainedTrue();

    @Query("SELECT MAX(s.faceLabel) FROM Student s")
    Optional<Integer> findMaxFaceLabel();
}
