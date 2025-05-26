package com.hszadkowski.iwa_backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class AppointmentNotFoundException extends ResponseStatusException {
    public AppointmentNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
