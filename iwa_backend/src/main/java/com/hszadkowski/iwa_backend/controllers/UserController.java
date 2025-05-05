package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;
import com.hszadkowski.iwa_backend.exceptions.UserAlreadyExistsException;
import com.hszadkowski.iwa_backend.services.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;


@RestController
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto register(@Valid @RequestBody RegisterUserRequestDto request) {
        return userService.registerUser(request);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Void> handleUserExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(303).location(URI.create("/user-already-exist")).build();
    }



}

