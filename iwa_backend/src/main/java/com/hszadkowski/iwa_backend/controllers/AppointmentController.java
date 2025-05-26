package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.AppointmentResponseDto;
import com.hszadkowski.iwa_backend.dto.BookAppointmentDto;
import com.hszadkowski.iwa_backend.dto.UpdateAppointmentStatusDto;
import com.hszadkowski.iwa_backend.services.interfaces.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> bookAppointment(
            @RequestBody @Valid BookAppointmentDto bookingDto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AppointmentResponseDto appointment = appointmentService.bookAppointment(bookingDto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponseDto>> getMyAppointments(Authentication authentication) {
        String userEmail = authentication.getName();
        List<AppointmentResponseDto> appointments = appointmentService.getUserAppointments(userEmail);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}") //maybe some more protection (user can only access his appointments etc.)
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Integer id) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Integer id, 
                                                Authentication authentication) {
        String userEmail = authentication.getName();
        appointmentService.cancelAppointment(id, userEmail);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Integer id,
            @RequestBody @Valid UpdateAppointmentStatusDto statusUpdate) {
        AppointmentResponseDto updatedAppointment = appointmentService.updateAppointmentStatus(id, statusUpdate);
        return ResponseEntity.ok(updatedAppointment);
    }
}
