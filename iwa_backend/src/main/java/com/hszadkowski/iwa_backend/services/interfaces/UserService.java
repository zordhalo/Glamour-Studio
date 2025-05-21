package com.hszadkowski.iwa_backend.services.interfaces;

import com.hszadkowski.iwa_backend.dto.FacebookUserDto;
import com.hszadkowski.iwa_backend.dto.RegisterUserRequestDto;
import com.hszadkowski.iwa_backend.dto.UserSignUpResponseDto;

public interface UserService {

   // UserSignUpResponseDto registerUser(RegisterUserRequestDto request);

    UserSignUpResponseDto registerFacebookUser(FacebookUserDto facebookUser);
}
