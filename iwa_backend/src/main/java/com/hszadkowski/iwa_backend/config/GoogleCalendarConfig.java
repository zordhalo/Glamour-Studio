package com.hszadkowski.iwa_backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class GoogleCalendarConfig {

    @Value("${google.calendar.client.id}")
    private String clientId;

    @Value("${google.calendar.client.secret}")
    private String clientSecret;

    @Value("${google.calendar.redirect.uri}")
    private String redirectUri;

    @Value("${google.calendar.scopes}")
    private String scopes;

    @Value("${google.calendar.access.type}")
    private String accessType;
}
