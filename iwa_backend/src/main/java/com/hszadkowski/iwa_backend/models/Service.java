package com.hszadkowski.iwa_backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer serviceId;

    private String name;
    private String description;
    private Integer durationMin;
    private BigDecimal price;

    @OneToMany(mappedBy = "service")
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "service")
    private List<AvailabilitySlot> availabilitySlots;
}

