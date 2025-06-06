package com.hszadkowski.iwa_backend.repos;

import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.models.CalendarToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CalendarTokenRepository extends JpaRepository<CalendarToken, Integer> {
    Optional<CalendarToken> findByAppUserAndProvider(AppUser appUser, String provider);
    Optional<CalendarToken> findByAppUser(AppUser appUser);
    void deleteByAppUserAndProvider(AppUser appUser, String provider);
}