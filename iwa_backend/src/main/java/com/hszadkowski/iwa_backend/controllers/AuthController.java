package com.hszadkowski.iwa_backend.controllers;

import com.hszadkowski.iwa_backend.dto.*;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.services.interfaces.AuthenticationService;
import com.hszadkowski.iwa_backend.services.interfaces.FacebookService;
import com.hszadkowski.iwa_backend.services.interfaces.JwtService;
import jakarta.servlet.http.HttpServletRequest;
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

    //in the future deactivate the previous jwt token if user generates another - is it needed?

    @PostMapping("/signup")
    public ResponseEntity<UserSignUpResponseDto> register(@RequestBody RegisterUserRequestDto registerUserDto) {
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

    @PostMapping("/pwdresetmail")
    public ResponseEntity<?> sendPasswordResetEmail(@RequestParam String email) {
        try {
            authenticationService.sendPasswordResetEmail(email);
            return ResponseEntity.ok("Password reset email has been sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/pwdreset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDto passwordResetDto) {
        try {
            authenticationService.resetPassword(
                    passwordResetDto.getEmail(),
                    passwordResetDto.getCode(),
                    passwordResetDto.getNewPassword());
            return ResponseEntity.ok("Password has been set successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debugAuth(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Extracted token: " + token.substring(0, Math.min(50, token.length())) + "...");
            
            try {
                String username = jwtService.extractUsername(token);
                System.out.println("Extracted username: " + username);
                return ResponseEntity.ok("Token valid for user: " + username);
            } catch (Exception e) {
                System.out.println("Token extraction error: " + e.getMessage());
                return ResponseEntity.badRequest().body("Token error: " + e.getMessage());
            }
        }
        
        return ResponseEntity.badRequest().body("Authorization header: " + authHeader);
    }
}
