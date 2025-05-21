package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.*;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.services.interfaces.AuthenticationService;
import com.hszadkowski.iwa_backend.services.interfaces.FacebookService;
import com.hszadkowski.iwa_backend.services.interfaces.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final FacebookService facebookService;

    @PostMapping("/signup")
    public ResponseEntity<UserSignUpResponseDto> register(@RequestBody RegisterUserRequestDto registerUserDto) { // dodac default role na user, jesli tego sie nie doda uzytkownik bez roli nie moze sie zalogować
        UserSignUpResponseDto registeredUser = authenticationService.signUp(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/signup/facebook")
    public ResponseEntity<UserSignUpResponseDto> registerWithFacebook(@RequestBody FacebookUserDto facebookUser) {
        if (!facebookService.validateFacebookToken(facebookUser.getAccessToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FacebookUserDto facebookValidatedUser = facebookService.getFacebookUserInfo(facebookUser.getAccessToken());
        if (facebookValidatedUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        UserSignUpResponseDto registeredFacebookUser = authenticationService.signUpFacebookUser(facebookValidatedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredFacebookUser);

    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> authenticate(@RequestBody LoginUserDto loginUserDto) {
        AppUser authenticatedUser = authenticationService.authenticate(loginUserDto);
        UserDetails userDetails = User.builder()
                .username(authenticatedUser.getEmail())
                .password(authenticatedUser.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(authenticatedUser.getRole())))
                .build();
        String jwtToken = jwtService.generateToken(userDetails);
        LoginResponseDto loginResponse = new LoginResponseDto(jwtToken, jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
