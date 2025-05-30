package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.AvailabilitySlotResponseDto;
import com.hszadkowski.iwa_backend.dto.CreateAvailabilitySlotDto;
import com.hszadkowski.iwa_backend.dto.GetAvailableSlotsDto;

import java.util.List;

public interface AvailabilityService {

    AvailabilitySlotResponseDto createAvailabilitySlot(CreateAvailabilitySlotDto dto, String adminEmail);

    List<AvailabilitySlotResponseDto> getAvailableSlots(GetAvailableSlotsDto dto);

    List<AvailabilitySlotResponseDto> getAllSlots();

    void deleteSlot(Integer slotId, String adminEmail);

    AvailabilitySlotResponseDto updateSlot(Integer slotId, CreateAvailabilitySlotDto dto, String adminEmail);

    void markSlotAsBooked(Integer slotId);

    void markSlotAsAvailable(Integer slotId);

    boolean isSlotAvailable(Integer slotId);

    List<AvailabilitySlotResponseDto> getSlotsByService(Integer serviceId);
}
