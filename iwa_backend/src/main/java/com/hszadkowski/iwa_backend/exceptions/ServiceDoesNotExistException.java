package com.hszadkowski.iwa_backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ServiceDoesNotExistException extends ResponseStatusException {
    public ServiceDoesNotExistException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
