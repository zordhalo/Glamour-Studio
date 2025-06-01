package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.AvailabilitySlotResponseDto;
import com.hszadkowski.iwa_backend.dto.CreateAvailabilitySlotDto;
import com.hszadkowski.iwa_backend.services.interfaces.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilitySlotsController {

    private final AvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvailabilitySlotResponseDto> createAvailabilitySlot(@RequestBody @Valid CreateAvailabilitySlotDto createAvailabilitySlotDto,
                                                                              Authentication authentication) {
        String adminEmail = authentication.getName();

        AvailabilitySlotResponseDto availabilitySlot = availabilityService.createAvailabilitySlot(createAvailabilitySlotDto, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(availabilitySlot);

    }
}
