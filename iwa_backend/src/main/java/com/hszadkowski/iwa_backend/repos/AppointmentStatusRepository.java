package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatus, Integer> {
    Optional<AppointmentStatus> findByName(String name);
}
