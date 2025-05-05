package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;
import com.hszadkowski.iwa_backend.exceptions.UserAlreadyExistsException;
import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import com.hszadkowski.iwa_backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserResponseDto registerUser(RegisterUserRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        String role =
                (request.getRole() != null && !request.getRole().isBlank()) ? request.getRole().trim() : "USER";

        AppUser toSave = AppUser.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .phoneNum(request.getPhoneNum())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        AppUser saved = userRepository.save(toSave);

        return new UserResponseDto(
                saved.getAppUserId(), saved.getName(), saved.getSurname(),
                saved.getEmail(), saved.getPhoneNum(), saved.getRole()
        );
    }
}
