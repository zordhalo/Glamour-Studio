package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.Appointment;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.models.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Integer> {
    Optional<CalendarEvent> findByAppointmentAndProvider(Appointment appointment, String provider);
    List<CalendarEvent> findByAppUserAndProvider(AppUser appUser, String provider);
    Optional<CalendarEvent> findByExternalEventIdAndProvider(String externalEventId, String provider);
    void deleteByAppointmentAndProvider(Appointment appointment, String provider);
}
