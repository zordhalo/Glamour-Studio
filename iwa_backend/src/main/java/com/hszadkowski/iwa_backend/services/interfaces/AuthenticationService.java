package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.*;
import com.hszadkowski.iwa_backend.models.AppUser;

public interface AuthenticationService {

    UserSignUpResponseDto signUpFacebookUser(FacebookUserDto facebookUser);

    UserSignUpResponseDto signUp(RegisterUserRequestDto request);

    AppUser authenticate(LoginUserDto request);

    void verifyUser(VerifyUserDto request);

    void resendVerificationCode(String email);
}
