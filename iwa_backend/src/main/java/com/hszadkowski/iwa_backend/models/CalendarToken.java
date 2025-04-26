package com.hszadkowski.iwa_backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "calendar_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tokenId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String provider;
    private String accessToken;
    private String refreshToken;
    private LocalDate expiresAt;
}
