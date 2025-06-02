package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.models.Appointment;
import com.hszadkowski.iwa_backend.models.AppointmentStatus;
import com.hszadkowski.iwa_backend.repos.AppointmentRepository;
import com.hszadkowski.iwa_backend.repos.AppointmentStatusRepository;
import com.hszadkowski.iwa_backend.services.interfaces.AppointmentReminderService;
import com.hszadkowski.iwa_backend.services.interfaces.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderServiceImpl implements AppointmentReminderService {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final AppointmentStatusRepository appointmentStatusRepository;

    /**
     * Runs every day at 10:00 AM to send reminders for appointments scheduled for tomorrow
     */
    @Override
    @Scheduled(cron = "0 0 10 * * *") // 10:00 AM daily
    public void sendDailyReminders() {
        log.info("Starting daily appointment reminder process...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Get confirmed status
        AppointmentStatus confirmedStatus = appointmentStatusRepository.findByName("CONFIRMED")
                .orElse(null);

        if (confirmedStatus == null) {
            log.warn("CONFIRMED status not found in database");
            return;
        }

        // Find all confirmed appointments for tomorrow using repository method
        List<Appointment> tomorrowAppointments = appointmentRepository
                .findByScheduledAtAndStatus(tomorrow, confirmedStatus);

        log.info("Found {} confirmed appointments for tomorrow ({})",
                tomorrowAppointments.size(), tomorrow);

        for (Appointment appointment : tomorrowAppointments) {
            try {
                sendReminderEmail(appointment);
                log.info("Reminder sent for appointment ID: {}", appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment ID: {} - Error: {}",
                        appointment.getAppointmentId(), e.getMessage());
            }
        }

        log.info("Daily reminder process completed");
    }

    private void sendReminderEmail(Appointment appointment) {
        try {
            String subject = "Reminder: Your appointment is tomorrow - " + appointment.getService().getName();
            String htmlMessage = buildReminderEmailHtml(appointment);
            emailService.sendVerificationEmail(appointment.getAppUser().getEmail(), subject, htmlMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reminder email", e);
        }
    }

    private String buildReminderEmailHtml(Appointment appointment) {
        LocalDateTime appointmentDateTime = appointment.getSlot().getStartTime();

        return "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">🔔 Appointment Reminder</h2>"
                + "<p style=\"font-size: 16px;\">Hi " + appointment.getAppUser().getName() + ",</p>"
                + "<p style=\"font-size: 16px;\">This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>!</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-left: 4px solid #007bff;\">"
                + "<h3 style=\"color: #333; margin-top: 0;\">Appointment Details:</h3>"
                + "<p><strong>Service:</strong> " + appointment.getService().getName() + "</p>"
                + "<p><strong>Date:</strong> " + appointment.getScheduledAt() + "</p>"
                + "<p><strong>Time:</strong> " + appointmentDateTime.toLocalTime() + "</p>"
                + "<p><strong>Duration:</strong> " + appointment.getService().getDurationMin() + " minutes</p>"
                + "<p><strong>Location:</strong> " + appointment.getLocation() + "</p>"
                + (appointment.getDescription() != null && !appointment.getDescription().trim().isEmpty()
                ? "<p><strong>Notes:</strong> " + appointment.getDescription() + "</p>" : "")
                + "</div>"
                + "<div style=\"background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;\">"
                + "<h4 style=\"color: #1976d2; margin-top: 0;\">💡 Preparation Tips:</h4>"
                + "<ul style=\"color: #333; padding-left: 20px;\">"
                + "<li>Please arrive 5-10 minutes early</li>"
                + "<li>Come with a clean face (if applicable)</li>"
                + "<li>Bring any specific makeup preferences or inspiration photos</li>"
                + "</ul>"
                + "</div>"
                + "<p style=\"font-size: 14px; margin-top: 20px; color: #666;\">"
                + "Need to reschedule or cancel? Please contact us as soon as possible or use your account dashboard."
                + "</p>"
                + "<p style=\"font-size: 14px; color: #666;\">"
                + "We look forward to seeing you tomorrow!"
                + "</p>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}
