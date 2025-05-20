package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.LoginUserDto;
import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.VerifyUserDto;
import com.hszadkowski.iwa_backend.models.AppUser;

public interface AuthenticationService {

    AppUser signUp(RegisterUserRequestDto request);

    AppUser authenticate(LoginUserDto request);

    void verifyUser(VerifyUserDto request);

    void resendVerificationCode(String email);
}
