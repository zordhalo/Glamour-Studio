package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;
import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;
import com.hszadkowski.iwa_backend.exceptions.UserAlreadyExistsException;
import com.hszadkowski.iwa_backend.services.interfaces.FacebookService;
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
    private final FacebookService facebookService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto register(@Valid @RequestBody RegisterUserRequestDto request) {
        return userService.registerUser(request);
    }

    @PostMapping("/register/facebook")
    public ResponseEntity<UserResponseDto> registerWithFacebook(@RequestBody FacebookUserDto facebookUser) {
        // Validate the Facebook access token
        if (!facebookService.validateFacebookToken(facebookUser.getAccessToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Get user info from Facebook
        FacebookUserDto validatedUser = facebookService.getFacebookUserInfo(facebookUser.getAccessToken());
        if (validatedUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Register or login the user
        UserResponseDto response = userService.registerFacebookUser(validatedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Void> handleUserExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(303).location(URI.create("/user-already-exist")).build();
    }

}
