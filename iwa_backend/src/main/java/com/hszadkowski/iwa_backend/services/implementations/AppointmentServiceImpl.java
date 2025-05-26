package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.dto.AppointmentResponseDto;
import com.hszadkowski.iwa_backend.dto.BookAppointmentDto;
import com.hszadkowski.iwa_backend.dto.UpdateAppointmentStatusDto;
import com.hszadkowski.iwa_backend.exceptions.AppointmentNotFoundException;
import com.hszadkowski.iwa_backend.exceptions.ServiceDoesNotExistException;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.models.Appointment;
import com.hszadkowski.iwa_backend.models.AppointmentStatus;
import com.hszadkowski.iwa_backend.models.Service;
import com.hszadkowski.iwa_backend.repos.AppointmentRepository;
import com.hszadkowski.iwa_backend.repos.AppointmentStatusRepository;
import com.hszadkowski.iwa_backend.repos.ServiceRepository;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import com.hszadkowski.iwa_backend.services.interfaces.AppointmentService;
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
    private final ServiceRepository serviceRepository;
    private final AppointmentStatusRepository appointmentStatusRepository;

    @Override
    public AppointmentResponseDto bookAppointment(BookAppointmentDto request, String userEmail) {

        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found")); // maybe add custom exceptions for this in the future

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ServiceDoesNotExistException(
                        "Service with ID " + request.getServiceId() + " not found"));

        AppointmentStatus status = appointmentStatusRepository.findByName("PENDING")
                .orElseThrow(() -> new RuntimeException("Default appointment status not found"));

        Appointment appointment = new Appointment();
        appointment.setAppUser(user);
        appointment.setService(service);
        appointment.setStatus(status);
        appointment.setLocation(request.getLocation());
        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setDescription(request.getDescription());

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
    }

    @Override
    public AppointmentResponseDto updateAppointmentStatus(Integer appointmentId, UpdateAppointmentStatusDto statusUpdate) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException(
                        "Appointment with ID " + appointmentId + " not found"));

        AppointmentStatus newStatus = appointmentStatusRepository.findByName(statusUpdate.getStatus().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Status '" + statusUpdate.getStatus() + "' not found"));

        appointment.setStatus(newStatus);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDto(updatedAppointment);
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
