package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByAppUser(AppUser appUser);
}
