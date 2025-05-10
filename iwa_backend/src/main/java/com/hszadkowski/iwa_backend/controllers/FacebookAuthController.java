package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;
import com.hszadkowski.iwa_backend.services.interfaces.FacebookService;
import com.hszadkowski.iwa_backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FacebookAuthController {

    private final UserService userService;
    private final FacebookService facebookService;

    @PostMapping("/api/auth/facebook")
    public ResponseEntity<UserResponseDto> facebookAuth(@RequestBody FacebookUserDto facebookUserDto) {
        // Validate the Facebook access token
        if (!facebookService.validateFacebookToken(facebookUserDto.getAccessToken())) {
            return ResponseEntity.badRequest().build();
        }

        // Get user info from Facebook
        FacebookUserDto validatedUser = facebookService.getFacebookUserInfo(facebookUserDto.getAccessToken());
        if (validatedUser == null) {
            return ResponseEntity.badRequest().build();
        }

        // Register or login the user
        UserResponseDto userResponseDto = userService.registerFacebookUser(validatedUser);
        return ResponseEntity.ok(userResponseDto);
    }
}