package com.hszadkowski.iwa_backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ErrorController {

    @GetMapping("/user-already-exist")
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> userAlreadyExists() {
        return Map.of("message", "Email is already registered");
    }
}
