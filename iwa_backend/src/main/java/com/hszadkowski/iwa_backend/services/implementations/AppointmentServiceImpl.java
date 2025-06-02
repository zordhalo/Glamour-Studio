package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.dto.AppointmentResponseDto;
import com.hszadkowski.iwa_backend.dto.BookAppointmentDto;
import com.hszadkowski.iwa_backend.dto.UpdateAppointmentStatusDto;
import com.hszadkowski.iwa_backend.exceptions.AppointmentNotFoundException;
import com.hszadkowski.iwa_backend.models.*;
import com.hszadkowski.iwa_backend.repos.AppointmentRepository;
import com.hszadkowski.iwa_backend.repos.AppointmentStatusRepository;
import com.hszadkowski.iwa_backend.repos.AvailabilitySlotRepository;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import com.hszadkowski.iwa_backend.services.interfaces.AppointmentService;
import com.hszadkowski.iwa_backend.services.interfaces.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AppointmentStatusRepository appointmentStatusRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final AvailabilityService availabilityService;

    @Override
    public AppointmentResponseDto bookAppointment(BookAppointmentDto request, String userEmail) {

        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found")); // maybe add custom exceptions for this in the future

        if (!availabilityService.canBookSlot(request.getSlotId())) {
            throw new RuntimeException("This time slot is no longer available or has already passed");
        }

        AvailabilitySlot slot = availabilitySlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        if (slot.getIsBooked()) {
            throw new RuntimeException("This time slot is no longer available");
        }

        if (!slot.getService().getServiceId().equals(request.getServiceId())) {
            throw new RuntimeException("Service mismatch with selected slot");
        }

        Service service = slot.getService();

        AppointmentStatus status = appointmentStatusRepository.findByName("CONFIRMED")
                .orElseThrow(() -> new RuntimeException("Default appointment status not found"));

        Appointment appointment = new Appointment();
        appointment.setAppUser(user);
        appointment.setService(service);
        appointment.setStatus(status);
        appointment.setLocation(request.getLocation());
        appointment.setScheduledAt(slot.getStartTime().toLocalDate());
        appointment.setDescription(request.getDescription());
        appointment.setSlot(slot);

        slot.setIsBooked(true);
        availabilitySlotRepository.save(slot);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDto(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getUserAppointments(String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return appointmentRepository.findByAppUser(user)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment with ID " + appointmentId + " not found"));
        return mapToResponseDto(appointment);
    }

    @Override
    public void cancelAppointment(Integer appointmentId, String userEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment with ID " + appointmentId + " not found"));

        if (!appointment.getAppUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You can only cancel your own appointments");
        }

        AppointmentStatus cancelledStatus = appointmentStatusRepository.findByName("CANCELLED")
                .orElseThrow(() -> new RuntimeException("Cancelled status not found"));

        appointment.setStatus(cancelledStatus);
        appointmentRepository.save(appointment);

        releaseSlotForAppointment(appointment);
    }

    @Override
    public AppointmentResponseDto updateAppointmentStatus(Integer appointmentId, UpdateAppointmentStatusDto statusUpdate) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment with ID " + appointmentId + " not found"));

        AppointmentStatus newStatus = appointmentStatusRepository.findByName(statusUpdate.getStatus().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Status '" + statusUpdate.getStatus() + "' not found"));

        if ("CANCELLED".equalsIgnoreCase(statusUpdate.getStatus())) {
            releaseSlotForAppointment(appointment);
        }

        appointment.setStatus(newStatus);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDto(updatedAppointment);
    }

    // Helper methods

    private void releaseSlotForAppointment(Appointment appointment) {
        if (appointment.getSlot() != null) {
            AvailabilitySlot slot = appointment.getSlot();
            slot.setIsBooked(false);
            availabilitySlotRepository.save(slot);
        }
    }

    private AppointmentResponseDto mapToResponseDto(Appointment appointment) {
        return new AppointmentResponseDto(
                appointment.getAppointmentId(),
                appointment.getAppUser().getAppUserId(),
                appointment.getAppUser().getName() + " " + appointment.getAppUser().getSurname(),
                appointment.getService().getServiceId(),
                appointment.getService().getName(),
                appointment.getService().getDescription(),
                appointment.getService().getDurationMin(),
                appointment.getService().getPrice(),
                appointment.getStatus().getName(),
                appointment.getLocation(),
                appointment.getScheduledAt(),
                appointment.getDescription()
        );
    }
}
