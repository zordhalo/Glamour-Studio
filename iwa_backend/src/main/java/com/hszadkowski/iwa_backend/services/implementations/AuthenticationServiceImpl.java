package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.dto.LoginUserDto;
import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.VerifyUserDto;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import com.hszadkowski.iwa_backend.services.interfaces.AuthenticationService;
import com.hszadkowski.iwa_backend.services.interfaces.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Override
    public AppUser signUp(RegisterUserRequestDto input) {
        AppUser user = AppUser.builder()
                .name(input.getName())
                .surname(input.getSurname())
                .email(input.getEmail())
                .phoneNum(input.getPhoneNum())
                .passwordHash(passwordEncoder.encode(input.getPassword()))
                .role(input.getRole())
                .build();

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);
        sendVerificationEmail(user);
        return userRepository.save(user);
    }

    @Override
    public AppUser authenticate(LoginUserDto input) {
        AppUser user = userRepository.findByEmail(input.getEmail()).orElseThrow(() -> new RuntimeException("User Not Found"));

        if(!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please verify your account");

        }
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));

        return user;
    }

    @Override
    public void verifyUser(VerifyUserDto input) {
        Optional<AppUser> optionalAppUser = userRepository.findByEmail(input.getEmail());
        if(optionalAppUser.isPresent()) {
            AppUser appUser = optionalAppUser.get();
            if (appUser.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }
            if (appUser.getVerificationCode().equals(input.getVerificationCode())) {
                appUser.setEnabled(true);
                appUser.setVerificationCode(null);
                appUser.setVerificationCodeExpiresAt(null);
                userRepository.save(appUser);
            } else {
                throw new RuntimeException("Invalid verification code");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @Override
    public void resendVerificationCode(String email) {
        Optional<AppUser> optionalAppUser = userRepository.findByEmail(email);
        if(optionalAppUser.isPresent()) {
            AppUser appUser = optionalAppUser.get();
            if (appUser.isEnabled()) {
                throw new RuntimeException("Account is already verified");
            }
            appUser.setVerificationCode(generateVerificationCode());
            appUser.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(appUser);
            userRepository.save(appUser);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    private void sendVerificationEmail(AppUser user) {
        String subject = "Account Verification";
        String verificationCode = "VERIFICATION CODE " + user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            // Handle email sending exception
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
