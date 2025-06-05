package com.hszadkowski.iwa_backend.services;

import com.hszadkowski.iwa_backend.models.CalendarToken;
import com.hszadkowski.iwa_backend.repos.CalendarTokenRepository;
import com.hszadkowski.iwa_backend.services.interfaces.GoogleCalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarTokenRefreshService {

    private final CalendarTokenRepository calendarTokenRepository;
    private final GoogleCalendarService googleCalendarService;

    /**
     * Runs every hour to check and refresh expiring Google Calendar tokens
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at minute 0
    public void refreshExpiringTokens() {
        log.info("Starting scheduled Google Calendar token refresh...");

        try {
            // Find tokens that expire within the next 2 hours
            LocalDateTime expirationThreshold = LocalDateTime.now().plusHours(2);

            List<CalendarToken> expiringTokens = calendarTokenRepository.findAll()
                    .stream()
                    .filter(token -> "google".equals(token.getProvider()))
                    .filter(token -> token.getExpiresAt().isBefore(expirationThreshold))
                    .toList();

            log.info("Found {} Google Calendar tokens expiring within 2 hours", expiringTokens.size());

            for (CalendarToken token : expiringTokens) {
                try {
                    String userEmail = token.getAppUser().getEmail();
                    googleCalendarService.refreshAccessTokenIfNeeded(userEmail);
                    log.info("Successfully refreshed Google Calendar token for user: {}", userEmail);
                } catch (Exception e) {
                    log.error("Failed to refresh Google Calendar token for user {}: {}",
                            token.getAppUser().getEmail(), e.getMessage());
                    // Token will be removed by the service if refresh fails
                }
            }

            log.info("Completed scheduled Google Calendar token refresh");

        } catch (Exception e) {
            log.error("Error during scheduled token refresh: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up expired tokens that couldn't be refreshed
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired Google Calendar tokens...");

        try {
            LocalDateTime now = LocalDateTime.now();

            List<CalendarToken> expiredTokens = calendarTokenRepository.findAll()
                    .stream()
                    .filter(token -> "google".equals(token.getProvider()))
                    .filter(token -> token.getExpiresAt().isBefore(now))
                    .toList();

            log.info("Found {} expired Google Calendar tokens to clean up", expiredTokens.size());

            for (CalendarToken token : expiredTokens) {
                try {
                    calendarTokenRepository.delete(token);
                    log.info("Cleaned up expired token for user: {}", token.getAppUser().getEmail());
                } catch (Exception e) {
                    log.error("Failed to clean up expired token for user {}: {}",
                            token.getAppUser().getEmail(), e.getMessage());
                }
            }

            log.info("Completed cleanup of expired Google Calendar tokens");

        } catch (Exception e) {
            log.error("Error during expired token cleanup: {}", e.getMessage(), e);
        }
    }
}