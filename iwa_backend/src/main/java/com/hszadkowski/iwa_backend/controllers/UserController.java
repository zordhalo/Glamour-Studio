package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.UserProfileDto;
import com.hszadkowski.iwa_backend.dto.UserProfileUpdateDto;
import com.hszadkowski.iwa_backend.exceptions.UserAlreadyExistsException;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.services.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api")
public class UserController {
    
    private final UserService userService;

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Void> handleUserExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(303).location(URI.create("/user-already-exist")).build();
    }

    // just for testing
    @GetMapping("/me")
    public ResponseEntity<AppUser> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AppUser currentUser = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }
    
    @GetMapping("/users/profile")
    public ResponseEntity<UserProfileDto> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        AppUser user = userService.findByEmail(userEmail);
        UserProfileDto profile = UserProfileDto.builder()
                .name(user.getName())
                .surname(user.getSurname())
                .email(user.getEmail())
                .phoneNum(user.getPhoneNum())
                .build();
                
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/users/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(@Valid @RequestBody UserProfileUpdateDto updateDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        AppUser updatedUser = userService.updateUserProfile(userEmail, updateDto);
        
        UserProfileDto profile = UserProfileDto.builder()
                .name(updatedUser.getName())
                .surname(updatedUser.getSurname())
                .email(updatedUser.getEmail())
                .phoneNum(updatedUser.getPhoneNum())
                .build();
                
        return ResponseEntity.ok(profile);
    }
}
