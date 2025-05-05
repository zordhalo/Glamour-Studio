package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody AppUser appUser) { // TODO: change this to dto
        try {
            String hashPwd = passwordEncoder.encode(appUser.getPasswordHash());
            appUser.setPasswordHash(hashPwd);
            AppUser savedUser = userRepository.save(appUser);

            if (savedUser.getAppUserId() > 0) {
                return ResponseEntity.status(HttpStatus.CREATED).body("User details successfully registered");
            }
            else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User registration failed");
            }
        }
        catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An exception occurred " + ex.getMessage());
        }
    }
}

// TODO: transfer business logic to user service
