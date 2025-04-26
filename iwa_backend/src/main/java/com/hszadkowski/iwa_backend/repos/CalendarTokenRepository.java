package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.CalendarToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarTokenRepository extends JpaRepository<CalendarToken, Integer> {
}
