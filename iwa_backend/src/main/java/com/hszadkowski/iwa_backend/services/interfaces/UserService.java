package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserResponseDto;
import com.hszadkowski.iwa_backend.models.AppUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

public interface UserService {

    UserResponseDto registerUser(RegisterUserRequestDto request);
}
