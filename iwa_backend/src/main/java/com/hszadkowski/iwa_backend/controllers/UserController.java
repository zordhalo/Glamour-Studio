package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.UserProfileDto;
import com.hszadkowski.iwa_backend.dto.UserProfileUpdateDto;
import com.hszadkowski.iwa_backend.exceptions.UserAlreadyExistsException;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.services.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String userEmail = authentication.getName();
            System.out.println("Getting profile for user: " + userEmail);
            
            AppUser user = userService.findByEmail(userEmail);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            UserProfileDto profile = UserProfileDto.builder()
                    .name(user.getName())
                    .surname(user.getSurname())
                    .email(user.getEmail())
                    .phoneNum(user.getPhoneNum())
                    .build();
                    
            System.out.println("Profile data: " + profile);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            System.err.println("Error getting user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
