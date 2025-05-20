package com.hszadkowski.iwa_backend.config;

import com.hszadkowski.iwa_backend.services.MakeUpUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
@RequiredArgsConstructor
public class UserServiceConfig {

    private final MakeUpUserDetailsService makeUpUserDetailsService;

    @Bean
    public UserDetailsService userDetailsService() {
        return makeUpUserDetailsService;
    }
}