package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;
import com.hszadkowski.iwa_backend.dto.UserSignUpResponseDto;
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
    public ResponseEntity<UserSignUpResponseDto> facebookAuth(@RequestBody FacebookUserDto facebookUserDto) {
        if (!facebookService.validateFacebookToken(facebookUserDto.getAccessToken())) {
            return ResponseEntity.badRequest().build();
        }

        FacebookUserDto validatedUser = facebookService.getFacebookUserInfo(facebookUserDto.getAccessToken());
        if (validatedUser == null) {
            return ResponseEntity.badRequest().build();
        }

        UserSignUpResponseDto userSignUpResponseDto = userService.registerFacebookUser(validatedUser);
        return ResponseEntity.ok(userSignUpResponseDto);
    }
}